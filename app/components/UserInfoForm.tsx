"use client";

import { useEffect, useState } from "react";
import styles from "./UserInfoForm.module.css";

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
  careerHint?: string;
}

interface Props {
  onNext: (info: UserInfo) => void;
  serviceType: "setuk" | "diagnosis";
}

const gradeOptions = ["중1", "중2", "중3", "고1", "고2", "고3", "N수 이상"];

export default function UserInfoForm({ onNext, serviceType }: Props) {
  const [hasSavedInfo, setHasSavedInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    const isHighSchool = info.grade.startsWith("고");
    if (isHighSchool && info.gradingSystem !== "5-level") {
      setInfo((prev) => ({ ...prev, gradingSystem: "5-level" }));
    }
    if (!isHighSchool && info.gradingSystem !== "9-level") {
      setInfo((prev) => ({ ...prev, gradingSystem: "9-level" }));
    }
  }, [info.grade, info.gradingSystem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: name === "studentIndex" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to session storage for persistence within the session
    sessionStorage.setItem("suprema_user_info", JSON.stringify(info));
    
    // Attempt to save to server, but don't block the UI flow (Guest/Demo support)
    fetch("/api/platform/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    }).catch(() => {
      console.log("Profile save failed, proceeding in guest mode.");
    });

    onNext(info);
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
              <option key={grade} value={grade}>{grade}</option>
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
                <option value="5-level">내신 5등급제 (고1·고2)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>내신 등급 ({info.gradingSystem === "5-level" ? "1~5" : "1~9"}) *</label>
              <input
                type="number"
                name="studentIndex"
                value={info.studentIndex}
                onChange={handleChange}
                min="1"
                max={info.gradingSystem === "5-level" ? "5" : "9"}
                step="0.01"
                required
              />
            </div>
          </>
        )}
      </div>

      <div className={styles.formFooter}>
        <button type="submit" className={styles.submitBtn}>
          다음 단계로 이동
        </button>
      </div>
    </form>
  );
}