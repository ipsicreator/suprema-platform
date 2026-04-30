import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ksvbyvvzppiqymgrxzdw.supabase.co")
# Fallback to the key provided by the user if not in env
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdmJ5dnZ6cHBpcXltZ3J4emR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTcwMTEsImV4cCI6MjA5MTY5MzAxMX0.fEhva_0ESbrn2xQ6BSBsvAuqOacjl5JYVMfTA88J1qg")

_supabase: Client = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase

def save_setuk_history(packet: dict) -> None:
    """Save Service 1 (AI Setuk) result to Supabase"""
    try:
        supabase = get_supabase()
        supabase.table("setuk_history").insert(packet).execute()
    except Exception as e:
        print(f"Supabase error: {e}")

def save_diagnosis_session(payload: dict, choices: list) -> int:
    """Save Service 2 (Diagnosis) session to Supabase"""
    try:
        supabase = get_supabase()
        res = supabase.table("diagnosis_sessions").insert(payload).execute()
        
        # If successfully inserted, get ID and insert choices
        if res.data and len(res.data) > 0:
            session_id = res.data[0].get("id")
            
            if session_id and choices:
                choices_data = []
                for i, c in enumerate(choices, start=1):
                    choices_data.append({
                        "session_id": session_id,
                        "support_no": i,
                        "university": c.university,
                        "department": c.department,
                        "admission_type": c.admission_type,
                        "track_name": c.track_name,
                        "diag_level": c.diag_level,
                        "diag_reason": c.diag_reason
                    })
                supabase.table("support_choices").insert(choices_data).execute()
            
            return session_id
    except Exception as e:
        print(f"Supabase error: {e}")
    return -1
