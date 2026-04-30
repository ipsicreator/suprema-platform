import io
import json
import os
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from pypdf import PdfReader

# We will move the logic from old app.py into this file
from utils.supabase_client import save_diagnosis_session
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

SUSI_2026 = DATA_DIR / "susi_explorer.csv"
CUTOFF_2026 = DATA_DIR / "admission_cutoffs.csv"
SUSI_2027 = DATA_DIR / "susi_explorer_2027.csv"
CUTOFF_2027 = DATA_DIR / "admission_cutoffs_2027.csv"

SEOUL_TOP15 = {
    "서울대", "연세대", "고려대", "서강대", "성균관대",
    "한양대", "중앙대", "경희대", "한국외대", "서울시립대",
    "이화여대", "건국대", "동국대", "홍익대", "숙명여대",
}

def load_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path, encoding="utf-8-sig")

def normalize_university_name(name: str) -> str:
    n = str(name or "").strip().replace(" ", "")
    if "(" in n:
        n = n.split("(", 1)[0]
    n = n.replace("대학교", "대")
    return n

def get_cutoff(cutoffs: pd.DataFrame, uni: str, dept: str, atype: str, track: str):
    if cutoffs.empty:
        return 85.0, 80.0
    uni_norm = normalize_university_name(uni)
    uni_series = cutoffs["university"].astype(str).map(normalize_university_name)
    hit = cutoffs[
        (uni_series == uni_norm)
        & (cutoffs["department"].astype(str) == str(dept))
        & (cutoffs["admission_type"].astype(str) == str(atype))
        & (cutoffs["track_name"].astype(str) == str(track))
    ]
    if hit.empty:
        return 85.0, 80.0
    c50 = hit.loc[hit["percentile_type"] == 50, "cutoff_score"]
    c70 = hit.loc[hit["percentile_type"] == 70, "cutoff_score"]
    return float(c50.iloc[0] if not c50.empty else 85.0), float(c70.iloc[0] if not c70.empty else 80.0)

def rating_4level(student_index: float, cutoff50: float, cutoff70: float):
    if student_index >= cutoff50:
        return "상향 가능", f"학생 지표({student_index:.1f})가 50% 컷({cutoff50:.1f}) 이상입니다."
    if student_index >= cutoff70:
        return "적정", f"학생 지표({student_index:.1f})가 70% 컷({cutoff70:.1f}) 이상입니다."
    if student_index >= cutoff70 - 5:
        return "도전", f"학생 지표({student_index:.1f})가 70% 컷({cutoff70:.1f})에 근접합니다."
    return "하향 권장", f"학생 지표({student_index:.1f})가 70% 컷({cutoff70:.1f}) 대비 낮습니다."

def criteria_basis_for_university(university: str) -> str:
    uni = normalize_university_name(university)
    if uni in {normalize_university_name(x) for x in SEOUL_TOP15}:
        return f"{university} 기준"
    return "경희대 기준(대체)"

def build_ai_holistic_comment(pdf_text: str, level: int, detail: dict) -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        return ""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        detail_text = ", ".join([f"{k}:{v}" for k, v in detail.items()])
        prompt = (
            "학생부 분석 보조 코멘트를 간결하게 작성해줘. "
            "출력 형식: 1) 강점 2줄 2) 보완점 2줄 3) 다음 액션 2줄. "
            f"기본분석 단계={level}, 항목점수={detail_text}. "
            f"학생부 텍스트 샘플={pdf_text[:2800]}"
        )
        res = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=260,
        )
        return res.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        return ""

def analyze_holistic_5level(pdf_text: str):
    text = (pdf_text or "").strip()
    normalized = text.replace(" ", "").replace("\n", "")
    length_bonus = min(18, len(normalized) // 700) if normalized else 0
    baseline = 45 if normalized else 35
    keywords = {
        "학업역량": ["세부능력", "교과", "성취", "수업", "학습", "심화"],
        "전공적합성": ["진로", "전공", "탐구", "관련", "연계", "프로젝트"],
        "자기주도성": ["주도", "기획", "문제해결", "실행", "탐색", "자기주도"],
        "공동체역량": ["협력", "소통", "리더", "봉사", "배려", "팀"],
        "발전가능성": ["성장", "피드백", "개선", "도전", "변화", "발전"],
    }
    per_item = {}
    for key, words in keywords.items():
        cnt = sum(normalized.count(w) for w in words)
        section_bonus = 8 if key in normalized else 0
        per_item[key] = max(20, min(100, baseline + cnt * 7 + length_bonus + section_bonus))

    avg = int(sum(per_item.values()) / len(per_item)) if per_item else baseline
    if avg >= 85: level = 5
    elif avg >= 72: level = 4
    elif avg >= 60: level = 3
    elif avg >= 48: level = 2
    else: level = 1

    if not normalized:
        summary = "PDF 텍스트 추출이 제한되어 중립 기준으로 산정했습니다. (스캔본은 OCR 권장)"
    else:
        summary = f"서울 15개 대학 학생부종합 평가축 기준으로 5단계 중 {level}단계로 추정됩니다."
    return level, per_item, summary

class SupportChoiceTemp:
    def __init__(self, d):
        self.university = d.get('university')
        self.department = d.get('department')
        self.admission_type = d.get('admission_type')
        self.track_name = d.get('track_name')
        self.diag_level = d.get('diag_level')
        self.diag_reason = d.get('diag_reason')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8'))
        action = payload.get("action")
        
        try:
            if action == "analyze_pdf":
                import base64
                pdf_base64 = payload.get("pdf_base64", "")
                ai_enabled = payload.get("ai_enabled", False)
                pdf_text = ""
                if pdf_base64:
                    try:
                        pdf_bytes = base64.b64decode(pdf_base64)
                        reader = PdfReader(io.BytesIO(pdf_bytes))
                        pdf_text = "\n".join((page.extract_text() or "") for page in reader.pages)
                    except Exception as e:
                        print("PDF Extraction Error:", e)
                
                level, detail, summary = analyze_holistic_5level(pdf_text)
                ai_comment = ""
                if ai_enabled:
                    ai_comment = build_ai_holistic_comment(pdf_text, level, detail)
                
                res_data = {
                    "level": level,
                    "detail": detail,
                    "summary": summary,
                    "ai_comment": ai_comment
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "result": res_data}).encode('utf-8'))
                
            elif action == "evaluate_choices":
                choices_raw = payload.get("choices", [])
                student_index = float(payload.get("student_index", 50.0))
                
                # Load cutoff data
                cutoff_2026_df = load_csv(CUTOFF_2026)
                cutoff_2027_df = load_csv(CUTOFF_2027)
                
                # Simple merge logic for this endpoint
                if not cutoff_2027_df.empty:
                    cutoff_df = pd.concat([cutoff_2026_df, cutoff_2027_df], ignore_index=True)
                else:
                    cutoff_df = cutoff_2026_df
                
                evaluated = []
                for c in choices_raw:
                    c50, c70 = get_cutoff(cutoff_df, c["university"], c["department"], c["admission_type"], c["track_name"])
                    level, reason = rating_4level(student_index, c50, c70)
                    basis = criteria_basis_for_university(c["university"])
                    c["diag_level"] = level
                    c["diag_reason"] = f"{reason} | 기준: {basis}"
                    evaluated.append(c)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "evaluated": evaluated}).encode('utf-8'))
                
            elif action == "save_session":
                profile = payload.get("profile", {})
                choices = [SupportChoiceTemp(c) for c in payload.get("choices", [])]
                
                session_id = save_diagnosis_session(profile, choices)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "session_id": session_id}).encode('utf-8'))
                
            elif action == "get_susi_options":
                susi_2026_df = load_csv(SUSI_2026)
                susi_2027_df = load_csv(SUSI_2027)
                if not susi_2027_df.empty:
                    susi_df = pd.concat([susi_2026_df, susi_2027_df], ignore_index=True)
                else:
                    susi_df = susi_2026_df
                
                if susi_df.empty:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "data": []}).encode('utf-8'))
                    return
                    
                # To avoid massive payload, we can group by university
                # For this implementation, we will just return a tree or unique lists
                uni_list = sorted(susi_df["university"].dropna().astype(str).unique().tolist())
                # Just return unique universities, client will request depts based on uni
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "universities": uni_list}).encode('utf-8'))
            
            elif action == "get_dept_options":
                uni = payload.get("university")
                susi_2026_df = load_csv(SUSI_2026)
                susi_2027_df = load_csv(SUSI_2027)
                if not susi_2027_df.empty:
                    susi_df = pd.concat([susi_2026_df, susi_2027_df], ignore_index=True)
                else:
                    susi_df = susi_2026_df
                
                filtered = susi_df[susi_df["university"] == uni]
                depts = sorted(filtered["department"].dropna().astype(str).unique().tolist()) if not filtered.empty else []
                tracks = sorted(filtered["track_name"].dropna().astype(str).unique().tolist()) if not filtered.empty else []
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "departments": depts, "tracks": tracks}).encode('utf-8'))
                
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Invalid action"}).encode('utf-8'))
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
