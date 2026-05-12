import os
from pocketbase import PocketBase
from datetime import datetime

# 수프리마 플랫폼: PocketBase 클라이언트 (Python용)
# Rule 6: PB 연동 표준 준수

PB_URL = os.environ.get("POCKETBASE_URL", "http://127.0.0.1:8090")

_pb: PocketBase = None

def get_pb() -> PocketBase:
    global _pb
    if _pb is None:
        _pb = PocketBase(PB_URL)
    return _pb

def save_setuk_history(packet: dict) -> None:
    """Save Service 1 (AI Setuk) result to PocketBase"""
    try:
        pb = get_pb()
        # 데이터 구조 변환 (PocketBase는 snake_case 권장)
        data = {
            "teacher_name": packet.get("teacher_name", ""),
            "teacher_school": packet.get("teacher_school", ""),
            "student_name": packet.get("student_name", ""),
            "grade": packet.get("grade", ""),
            "subject": packet.get("subject", ""),
            "interests": packet.get("interests", []),
            "career_hint": packet.get("career_hint", ""),
            "result_count": packet.get("result_count", 0),
            "results": packet.get("results", []),
            "brand": packet.get("brand", "수프리마 AI 탐구 세특 솔루션")
        }
        pb.collection("setuk_history").create(data)
    except Exception as e:
        print(f"PocketBase error (setuk_history): {e}")

def save_diagnosis_session(profile: dict, choices: list) -> str:
    """Save Service 2 (Diagnosis) session to PocketBase"""
    try:
        pb = get_pb()
        
        # 1. diagnosis_sessions 생성
        session_data = {
            "student_name": profile.get("studentName", ""),
            "grade": profile.get("grade", ""),
            "student_index": profile.get("studentIndex", 50),
            "school": profile.get("centerName", ""),
            "consultant_name": profile.get("consultantName", "")
        }
        res = pb.collection("diagnosis_sessions").create(session_data)
        session_id = res.id
        
        # 2. support_choices 생성
        if session_id and choices:
            for i, c in enumerate(choices, start=1):
                choice_data = {
                    "session_id": session_id,
                    "support_no": i,
                    "university": getattr(c, "university", c.get("university") if isinstance(c, dict) else ""),
                    "department": getattr(c, "department", c.get("department") if isinstance(c, dict) else ""),
                    "admission_type": getattr(c, "admission_type", c.get("admission_type") if isinstance(c, dict) else ""),
                    "track_name": getattr(c, "track_name", c.get("track_name") if isinstance(c, dict) else ""),
                    "diag_level": getattr(c, "diag_level", c.get("diag_level") if isinstance(c, dict) else ""),
                    "diag_reason": getattr(c, "diag_reason", c.get("diag_reason") if isinstance(c, dict) else "")
                }
                pb.collection("support_choices").create(choice_data)
        
        return session_id
    except Exception as e:
        print(f"PocketBase error (diagnosis_sessions): {e}")
    return ""
