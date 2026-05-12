"use client";

import { useState } from "react";
import Link from "next/link";
import UserInfoForm, { UserInfo } from "../components/UserInfoForm";
import RequireAuth from "../components/auth/RequireAuth";

interface HolisticResult {
  summary?: string;
  detail?: Record<string, number>;
  ai_comment?: string;
  level?: number;
}

interface ChoiceItem {
  university: string;
  department: string;
  admission_type: string;
  track_name: string;
}

interface EvaluatedChoice extends ChoiceItem {
  diag_level: string;
  diag_reason: string;
}

interface SessionChoice {
  university: string;
  department: string;
  diag_level: string;
}

interface DiagnosisHistoryItem {
  created: string;
  student_name: string;
  grade: string;
  student_index: number;
  expand?: {
    support_choices_via_session_id?: SessionChoice[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  result?: T;
  universities?: string[];
  evaluated?: EvaluatedChoice[];
}

export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Step 2
  const [documentBase64, setDocumentBase64] = useState("");
  const [documentMimeType, setDocumentMimeType] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [holisticResult, setHolisticResult] = useState<HolisticResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Step 3
  const [universities, setUniversities] = useState<string[]>([]);
  const [choices, setChoices] = useState<ChoiceItem[]>(Array.from({ length: 6 }, () => ({ university: "", department: "", admission_type: "", track_name: "" })));
  const [evaluated, setEvaluated] = useState<EvaluatedChoice[]>([]);
  const [loadingEval, setLoadingEval] = useState(false);
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reportIssueNumber] = useState(() => `SUP-${Date.now().toString().slice(-6)}`);

  const handleNextInfo = (info: UserInfo) => {
    setUserInfo(info);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedMime = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
      if (!allowedMime.includes(file.type)) {
        alert("PDF ?먮뒗 PNG/JPG/WEBP ?뚯씪留??낅줈?쒗븷 ???덉뒿?덈떎.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const base64 = result.split(",")[1];
        setDocumentBase64(base64);
        setDocumentMimeType(file.type);
        setDocumentName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!documentBase64) {
      alert("遺꾩꽍??PDF ?먮뒗 ?대?吏 ?뚯씪??癒쇱? ?낅줈?쒗빐 二쇱꽭??");
      return;
    }
    setLoadingAnalysis(true);
    try {
      const res = await fetch("/api/diagnosis.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_pdf",
          pdf_base64: documentBase64,
          file_mime_type: documentMimeType,
          file_name: documentName,
          ai_enabled: aiEnabled
        })
      });
      const data = (await res.json()) as ApiResponse<HolisticResult & { calculated_gpa?: number }>;
      if (data.success && data.result) {
        setHolisticResult(data.result);
        if (data.result.calculated_gpa && userInfo) {
          setUserInfo({
            ...userInfo,
            studentIndex: data.result.calculated_gpa
          });
          alert(`?숈깮遺 遺꾩꽍 寃곌낵, ?됯퇏 ?댁떊??${data.result.calculated_gpa}?깃툒?쇰줈 ?먮룞 怨꾩궛?섏뼱 諛섏쁺?섏뿀?듬땲??`);
        }
      } else {
        alert("遺꾩꽍 ?ㅻ쪟: " + data.error);
      }
    } catch {
      alert("遺꾩꽍 ?붿껌 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const res = await fetch("/api/diagnosis.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_susi_options" })
      });
      const data = (await res.json()) as ApiResponse<never>;
      if (data.success) {
        setUniversities(data.universities ?? []);
      }
    } catch { }
  };

  const updateChoice = (index: number, field: string, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setChoices(newChoices);
  };

  const handleEvaluate = async () => {
    const validChoices = choices.filter(c => c.university && c.department && c.admission_type && c.track_name);
    if (validChoices.length === 0) {
      alert("理쒖냼 1媛쒖쓽 吏???щ쭩 ????뺣낫瑜?紐⑤몢 ?낅젰?댁＜?몄슂.");
      return;
    }

    setLoadingEval(true);
    try {
      const res = await fetch("/api/diagnosis.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_choices",
          choices: validChoices,
          student_index: userInfo?.studentIndex || 2.5,
          grade: userInfo?.grade || "怨?",
          grading_system: userInfo?.gradingSystem || "9-level"
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluated(data.evaluated);

        // Save session
        await fetch("/api/diagnosis.py", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_session",
            profile: userInfo,
            choices: data.evaluated
          })
        });

        setStep(4);
      } else {
        alert("?ㅻ쪟: " + data.error);
      }
    } catch {
      alert("?됯? ?붿껌 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setLoadingEval(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/platform/history?type=diagnosis");
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        setShowHistory(true);
      }
    } catch {
      alert("?댁뿭??遺덈윭?ㅻ뒗???ㅽ뙣?덉뒿?덈떎.");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("리포트 텍스트를 복사했습니다.");
    } catch {
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <main className="container" style={{ padding: "4rem 2rem", background: "var(--bg-color)", minHeight: "100vh" }}>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const unlock = (el) => {
            if (!el || !el.style) return;
            el.style.userSelect = 'text';
            el.style.webkitUserSelect = 'text';
            if (el.oncopy) el.oncopy = null;
            if (el.onpaste) el.onpaste = null;
            if (el.oncontextmenu) el.oncontextmenu = null;
            if (el.onselectstart) el.onselectstart = null;
          };
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach(node => { if (node.nodeType === 1) { unlock(node); node.querySelectorAll('*').forEach(unlock); } });
              if (mutation.type === 'attributes') unlock(mutation.target);
            });
          });
          observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
          document.querySelectorAll('*').forEach(unlock);
          const allow = (e) => { e.stopImmediatePropagation(); return true; };
          window.addEventListener('copy', allow, true);
          window.addEventListener('paste', allow, true);
          window.addEventListener('contextmenu', allow, true);
          window.addEventListener('selectstart', allow, true);
        })();
      ` }} />

      <Link href="/" style={{ display: "inline-block", marginBottom: "2rem", color: "var(--accent)", fontWeight: 600 }}>
        &larr; ?덉쑝濡??뚯븘媛湲?      </Link>
      
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="page-title" style={{ fontSize: "3rem", color: "var(--accent)" }}>AI ?숈깮遺 吏꾨떒 ?붾（??</h1>
        <p className="page-subtitle" style={{ fontSize: "1.25rem" }}>諛붿씠釉뚯삩 ?섏????뺢탳???곗씠??遺꾩꽍?쇰줈 ?⑷꺽 ?꾨왂???ㅺ퀎?⑸땲??</p>
        <div style={{ marginTop: "1.5rem" }}>
          <button 
            className="btn-primary" 
            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 24px", fontSize: "0.95rem" }}
            onClick={showHistory ? () => setShowHistory(false) : loadHistory}
          >
            {showHistory ? "??吏꾨떒 ?쒖옉?섍린" : "?뱶 怨쇨굅 吏꾨떒 ?댁뿭 ?뺤씤"}
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="glass-card" style={{ background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <h2 style={{ marginBottom: "1.5rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "1rem", color: "var(--accent)" }}>
            ?섏쓽 吏꾨떒 ?덉뒪?좊━
          </h2>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--text-secondary)" }}>??λ맂 ?댁뿭???놁뒿?덈떎. 吏湲?諛붾줈 泥?吏꾨떒???쒖옉??蹂댁꽭??</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {history.map((item, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", opacity: 0.7, fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>{new Date(item.created).toLocaleDateString()}</span>
                    <span>{item.student_name} / {item.grade} / {item.student_index}?깃툒</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.2rem" }}>
                    {item.expand?.support_choices_via_session_id?.map((choice: SessionChoice, i: number) => (
                      <div key={i} style={{ background: "white", padding: "1.2rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", border: "1px solid #eee" }}>
                        <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "1rem" }}>{choice.university}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>{choice.department}</div>
                        <div style={{ marginTop: "10px", fontWeight: 700, color: "var(--accent)", fontSize: "0.9rem" }}>{choice.diag_level}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
        <div className="stepper" style={{ maxWidth: "900px", margin: "0 auto 4rem" }}>
          <div className={`step-item ${step >= 1 ? "active" : ""}`} style={{ borderRadius: "12px 0 0 12px" }}>1. ?ъ슜???뺣낫 ?낅젰</div>
          <div className={`step-item ${step >= 2 ? "active" : ""}`} style={{ borderRadius: "0" }}>2. ?숈깮遺 遺꾩꽍</div>
          <div className={`step-item ${step >= 3 ? "active" : ""}`} style={{ borderRadius: "0" }}>3. ?먭뎄二쇱젣 & ?명듅 李얘린</div>
          <div className={`step-item ${step >= 4 ? "active" : ""}`} style={{ borderRadius: "0 12px 12px 0" }}>4. 醫낇빀 由ы룷??</div>
        </div>

        {step === 1 && <UserInfoForm onNext={handleNextInfo} serviceType="diagnosis" />}

        {step === 2 && (
          <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto", background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginBottom: "1.5rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "1rem", color: "var(--accent)" }}>
              2. ?숈깮遺 ?뺣? 遺꾩꽍
            </h2>
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label" style={{ fontWeight: 700, color: "var(--text-primary)" }}>학생부 PDF 또는 이미지 업로드</label>
              <div style={{ border: "2px dashed #e2e8f0", padding: "3rem", borderRadius: "20px", textAlign: "center", background: "#f8fafc" }}>
                <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={handleFileUpload} style={{ width: "100%", opacity: 1 }} />
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {documentName ? `???좏깮?? ${documentName}` : "?뚯씪???좏깮?섍굅???쒕옒洹명븯???낅줈?쒗븯?몄슂."}
                </p>
              </div>
            </div>

            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem", background: "#f0f7ff", padding: "1rem", borderRadius: "12px" }}>
              <input 
                type="checkbox" 
                checked={aiEnabled} 
                onChange={e => setAiEnabled(e.target.checked)} 
                style={{ width: "20px", height: "20px" }}
              />
              <label className="form-label" style={{ margin: 0, fontWeight: 600, color: "#1e40af" }}>
                怨좉툒 AI OCR 諛??뺣? 遺꾩꽍 紐⑤뱶 ?쒖꽦??(沅뚯옣)
              </label>
            </div>
            
            <button className="btn-primary" onClick={handleAnalyze} disabled={loadingAnalysis} style={{ width: "100%", padding: "20px", fontSize: "1.1rem" }}>
              {loadingAnalysis ? <div className="spinner"></div> : "?숈깮遺 ?곗씠??異붿텧 諛?AI 遺꾩꽍 ?쒖옉"}
            </button>

            {holisticResult && (
              <div style={{ marginTop: "3rem", background: "#f0fdf4", padding: "2rem", borderRadius: "20px", border: "1px solid #bbf7d0" }}>
                <h3 style={{ color: "#166534", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>??</span> 遺꾩꽍???꾨즺?섏뿀?듬땲??                </h3>
                <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem", color: "#1e293b" }}>{holisticResult.summary}</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  {Object.entries(holisticResult.detail || {}).map(([k, v]) => (
                    <div key={k} style={{ background: "white", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{k}</span>
                      <strong style={{ color: "var(--accent)" }}>{String(v)}??</strong>
                    </div>
                  ))}
                </div>
                
                {holisticResult.ai_comment && (
                  <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.6)", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                    <h4 style={{ color: "#16a34a", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 800 }}>AI 醫낇빀 ?뚭껄</h4>
                    <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.6, color: "#334155" }}>{holisticResult.ai_comment}</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem" }}>
              <button className="btn-primary" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} onClick={() => setStep(1)}>
                &larr; ?댁쟾
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  if (universities.length === 0) await fetchUniversities();
                  setStep(3);
                }}
                disabled={!holisticResult}
              >
                ?ㅼ쓬 ?④퀎 (????좏깮) &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card" style={{ background: "white" }}>
            <h2 style={{ marginBottom: "2rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "1rem", color: "var(--accent)" }}>
              3. 吏???щ쭩 ????됯?
            </h2>
            <p style={{ marginBottom: "2rem", color: "var(--text-secondary)" }}>理쒕? 6媛쒖쓽 吏???щ쭩 ??숈쓣 ?낅젰?섏떆硫??⑷꺽 媛?μ꽦???뺣? 吏꾨떒?⑸땲??</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "1.5rem" }}>
              {choices.map((choice, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "24px", height: "24px", background: "var(--accent)", color: "white", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: "0.7rem" }}>{idx + 1}</span>
                    吏??移대뱶
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label">?숆탳紐?</label>
                      <input 
                        type="text" 
                        value={choice.university} 
                        onChange={e => updateChoice(idx, "university", e.target.value)} 
                        placeholder="?? ?쒖슱??숆탳" 
                        list="uni-options"
                        style={{ background: "white" }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">?숆낵紐?</label>
                      <input 
                        type="text" 
                        value={choice.department} 
                        onChange={e => updateChoice(idx, "department", e.target.value)} 
                        placeholder="?? 而댄벂?곌났?숇?" 
                        style={{ background: "white" }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">?꾪삎 ?좏삎</label>
                      <select value={choice.admission_type} onChange={e => updateChoice(idx, "admission_type", e.target.value)} style={{ background: "white" }}>
                        <option value="">?좏깮</option>
                        <option value="?숈깮遺援먭낵">?숈깮遺援먭낵</option>
                        <option value="?숈깮遺醫낇빀">?숈깮遺醫낇빀</option>
                        <option value="?쇱닠">?쇱닠</option>
                        <option value="?ㅺ린/?ㅼ쟻">?ㅺ린/?ㅼ쟻</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">?꾪삎紐?</label>
                      <input 
                        type="text" 
                        value={choice.track_name} 
                        onChange={e => updateChoice(idx, "track_name", e.target.value)} 
                        placeholder="예: 지역균형전형"
                        style={{ background: "white" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <datalist id="uni-options">
              {universities.map(u => <option key={u} value={u} />)}
            </datalist>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem" }}>
              <button className="btn-primary" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} onClick={() => setStep(2)}>
                &larr; ?댁쟾
              </button>
              <button className="btn-primary" onClick={handleEvaluate} disabled={loadingEval} style={{ padding: "16px 40px" }}>
                {loadingEval ? <div className="spinner"></div> : "?됯? ?ㅽ뻾 諛?由ы룷???앹꽦 &rarr;"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="report-container">
            <style jsx global>{`
              @media print {
                body { background: white !important; }
                .no-print, .btn-primary, .stepper { display: none !important; }
                .report-container { padding: 0 !important; }
                .glass-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
              }
            `}</style>

            <div className="glass-card" style={{ padding: "4rem", background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", borderRadius: "30px", border: "1px solid #e2e8f0", minWidth: 0 }}>
              <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
                <button 
                  className="btn-primary" 
                  style={{ background: "#f1f5f9", color: "var(--accent)", border: "1px solid var(--accent)", padding: "10px 20px" }}
                  onClick={() => {
                    const text = `[?移??섑봽由щ쭏 AI 吏꾨떒 由ы룷??\n?숈깮紐? ${userInfo?.studentName}\n醫낇빀 ?됯?: ${holisticResult?.summary}\n\n寃곌낵:\n${evaluated.map(res => `- ${res.university}(${res.department}): ${res.diag_level}`).join("\n")}`.trim();
                    copyToClipboard(text);
                  }}
                >
                  ?뱥 由ы룷???띿뒪??蹂듭궗
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem", borderBottom: "3px solid var(--accent)", paddingBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                  <img src="/suprema-logo.png" alt="Logo" style={{ height: "70px" }} />
                  <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--accent)", margin: 0 }}>?낆떆 ?꾩튂 吏꾨떒 由ы룷??</h1>
                    <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginTop: "0.5rem", letterSpacing: "2px" }}>ADMISSION STRATEGY ANALYSIS</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>諛쒗뻾踰덊샇: {reportIssueNumber}</p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>{userInfo?.studentName} ?숈깮</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "4rem", marginBottom: "4rem" }}>
                <div style={{ background: "#f8fafc", padding: "2.5rem", borderRadius: "30px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ marginBottom: "2rem", fontSize: "1.2rem", color: "var(--text-primary)" }}>??웾 遺꾩꽍 ?ㅼ씠?닿렇??</h3>
                  <div style={{ position: "relative", width: "250px", height: "250px", margin: "0 auto" }}>
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <polygon points="50,5 93,30 93,70 50,95 7,70 7,30" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
                      {(() => {
                        const values = Object.values(holisticResult?.detail || {});
                        const points = values.map((v, i) => {
                          const r = (v / 100) * 45;
                          const deg = i * 72 - 90;
                          return `${50 + r * Math.cos(deg * Math.PI / 180)},${50 + r * Math.sin(deg * Math.PI / 180)}`;
                        }).join(" ");
                        return <polygon points={points} fill="rgba(29, 78, 216, 0.2)" stroke="var(--accent)" strokeWidth="2" />;
                      })()}
                    </svg>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "2rem" }}>
                    {Object.entries(holisticResult?.detail || {}).map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{k}</div>
                        <div style={{ fontWeight: 800, color: "var(--accent)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  <div style={{ background: "#f0f7ff", padding: "2rem", borderRadius: "24px", border: "1px solid #bfdbfe" }}>
                    <h3 style={{ fontSize: "1.1rem", color: "#1e40af", marginBottom: "1rem" }}>醫낇빀 遺꾩꽍 ?섍껄</h3>
                    <p style={{ fontSize: "1.1rem", lineHeight: 1.7, fontWeight: 600, color: "#1e293b" }}>{holisticResult?.summary}</p>
                    <div style={{ marginTop: "1.5rem", padding: "1.2rem", background: "white", borderRadius: "12px", fontSize: "0.95rem", color: "#475569", border: "1px solid #dbeafe" }}>
                      <strong>AI 遺꾩꽍愿 肄붾찘??</strong> {holisticResult?.ai_comment}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "20px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>?댁떊 吏??</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--accent)" }}>{userInfo?.studentIndex}?깃툒</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "20px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>醫낇빀 ?깃툒</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#16a34a" }}>{holisticResult?.level}?④퀎</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem", color: "var(--text-primary)" }}>吏????숇퀎 ?⑷꺽 吏꾨떒</h3>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "24px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "1.5rem", textAlign: "left", color: "#64748b" }}>吏???뺣낫</th>
                      <th style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>吏꾨떒 寃곌낵</th>
                      <th style={{ padding: "1.5rem", textAlign: "left", color: "#64748b" }}>遺꾩꽍 ?뚭껄</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluated.map((res, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "2rem 1.5rem" }}>
                          <div style={{ fontWeight: 800, fontSize: "1.2rem", wordBreak: "keep-all", overflowWrap: "anywhere" }}>{res.university}</div>
                          <div style={{ color: "#64748b", marginTop: "4px", wordBreak: "keep-all", overflowWrap: "anywhere" }}>{res.department}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--accent)", marginTop: "8px", wordBreak: "keep-all", overflowWrap: "anywhere" }}>{res.admission_type} | {res.track_name}</div>
                        </td>
                        <td style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                          <span style={{ 
                            padding: "8px 20px", borderRadius: "100px", fontWeight: 800,
                            background: res.diag_level.includes("?곹뼢") || res.diag_level.includes("?곸젙") ? "#dcfce7" : "#fef3c7",
                            color: res.diag_level.includes("?곹뼢") || res.diag_level.includes("?곸젙") ? "#166534" : "#92400e"
                          }}>
                            {res.diag_level}
                          </span>
                        </td>
                        <td style={{ padding: "2rem 1.5rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#334155", wordBreak: "keep-all", overflowWrap: "anywhere" }}>
                          {res.diag_reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "5rem", borderTop: "2px solid #f1f5f9", paddingTop: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "1rem" }}>?移??섑봽由щ쭏 ?낆떆&肄붿묶?쇳꽣</div>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>?쒖슱??媛뺣궓援??뚰뿤?濡?326 B1F | 010-2370-1077</p>
                </div>
                <img src="/suprema-logo.png" alt="Stamp" style={{ height: "100px", opacity: 0.1, position: "absolute", right: "100px" }} />
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginTop: "4rem" }}>
              <button className="btn-primary" style={{ background: "#f1f5f9", color: "#475569" }} onClick={() => setStep(3)}>?댁쟾 ?④퀎</button>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn-primary" onClick={() => window.print()}>?뼥截?由ы룷??PDF ???/ ?몄뇙</button>
                <Link href="/exploration" className="btn-primary" style={{ background: "#16a34a", textDecoration: "none" }}>?먭뎄 二쇱젣 異붿쿇 諛쏄린 &rarr;</Link>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </main>
  );
}







