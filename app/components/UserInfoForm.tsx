"use client";

import { useEffect, useState } from "react";

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

export default function UserInfoForm({ onNext, serviceType }: Props) {
  const [mounted, setMounted] = useState(false);
  const [hasSavedInfo, setHasSavedInfo] = useState(false);
  const [info, setInfo] = useState<UserInfo>({
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
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("suprema_user_info");
      if (raw) {
        const saved = JSON.parse(raw) as UserInfo;
        setInfo((prev) => ({ ...prev, ...saved }));
        setHasSavedInfo(Boolean(saved.studentName && saved.schoolName));
      }
    } catch {}
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const update = (key: keyof UserInfo, value: string | number) => {
    setInfo((prev) => ({ ...prev, [key]: value } as UserInfo));
  };

  const submit = () => {
    sessionStorage.setItem("suprema_user_info", JSON.stringify(info));
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
            저장 정보로 계속
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
        <Field label="희망 진로/계열 *" value={info.careerHint} onChange={(v) => update("careerHint", v)} required />

        {serviceType === "diagnosis" ? (
          <>
            <Field
              as="select"
              label="성적 체계 *"
              value={info.gradingSystem || "9-level"}
              onChange={(v) => update("gradingSystem", v as "9-level" | "5-level")}
              options={[
                ["9-level", "기존 9등급"],
                ["5-level", "5등급"],
              ]}
            />
            <Field
              type="number"
              label={`현재 등급 (${info.gradingSystem === "5-level" ? "1~5" : "1~9"}) *`}
              value={String(info.studentIndex ?? "")}
              onChange={(v) => update("studentIndex", Number(v))}
            />
          </>
        ) : null}
      </div>

      <div style={{ marginTop: 24, padding: 18, borderRadius: 20, border: "1px solid #eadfce", background: "#fffaf4" }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#8b1a1a", marginBottom: 8 }}>학생부 PDF 자동 분석</div>
        <div style={{ fontSize: 13, color: "#6c6256", lineHeight: 1.7 }}>
          현재 배포 고정 우선 처리로 업로드 영역은 단순화했습니다. 입력 후 다음 단계로 이동하면 진단 흐름이 이어집니다.
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
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={fieldStyle}
          required={required}
        />
      )}
    </label>
  );
}
