"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./UserInfoForm.module.css";

export interface ExtractedSubject {
  subject: string;
  unit: number;
  grade: number;
  year?: number;
  semester?: number;
}

export interface UserInfo {
  consultantName: string;
  studentName: string;
  schoolName: string;
  grade: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  studentIndex?: number;
  gradingSystem?: "9-level" | "5-level";
  careerHint: string;
  hopeDepartment?: string;
  parsedSubjects?: ExtractedSubject[];
  studentAnalysis?: {
    majorField?: string;
    majorSuitability?: string;
    keyKeywords?: string[];
    academicCapacity?: string;
    seTeukAnalysis?: string;
    comprehensiveOpinion?: string;
  };
}

interface Props {
  onNext: (info: UserInfo) => void;
  serviceType: "setuk" | "diagnosis";
}

const gradeOptions = ["고1", "고2", "고3", "N수", "검정고시", "재수", "그 이상"];

export default function UserInfoForm({ onNext, serviceType }: Props) {
  const [hasSavedInfo, setHasSavedInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfProgressText, setPdfProgressText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState<UserInfo>({
    consultantName: "",
    studentName: "",
    schoolName: "",
    grade: "고3",
    studentPhone: "",
    parentPhone: "",
    email: "",
    studentIndex: 2.5,
    gradingSystem: "9-level",
    careerHint: "",
    parsedSubjects: [],
  });

  useEffect(() => {
    const bootstrap = async () => {
      const saved = sessionStorage.getItem("suprema_user_info");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserInfo;
          setInfo((prev) => ({ ...prev, ...parsed }));
          setHasSavedInfo(Boolean(parsed.studentName && parsed.schoolName));
        } catch {}
      }

      try {
        const res = await fetch("/api/platform/profile", { method: "GET" });
        const data = await res.json();
        if (data?.success && data?.profile) {
          setInfo((prev) => ({ ...prev, ...data.profile }));
          setHasSavedInfo(Boolean(data.profile.studentName && data.profile.schoolName));
          sessionStorage.setItem("suprema_user_info", JSON.stringify(data.profile));
        }
      } catch {}

      setMounted(true);
    };

    bootstrap();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [name]: name === "studentIndex" ? Number(value) : value,
    }));
  };

  const handlePDFUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPdfError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsLoadingPDF(true);
    setPdfError(null);
    setPdfProgressText("생활기록부 분석 준비 중...");

    try {
      const extractedText = await extractTextFromPDFClient(file, setPdfProgressText);
      if (!extractedText.trim()) {
        setPdfError("생활기록부에서 텍스트를 추출하지 못했습니다.");
        return;
      }

      setPdfProgressText("원본 PDF 업로드 중...");
      await fetch("/api/diagnosis/upload-configure", { method: "POST" }).catch(() => null);

      const initRes = await fetch("/api/diagnosis/upload-init", { method: "GET" });
      const init = await initRes.json().catch(() => null);
      if (!initRes.ok || !init?.ok || !init?.uploadUrl) {
        setPdfError("업로드 초기화에 실패했습니다.");
        return;
      }

      const uploadFd = new FormData();
      uploadFd.append("file", file);
      uploadFd.append("student_name", info.studentName || "임시학생");
      uploadFd.append("school_name", info.schoolName || "임시학교");

      const uploadRes = await fetch(init.uploadUrl, { method: "POST", body: uploadFd });
      const uploadJson = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadJson?.id) {
        setPdfError(uploadJson?.message || uploadJson?.error || "PDF 업로드에 실패했습니다.");
        return;
      }

      setPdfProgressText("학생부 성적과 분석 결과를 정리 중...");

      const parseRes = await fetch("/api/diagnosis/upload-pdf-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: uploadJson.id,
          gradingSystem: info.gradingSystem || "9-level",
          extractedText,
        }),
      });

      const parseJson = await parseRes.json().catch(() => null);
      if (!parseRes.ok || !parseJson?.success) {
        setPdfError(parseJson?.error || "PDF 분석에 실패했습니다.");
        return;
      }

      setInfo((prev) => ({
        ...prev,
        studentIndex: parseJson.gpa,
        parsedSubjects: Array.isArray(parseJson.subjects) ? parseJson.subjects : [],
        studentAnalysis: parseJson.studentAnalysis,
      }));
    } catch (error) {
      console.error(error);
      setPdfError("PDF 분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingPDF(false);
      setPdfProgressText(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePDFUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePDFUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalInfo = { ...info };

    sessionStorage.setItem("suprema_user_info", JSON.stringify(finalInfo));

    fetch("/api/platform/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalInfo),
    }).catch(() => null);

    onNext(finalInfo);
  };

  const getConvertedGradeText = () => {
    const val = Number(info.studentIndex || 0);
    if (!val || val <= 0 || info.gradingSystem !== "5-level") {
      return "";
    }

    let g9 = 1.0;
    if (val <= 1.0) g9 = 1.0;
    else if (val <= 2.0) g9 = 1.0 + (val - 1.0) * 2.6;
    else if (val <= 3.0) g9 = 3.6 + (val - 2.0) * 2.2;
    else if (val <= 4.0) g9 = 5.8 + (val - 3.0) * 2.0;
    else g9 = 7.8 + (val - 4.0) * 1.2;

    return `5등급제를 9등급제로 환산한 참고 값: ${g9.toFixed(2)}등급`;
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {hasSavedInfo && (
        <div className={styles.saveAlert}>
          <span>이전에 저장된 정보가 있습니다.</span>
          <button type="button" className={styles.alertBtn} onClick={() => onNext(info)}>
            이 정보로 계속 진행
          </button>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>컨설턴트명</label>
          <input type="text" name="consultantName" value={info.consultantName} onChange={handleChange} placeholder="담당 컨설턴트 성함" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>학생 이름 *</label>
          <input type="text" name="studentName" value={info.studentName} onChange={handleChange} placeholder="학생 이름" required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>학교명 *</label>
          <input type="text" name="schoolName" value={info.schoolName} onChange={handleChange} placeholder="학교명" required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>학년 *</label>
          <select name="grade" value={info.grade} onChange={handleChange} required>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>학생 연락처 *</label>
          <input
            type="tel"
            name="studentPhone"
            value={info.studentPhone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
            title="010-0000-0000 형식으로 입력해주세요."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>학부모 연락처 *</label>
          <input
            type="tel"
            name="parentPhone"
            value={info.parentPhone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
            title="010-0000-0000 형식으로 입력해주세요."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>이메일 (보고서 발송용) *</label>
          <input type="email" name="email" value={info.email} onChange={handleChange} placeholder="example@email.com" required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>희망 진로/학과 *</label>
          <input type="text" name="careerHint" value={info.careerHint} onChange={handleChange} placeholder="예: 환경공학, 의예과 등" required />
        </div>

        {serviceType === "diagnosis" && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>등급 체계 *</label>
              <select name="gradingSystem" value={info.gradingSystem} onChange={handleChange} required>
                <option value="9-level">기존 9등급제</option>
                <option value="5-level">내신 5등급제</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>내신 등급 ({info.gradingSystem === "5-level" ? "1~5" : "1~9"}) *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <input
                  type="number"
                  name="studentIndex"
                  value={info.studentIndex}
                  onChange={handleChange}
                  min="1"
                  max={info.gradingSystem === "5-level" ? "5" : "9"}
                  step="0.01"
                  required
                  style={{ width: "100%", margin: 0 }}
                />
                {getConvertedGradeText() && (
                  <span style={{ fontSize: "11.5px", fontWeight: "bold", color: "var(--suprima-burgundy)", marginTop: "6px", display: "block", lineHeight: "1.5" }}>
                    {getConvertedGradeText()}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        <div className={styles.pdfSection}>
          <div className={styles.pdfSectionTitle}>학생부 생활기록부 PDF 자동 성적 분석</div>
          <div className={styles.pdfSectionDesc}>
            학교에서 발급받은 생활기록부 PDF를 올리면 교과 성적을 추출하고 평균 내신과 분석 요약을 자동으로 반영합니다.
          </div>

          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />

          <div
            className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {isLoadingPDF ? (
              <>
                <div className={styles.spinner}></div>
                <div className={styles.loadingText}>{pdfProgressText || "생활기록부 분석 중..."}</div>
              </>
            ) : (
              <>
                <div className={styles.uploadIcon}>PDF</div>
                <div className={styles.uploadText}>학생부 PDF 파일을 드래그하거나 클릭하여 선택하세요</div>
                <div className={styles.uploadSubtext}>원본 파일을 기준으로 성적과 분석 값만 추출합니다.</div>
              </>
            )}
          </div>

          {pdfError && <div className={styles.errorText}>오류: {pdfError}</div>}

          {info.parsedSubjects && info.parsedSubjects.length > 0 && (
            <>
              <div className={styles.successBox}>
                <div className={styles.successHeader}>성적 분석 완료 (자동 계산 내신: {info.studentIndex}등급)</div>
                <div className={styles.badgeList}>
                  {info.parsedSubjects.map((sub, idx) => (
                    <span key={idx} className={styles.badge}>
                      {sub.subject} ({sub.unit}단위/{sub.grade}등급)
                    </span>
                  ))}
                </div>
              </div>

            </>
          )}
        </div>
      </div>

      <div className={styles.formFooter}>
        <button type="submit" className={styles.submitBtn}>
          다음 단계로 이동
        </button>
      </div>
    </form>
  );
}

function loadPDFJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window is not defined"));
      return;
    }
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      try {
        const workerCode = "importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');";
        const blob = new Blob([workerCode], { type: "application/javascript" });
        pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error("PDF.js 로드 실패"));
    document.head.appendChild(script);
  });
}

async function extractTextFromPDFClient(file: File, onProgress: (status: string) => void): Promise<string> {
  onProgress("PDF 라이브러리 초기화 중...");
  const pdfjsLib = await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = "";

  onProgress(`[1/2] 텍스트 추출 중... (${numPages}페이지)`);

  for (let i = 1; i <= numPages; i += 1) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  const subjectKeywords = ["국어", "영어", "수학", "사회", "과학", "물리", "화학", "생명과학", "지구과학"];
  const hasGrades = subjectKeywords.some((kw) => fullText.includes(kw)) && (fullText.includes("단위") || fullText.includes("등급") || fullText.includes("석차"));
  if (hasGrades && fullText.trim().length > 100) {
    return fullText;
  }

  fullText = "";
  const { createWorker } = await import("tesseract.js");
  onProgress("[2/2] OCR 분석 중...");
  const worker = await createWorker("kor+eng", 1, {
    langPath: window.location.origin,
    gzip: false,
  });

  for (let i = 1; i <= numPages; i += 1) {
    onProgress(`[2/2] OCR 처리 중... (${i}/${numPages})`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const {
      data: { text },
    } = await worker.recognize(dataUrl);
    fullText += `\n--- Page ${i} ---\n${text}`;
  }

  await worker.terminate();
  return fullText;
}
