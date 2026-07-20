"use client";

import { useEffect, useState } from "react";
import {
  buildPdfUploadPreview,
  buildPdfUploadSummary,
  mergePdfAnalysisIntoUserInfo,
  resetPdfAnalysisFromUserInfo,
} from "@/lib/pdf-analysis-user-info";
import type { UserInfo } from "@/lib/user-info";

export type { UserInfo } from "@/lib/user-info";

type UploadAnalysisSubject = {
  subject: string;
  unit: number;
  grade: number;
  year?: number;
  semester?: number;
};

interface Props {
  onNext: (info: UserInfo) => void;
  serviceType: "setuk" | "diagnosis";
}

type HealthResponse = {
  pocketbase?: {
    status?: string;
    message?: string;
  };
  mail?: {
    status?: string;
    message?: string;
  };
};

const gradeOptions = ["1학년", "2학년", "3학년"];

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 16px",
  borderRadius: 12,
  border: "2px solid #ece0d1",
  background: "#fffbf5",
  fontSize: 15,
  fontWeight: 600,
  boxSizing: "border-box",
};

const defaultUserInfo: UserInfo = {
  consultantName: "",
  studentName: "",
  schoolName: "",
  grade: "3학년",
  studentPhone: "",
  parentPhone: "",
  email: "",
  studentIndex: 2.5,
  gradingSystem: "9-level",
  careerHint: "",
  parsedSubjects: [],
};

function readInitialUserInfo() {
  if (typeof window === "undefined") return defaultUserInfo;

  try {
    const raw = sessionStorage.getItem("suprema_user_info");
    if (!raw) return defaultUserInfo;
    const saved = JSON.parse(raw) as UserInfo;
    return { ...defaultUserInfo, ...saved };
  } catch {
    return defaultUserInfo;
  }
}

function saveUserInfo(value: UserInfo) {
  sessionStorage.setItem("suprema_user_info", JSON.stringify(value));
}

export default function UserInfoForm({ onNext, serviceType }: Props) {
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const [info, setInfo] = useState<UserInfo>(() => readInitialUserInfo());
  const [healthInfo, setHealthInfo] = useState<HealthResponse | null>(null);
  const hasSavedInfo = Boolean(info.studentName && info.schoolName);

  const pdfSummary = buildPdfUploadSummary(info);
  const pdfPreview = buildPdfUploadPreview(info);

  const update = (key: keyof UserInfo, value: string | number) => {
    setInfo((prev) => ({ ...prev, [key]: value } as UserInfo));
  };

  const readHealth = async () => {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      if (!response.ok) return;
      const result = (await response.json()) as HealthResponse;
      setHealthInfo(result);
    } catch {}
  };

  useEffect(() => {
    const loadHealth = async () => {
      await readHealth();
    };
    void loadHealth();
  }, []);

  const analyzePdf = async () => {
    if (!selectedPdf) {
      setUploadError("PDF 파일을 먼저 선택해 주세요.");
      setUploadMessage("");
      return;
    }

    setAnalyzingPdf(true);
    setUploadError("");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedPdf);
      formData.append("gradingSystem", info.gradingSystem || "9-level");

      const response = await fetch("/api/diagnosis/upload-pdf", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
        gpa?: number;
        subjects?: UploadAnalysisSubject[];
        studentAnalysis?: UserInfo["studentAnalysis"];
      };

      if (!response.ok || !result.success) {
        setUploadError(result.error || result.message || "PDF 분석 중 오류가 발생했습니다.");
        return;
      }

      setInfo((prev) => {
        const next = mergePdfAnalysisIntoUserInfo(prev, {
          success: true,
          gpa: Number(result.gpa || 0),
          subjects: result.subjects || [],
          studentAnalysis: result.studentAnalysis,
          message: result.message || "PDF 분석 완료",
        }) as UserInfo;
        saveUserInfo(next);
        return next;
      });

      setUploadMessage(result.message || "PDF 분석이 완료되었습니다.");
      await readHealth();
    } catch {
      setUploadError("PDF 분석 요청 중 오류가 발생했습니다.");
    } finally {
      setAnalyzingPdf(false);
    }
  };

  const resetPdfAnalysis = () => {
    setInfo((prev) => {
      const next = resetPdfAnalysisFromUserInfo(prev) as UserInfo;
      saveUserInfo(next);
      return next;
    });
    setSelectedPdf(null);
    setUploadMessage("분석 결과를 초기화했습니다.");
    setUploadError("");
  };

  const submit = () => {
    saveUserInfo(info);
    onNext(info);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
        borderRadius: 28,
        border: "1px solid #eadfce",
        background: "#fff",
        boxShadow: "0 18px 50px rgba(44,26,10,0.04)",
      }}
    >
      {hasSavedInfo ? (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            borderRadius: 16,
            border: "1px solid #eadfce",
            background: "#fffaf4",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 800, color: "#8b1a1a" }}>저장된 정보가 있습니다.</div>
          <button
            type="button"
            onClick={submit}
            style={{
              border: "1px solid #8b1a1a",
              background: "#8b1a1a",
              color: "#fff",
              borderRadius: 12,
              padding: "10px 16px",
              fontWeight: 800,
            }}
          >
            저장된 정보로 계속
          </button>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <Field label="컨설턴트명" value={info.consultantName} onChange={(v) => update("consultantName", v)} />
        <Field label="학생 이름 *" value={info.studentName} onChange={(v) => update("studentName", v)} required />
        <Field label="학교명 *" value={info.schoolName} onChange={(v) => update("schoolName", v)} required />
        <Field as="select" label="학년 *" value={info.grade} onChange={(v) => update("grade", v)} options={gradeOptions} />
        <Field label="학생 연락처 *" value={info.studentPhone} onChange={(v) => update("studentPhone", v)} required />
        <Field label="학부모 연락처 *" value={info.parentPhone} onChange={(v) => update("parentPhone", v)} required />
        <Field label="이메일 *" value={info.email} onChange={(v) => update("email", v)} required />
        <Field label="희망 진로/학과 *" value={info.careerHint} onChange={(v) => update("careerHint", v)} required />

        {serviceType === "diagnosis" ? (
          <>
            <Field
              as="select"
              label="등급 체계 *"
              value={info.gradingSystem || "9-level"}
              onChange={(v) => update("gradingSystem", v as "9-level" | "5-level")}
              options={[
                ["9-level", "기존 9등급"],
                ["5-level", "5등급"],
              ]}
            />
            <Field
              type="number"
              label={`현재 내신 등급 (${info.gradingSystem === "5-level" ? "1~5" : "1~9"}) *`}
              value={String(info.studentIndex ?? "")}
              onChange={(v) => update("studentIndex", Number(v))}
            />
          </>
        ) : null}
      </div>

      <div style={{ marginTop: 24, padding: 18, borderRadius: 20, border: "1px solid #eadfce", background: "#fffaf4" }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#8b1a1a", marginBottom: 8 }}>학생부 PDF 자동 분석</div>
        <div style={{ fontSize: 13, color: "#6c6256", lineHeight: 1.7 }}>
          학생부 PDF를 올리면 과목 수, 평균 등급, 핵심 키워드를 먼저 반영합니다.
        </div>

        {healthInfo ? (
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gap: 8,
              borderRadius: 16,
              border: "1px solid #e8dccb",
              background: "#fff",
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, color: "#8b1a1a" }}>운영 상태 안내</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4b5563" }}>
              PDF 저장 경로: {healthInfo.pocketbase?.message || "상태 확인 전"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4b5563" }}>
              메일 발송 경로: {healthInfo.mail?.message || "상태 확인 전"}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setSelectedPdf(event.target.files?.[0] || null);
              setUploadError("");
              setUploadMessage("");
            }}
            style={{ ...fieldStyle, padding: "11px 16px", background: "#fff" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={analyzePdf}
              disabled={analyzingPdf}
              style={{
                border: "none",
                borderRadius: 12,
                background: "#1f6d5c",
                color: "#fff",
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 800,
                opacity: analyzingPdf ? 0.7 : 1,
              }}
            >
              {analyzingPdf ? "PDF 분석 중" : "PDF 분석하기"}
            </button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#6c6256" }}>
              {selectedPdf ? selectedPdf.name : "선택된 PDF 없음"}
            </div>
            {pdfSummary ? (
              <button
                type="button"
                onClick={resetPdfAnalysis}
                style={{
                  border: "1px solid #d9c8b3",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#6c6256",
                  padding: "11px 14px",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                분석 결과 초기화
              </button>
            ) : null}
          </div>
          {pdfSummary ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <SummaryBadge text={pdfSummary.gradeText} />
              <SummaryBadge text={pdfSummary.subjectText} />
              <SummaryBadge text={pdfSummary.keywordText} />
            </div>
          ) : null}
          {pdfPreview ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                borderRadius: 18,
                border: "1px solid #e8dccb",
                background: "#fff",
                padding: 16,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: "#8b1a1a" }}>분석 미리보기</div>
              {pdfPreview.subjects.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {pdfPreview.subjects.map((subject) => (
                    <div
                      key={`${subject.subject}-${subject.semester}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        borderRadius: 14,
                        background: "#fffaf4",
                        padding: "12px 14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1a0f08" }}>{subject.subject}</div>
                        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#6c6256" }}>{subject.semester}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#8b1a1a" }}>{subject.grade}</div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div
                style={{
                  borderRadius: 14,
                  background: "#f8f5ef",
                  padding: "12px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.7,
                  color: "#4b5563",
                }}
              >
                {pdfPreview.opinion}
              </div>
            </div>
          ) : null}
          {uploadMessage ? <StatusMessage tone="success" text={uploadMessage} /> : null}
          {uploadError ? <StatusMessage tone="error" text={uploadError} /> : null}
        </div>
      </div>

      <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
        <button
          type="submit"
          style={{
            border: "none",
            borderRadius: 999,
            background: "#8b1a1a",
            color: "#fff",
            padding: "16px 42px",
            fontSize: 16,
            fontWeight: 900,
            boxShadow: "0 15px 30px rgba(139,26,26,0.18)",
            maxWidth: "100%",
          }}
        >
          다음 단계로 이동
        </button>
      </div>
    </form>
  );
}

function SummaryBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        border: "1px solid #e2d5c3",
        background: "#fff",
        padding: "9px 14px",
        fontSize: 13,
        fontWeight: 800,
        color: "#8b1a1a",
      }}
    >
      {text}
    </span>
  );
}

function StatusMessage({ tone, text }: { tone: "success" | "error"; text: string }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "12px 14px",
        fontSize: 13,
        fontWeight: 800,
        background: tone === "success" ? "#edf8f4" : "#fff1f1",
        color: tone === "success" ? "#166534" : "#b42318",
      }}
    >
      {text}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  as = "input",
  type = "text",
  required = false,
  options = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  as?: "input" | "select";
  type?: string;
  required?: boolean;
  options?: Array<string | [string, string]>;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 900, color: "#1a0f08" }}>{label}</span>
      {as === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} required={required}>
          {options.map((opt) => {
            const [optValue, optLabel] = Array.isArray(opt) ? opt : [opt, opt];
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} required={required} />
      )}
    </label>
  );
}
