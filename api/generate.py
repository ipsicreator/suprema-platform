from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# Add parent directory to path so imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_setuk_generator import local_generate, UserProfile, load_topic_bank
from utils.pocketbase_client import save_setuk_history
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8'))
        
        try:
            profile_data = payload.get("profile", {})
            profile = UserProfile(
                student_name=profile_data.get("student_name", ""),
                grade=profile_data.get("grade", ""),
                subject=profile_data.get("subject", ""),
                interests=profile_data.get("interests", []),
                career_hint=profile_data.get("career_hint", "융합 탐구")
            )
            
            topic_bank = load_topic_bank()
            
            use_openai = payload.get("use_openai", False)
            recommendation_count = payload.get("recommendation_count", 5)
            strict_dedup = payload.get("strict_dedup", True)
            
            results = local_generate(
                profile=profile,
                topic_bank=topic_bank,
                use_openai=use_openai,
                recommendation_count=recommendation_count,
                strict_dedup=strict_dedup
            )
            
            result_dicts = []
            for r in results:
                result_dicts.append({
                    "subject": r.subject,
                    "topic_title": r.topic_title,
                    "topic_direction": r.topic_direction,
                    "books": r.books,
                    "papers": r.papers,
                    "data_sources": r.data_sources,
                    "expected_conclusion": r.expected_conclusion,
                    "setuk_sentence": r.setuk_sentence
                })
            
            # Create packet for history (PocketBase)
            packet = {
                "created_at": datetime.now().isoformat(timespec="seconds"),
                "brand": payload.get("brand", "수프리마 AI 탐구 세특 솔루션"),
                "teacher_name": payload.get("consultant_name", ""),
                "teacher_school": payload.get("center_name", ""),
                "student_name": profile.student_name,
                "grade": profile.grade,
                "subject": profile.subject,
                "interests": profile.interests,
                "career_hint": profile.career_hint,
                "result_count": len(results),
                "results": result_dicts,
                "profile": profile_data
            }
            
            # Save to PocketBase
            save_setuk_history(packet)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "results": result_dicts, "packet": packet}).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
