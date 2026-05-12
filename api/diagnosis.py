import io
import json
import os
import sys
import base64
from datetime import datetime
from http.server import BaseHTTPRequestHandler

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from pypdf import PdfReader

# PocketBase 연동 (수프리마 표준)
from utils.pocketbase_client import save_diagnosis_session
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
        return 3.0, 3.5 # Default grades if no data
    uni_norm = normalize_university_name(uni)
    uni_series = cutoffs["university"].astype(str).map(normalize_university_name)
    hit = cutoffs[
        (uni_series == uni_norm)
        & (cutoffs["department"].astype(str) == str(dept))
        & (cutoffs["admission_type"].astype(str) == str(atype))
        & (cutoffs["track_name"].astype(str) == str(track))
    ]
    if hit.empty:
        return 3.0, 3.5
    c50 = hit.loc[hit["percentile_type"] == 50, "cutoff_score"]
    c70 = hit.loc[hit["percentile_type"] == 70, "cutoff_score"]
    return float(c50.iloc[0] if not c50.empty else 3.0), float(c70.iloc[0] if not c70.empty else 3.5)

def convert_5_to_9(score: float) -> float:
    """
    촘촘한 구간별 보간법을 이용한 5등급제 -> 9등급제 환산 로직.
    """
    x = float(score)
    if x <= 1.0: return 1.0
    if x >= 5.0: return 9.0

    if 1.0 <= x <= 2.0:
        return 1.0 + (x - 1.0) * 1.8
    elif 2.0 < x <= 3.0:
        return 2.8 + (x - 2.0) * 1.9
    elif 3.0 < x <= 4.0:
        return 4.7 + (x - 3.0) * 1.7
    elif 4.0 < x <= 5.0:
        return 6.4 + (x - 4.0) * 2.6 # Adjusted for tail
    
    return 9.0

def rating_4level(student_index: float, cutoff50: float, cutoff70: float):
    # Grades (1.0 is best)
    if student_index <= cutoff50:
        return "상향 가능", f"학생 등급({student_index:.2f})이 50% 컷({cutoff50:.2f})보다 우수하거나 동일합니다."
    if student_index <= cutoff70:
        return "적정", f"학생 등급({student_index:.2f})이 70% 컷({cutoff70:.2f}) 이내입니다."
    if student_index <= cutoff70 + 0.5:
        return "도전", f"학생 등급({student_index:.2f})이 70% 컷({cutoff70:.2f})에 근접합니다."
    return "하향 권장", f"학생 등급({student_index:.2f})이 70% 컷({cutoff70:.2f}) 대비 낮습니다."

def criteria_basis_for_university(university: str) -> str:
    uni = normalize_university_name(university)
    if uni in {normalize_university_name(x) for x in SEOUL_TOP15}:
        return f"{university} 입결 기준"
    return "수프리마 입시 통계 기준"

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

def extract_text_from_image_with_openai(image_base64: str, mime_type: str) -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("이미지 분석을 위해 OPENAI_API_KEY 설정이 필요합니다.")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        data_url = f"data:{mime_type};base64,{image_base64}"
        prompt = "다음 학생부 이미지의 텍스트를 추출해 주세요."
        res = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": data_url}}]}],
            max_tokens=1600,
        )
        return (res.choices[0].message.content or "").strip()
    except Exception as e:
        raise RuntimeError(f"이미지 텍스트 추출 실패: {e}")

def extract_and_calculate_gpa(pdf_text: str):
    """
    AI를 통해 학생부에서 성적표(과목, 단위수, 등급)를 추출하고 GPA를 계산합니다.
    """
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key or not pdf_text:
        return None
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        prompt = (
            "다음은 학생부 텍스트의 일부야. 여기서 '성적/교과 학습 발달 상황' 섹션을 찾아 "
            "모든 과목의 [학기, 과목명, 이수단위, 등급]을 추출해서 JSON으로 줘. "
            "등급이 A/B/C인 진로선택과목은 등급을 0으로 해줘. "
            "출력 형식: {\"grades\": [{\"semester\": \"1-1\", \"subject\": \"국어\", \"credit\": 4, \"score\": 2}, ...]}"
        )
        res = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "너는 입시 성적 추출 전문가야. 오직 JSON만 반환해."},
                {"role": "user", "content": f"{prompt}\n\n[텍스트 샘플]\n{pdf_text[:4000]}"}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(res.choices[0].message.content)
        grades = data.get("grades", [])
        
        if not grades:
            return None
            
        total_points = 0
        total_credits = 0
        for g in grades:
            c = float(g.get("credit", 0))
            s = float(g.get("score", 0))
            if c > 0 and s > 0: # 0등급(진로선택) 제외
                total_points += (c * s)
                total_credits += c
        
        return round(total_points / total_credits, 2) if total_credits > 0 else None
    except Exception as e:
        print(f"GPA Extraction Error: {e}")
        return None

def analyze_holistic_5level(pdf_text: str):
    text = (pdf_text or "").strip()
    normalized = text.replace(" ", "").replace("\n", "")
    length_bonus = min(18, len(normalized) // 700) if normalized else 0
    baseline = 45
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
        per_item[key] = max(20, min(100, baseline + cnt * 7 + length_bonus))
    
    avg = int(sum(per_item.values()) / len(per_item))
    if avg >= 85: level = 5
    elif avg >= 72: level = 4
    elif avg >= 60: level = 3
    elif avg >= 48: level = 2
    else: level = 1
    
    calculated_gpa = extract_and_calculate_gpa(pdf_text)
    
    summary = f"학생부종합 평가축 기준으로 {level}단계 수준입니다."
    if calculated_gpa:
        summary += f" (자동 계산된 평균 내신: {calculated_gpa}등급)"
        
    return level, per_item, summary, calculated_gpa

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
                pdf_base64 = payload.get("pdf_base64", "")
                file_mime_type = payload.get("file_mime_type", "application/pdf")
                ai_enabled = payload.get("ai_enabled", False)
                pdf_text = ""
                if pdf_base64:
                    if file_mime_type == "application/pdf":
                        pdf_bytes = base64.b64decode(pdf_base64)
                        reader = PdfReader(io.BytesIO(pdf_bytes))
                        pdf_text = "\n".join((page.extract_text() or "") for page in reader.pages)
                    else:
                        pdf_text = extract_text_from_image_with_openai(pdf_base64, file_mime_type)
                
                level, detail, summary, calculated_gpa = analyze_holistic_5level(pdf_text)
                ai_comment = build_ai_holistic_comment(pdf_text, level, detail) if ai_enabled else ""
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True, 
                    "result": {
                        "level": level, 
                        "detail": detail, 
                        "summary": summary, 
                        "ai_comment": ai_comment,
                        "calculated_gpa": calculated_gpa
                    }
                }).encode('utf-8'))
                
            elif action == "evaluate_choices":
                choices_raw = payload.get("choices", [])
                student_grade = payload.get("grade", "고3")
                grading_system = payload.get("grading_system", "9-level")
                raw_index = float(payload.get("student_index", 5.0))
                
                student_index = convert_5_to_9(raw_index) if (student_grade in ["고1", "고2"] and grading_system == "5-level") else raw_index
                
                cutoff_df = pd.concat([load_csv(CUTOFF_2026), load_csv(CUTOFF_2027)], ignore_index=True)
                
                evaluated = []
                for c in choices_raw:
                    c50, c70 = get_cutoff(cutoff_df, c["university"], c["department"], c["admission_type"], c["track_name"])
                    level, reason = rating_4level(student_index, c50, c70)
                    c["diag_level"] = level
                    c["diag_reason"] = f"{reason} | 기준: {criteria_basis_for_university(c['university'])}"
                    evaluated.append(c)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True, 
                    "evaluated": evaluated, 
                    "converted_index": round(student_index, 2) if grading_system == "5-level" else None
                }).encode('utf-8'))
                
            elif action == "save_session":
                profile = payload.get("profile", {})
                choices = [SupportChoiceTemp(c) for c in payload.get("choices", [])]
                session_id = save_diagnosis_session(profile, choices)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "session_id": session_id}).encode('utf-8'))
                
            elif action == "get_susi_options":
                susi_df = pd.concat([load_csv(SUSI_2026), load_csv(SUSI_2027)], ignore_index=True)
                uni_list = sorted(susi_df["university"].dropna().astype(str).unique().tolist()) if not susi_df.empty else []
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "universities": uni_list}).encode('utf-8'))
            
            elif action == "get_dept_options":
                uni = payload.get("university")
                susi_df = pd.concat([load_csv(SUSI_2026), load_csv(SUSI_2027)], ignore_index=True)
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
