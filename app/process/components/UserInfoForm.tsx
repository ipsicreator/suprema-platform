"use client";

import React, { useState } from "react";
import styles from "../process.module.css";

type UserInfoFormData = {
  studentName: string;
  school: string;
  grade: string;
  parentPhone: string;
};

export default function UserInfoForm({ onSubmit }: { onSubmit: (data: UserInfoFormData) => void }) {
  const [formData, setFormData] = useState<UserInfoFormData>({
    studentName: "",
    school: "",
    grade: "3",
    parentPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>사용자 정보 입력</h2>
      <p className={styles.formSubtitle}>진단을 위해 기본 정보를 입력해 주세요.</p>

      <form onSubmit={handleSubmit} className={styles.infoForm}>
        <div className={styles.formGroup}>
          <label htmlFor="studentName">학생 이름</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            placeholder="홍길동"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="school">학교명</label>
          <input
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleChange}
            required
            placeholder="수프리마고등학교"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="grade">학년</label>
          <select id="grade" name="grade" value={formData.grade} onChange={handleChange} required>
            <option value="1">1학년 (5등급제 적용)</option>
            <option value="2">2학년 (5등급제 적용)</option>
            <option value="3">3학년 (9등급제 적용)</option>
            <option value="N">N수생 (9등급제 적용)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="parentPhone">학부모 연락처</label>
          <input
            type="tel"
            id="parentPhone"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={handleChange}
            required
            placeholder="010-0000-0000"
          />
        </div>

        <button type="submit" className={styles.primaryButton}>
          다음 단계로
        </button>
      </form>
    </div>
  );
}
