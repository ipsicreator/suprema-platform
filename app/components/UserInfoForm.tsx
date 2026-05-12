"use client";

import { useState, useEffect } from "react";

export interface UserInfo {
  consultantName: string;
  studentName: string;
  schoolName: string;
  grade: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  studentIndex?: number; // Internal grade (1.0 - 9.0)
  gradingSystem?: "9-level" | "5-level";
  careerHint?: string;
}

interface Props {
  onNext: (info: UserInfo) => void;
  serviceType: "setuk" | "diagnosis";
}

export default function UserInfoForm({ onNext, serviceType }: Props) {
  const [hasSavedInfo, setHasSavedInfo] = useState(false);
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
    careerHint: ""
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const saved = sessionStorage.getItem("suprema_user_info");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserInfo;
          setInfo(prev => ({ ...prev, ...parsed }));
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

  useEffect(() => {
    const isNewSystem = info.grade === "고1" || info.grade === "고2";
    if (isNewSystem && info.gradingSystem !== "5-level") {
      setInfo(prev => ({ ...prev, gradingSystem: "5-level" }));
    } else if (!isNewSystem && info.gradingSystem === "5-level") {
      setInfo(prev => ({ ...prev, gradingSystem: "9-level" }));
    }
  }, [info.grade]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.studentName || !info.schoolName) {
      alert("학생 이름과 학교명은 필수입니다.");
      return;
    }
    
    sessionStorage.setItem("suprema_user_info", JSON.stringify(info));
    fetch("/api/platform/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    }).catch(() => {});
    onNext(info);
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
        개인정보 입력
      </h2>
      {hasSavedInfo && (
        <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>
          이전에 입력한 공통 사용자 정보가 있습니다.
          <button
            type="button"
            className="btn-primary"
            style={{ marginLeft: "0.75rem", padding: "8px 14px", fontSize: "0.9rem" }}
            onClick={() => onNext(info)}
          >
            이 정보로 바로 시작
          </button>
        </div>
      )}
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">담당 컨설턴트</label>
          <input type="text" name="consultantName" value={info.consultantName} onChange={handleChange} placeholder="컨설턴트 성함" />
        </div>
        <div className="form-group">
          <label className="form-label">학생 이름 *</label>
          <input type="text" name="studentName" value={info.studentName} onChange={handleChange} placeholder="학생 이름" required />
        </div>
        <div className="form-group">
          <label className="form-label">학교명 *</label>
          <input type="text" name="schoolName" value={info.schoolName} onChange={handleChange} placeholder="학교명" required />
        </div>
        <div className="form-group">
          <label className="form-label">학년</label>
          <select name="grade" value={info.grade} onChange={handleChange}>
            <option value="중1">중1</option>
            <option value="중2">중2</option>
            <option value="중3">중3</option>
            <option value="고1">고1</option>
            <option value="고2">고2</option>
            <option value="고3">고3</option>
            <option value="N수이상">N수 이상</option>
          </select>
        </div>
        
        {serviceType === "diagnosis" && (
          <div className="form-group">
            <label className="form-label">등급 체계</label>
            <select name="gradingSystem" value={info.gradingSystem} onChange={handleChange}>
              <option value="9-level">기존 9등급제</option>
              <option value="5-level">신설 5등급제 (고1,2)</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">학생 연락처</label>
          <input type="text" name="studentPhone" value={info.studentPhone} onChange={handleChange} placeholder="010-0000-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">학부모 연락처</label>
          <input type="text" name="parentPhone" value={info.parentPhone} onChange={handleChange} placeholder="010-0000-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input type="email" name="email" value={info.email} onChange={handleChange} placeholder="보고서 발송용" />
        </div>

        {serviceType === "diagnosis" && (
          <div className="form-group">
            <label className="form-label">
              내신 등급 ({info.gradingSystem === "5-level" ? "1~5" : "1~9"}) *
            </label>
            <input 
              type="number" 
              name="studentIndex" 
              value={info.studentIndex} 
              onChange={handleChange} 
              min="1" max={info.gradingSystem === "5-level" ? "5" : "9"} step="0.01" 
              placeholder="예: 1.25"
              required
            />
          </div>
        )}

        {serviceType === "setuk" && (
          <div className="form-group">
            <label className="form-label">희망 진로/학과</label>
            <input 
              type="text" 
              name="careerHint" 
              value={info.careerHint} 
              onChange={handleChange} 
              placeholder="예: 환경공학" 
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <button type="submit" className="btn-primary">
          다음 단계 &rarr;
        </button>
      </div>
    </form>
  );
}
