"use client";

import { Trash2, Plus, ArrowLeft, ArrowRight } from "lucide-react";

interface ChoiceItem {
  university: string;
  department: string;
  admission_type: string;
  track_name: string;
}

interface Step2Props {
  choices: ChoiceItem[];
  userInfo: {
    studentName: string;
    studentIndex: number;
    grade: string;
  } | null;
  uniData: Array<{ name: string; departments: string[] }>;
  updateChoice: (index: number, field: keyof ChoiceItem, value: string) => void;
  resetChoice: (index: number) => void;
  removeChoice: (index: number) => void;
  addChoice: () => void;
  onPrev: () => void;
  onEvaluate: () => void;
}

export default function Step2({
  choices,
  userInfo,
  uniData,
  updateChoice,
  resetChoice,
  removeChoice,
  addChoice,
  onPrev,
  onEvaluate,
}: Step2Props) {
  
  const getDepartmentsForUni = (uniName: string): string[] => {
    const found = uniData.find((u) => u.name === uniName);
    return found ? found.departments : [];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Student Meta Summary */}
      <div style={{
        backgroundColor: "white",
        padding: "12px 24px",
        borderRadius: "16px",
        border: "1px solid #ECE0D1",
        boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#9CA3AF" }}>학생명:</span>
            <span style={{ marginLeft: "6px", fontSize: "13px", fontWeight: "bold", color: "#111827" }}>
              {userInfo?.studentName} 학생 ({userInfo?.grade || "고3"})
            </span>
          </div>
          <div style={{ width: "1px", height: "16px", backgroundColor: "#ECE0D1", alignSelf: "center" }} />
          <div>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#9CA3AF" }}>평균 지표:</span>
            <span style={{ marginLeft: "6px", fontSize: "13px", fontWeight: "black", color: "var(--suprima-burgundy)" }}>
              {userInfo?.studentIndex} 등급
            </span>
          </div>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#6B7280" }}>
          * 목표하는 대학교의 정보를 정확히 입력해주세요. (최대 6개)
        </span>
      </div>

      {/* Grid containing target universities cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px"
      }}>
        {choices.map((choice, idx) => {
          const isCardActive = choice.university !== "" || choice.department !== "";
          const deptList = getDepartmentsForUni(choice.university);

          return (
            <div
              key={idx}
              style={{
                backgroundColor: "white",
                padding: "24px 20px",
                borderRadius: "24px",
                border: isCardActive ? "1px solid rgba(139,26,26,0.3)" : "1px solid #ECE0D1",
                opacity: isCardActive ? 1 : 0.9,
                boxShadow: isCardActive ? "0 10px 30px rgba(139, 26, 26, 0.05)" : "0 4px 10px rgba(0,0,0,0.02)",
                transition: "all 0.3s ease",
                position: "relative"
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: isCardActive ? "var(--suprima-burgundy)" : "#D1D5DB",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "11px"
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#6B7280" }}>희망 대학 {idx + 1}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isCardActive && (
                    <button
                      onClick={() => resetChoice(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9CA3AF",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      초기화
                    </button>
                  )}
                  {choices.length > 2 && (
                    <button
                      onClick={() => removeChoice(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px"
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 삭제
                    </button>
                  )}
                </div>
              </div>

              {/* Content Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                
                {/* University */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "#4B5563", width: "70px", flexShrink: 0 }}>대학교명</label>
                  <input
                    type="text"
                    value={choice.university}
                    onChange={(e) => updateChoice(idx, "university", e.target.value)}
                    placeholder="예: 서울대, 연세대"
                    list="uni-options"
                    style={{
                      flex: 1,
                      height: "38px",
                      padding: "0 12px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Department */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "#4B5563", width: "70px", flexShrink: 0 }}>학과명</label>
                  <input
                    type="text"
                    value={choice.department}
                    onChange={(e) => updateChoice(idx, "department", e.target.value)}
                    placeholder="예: 컴퓨터공학부"
                    list={`dept-options-${idx}`}
                    disabled={!choice.university}
                    style={{
                      flex: 1,
                      height: "38px",
                      padding: "0 12px",
                      backgroundColor: choice.university ? "#F9FAFB" : "#E5E7EB",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      opacity: choice.university ? 1 : 0.6,
                      boxSizing: "border-box"
                    }}
                  />
                  <datalist id={`dept-options-${idx}`}>
                    {deptList.map((d, i) => (
                      <option key={i} value={d} />
                    ))}
                  </datalist>
                </div>

                {/* Admission Type */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "#4B5563", width: "70px", flexShrink: 0 }}>전형 유형</label>
                  <select
                    value={choice.admission_type}
                    onChange={(e) => updateChoice(idx, "admission_type", e.target.value)}
                    style={{
                      flex: 1,
                      height: "38px",
                      padding: "0 12px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="">전형 선택</option>
                    <option value="학생부교과">학생부교과 (내신 위주)</option>
                    <option value="학생부종합">학생부종합 (학생부 비교과)</option>
                    <option value="논술">논술전형</option>
                    <option value="실기/실적">실기/실적 위주</option>
                  </select>
                </div>

                {/* Track Name */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "#4B5563", width: "70px", flexShrink: 0 }}>세부전형명</label>
                  <input
                    type="text"
                    value={choice.track_name}
                    onChange={(e) => updateChoice(idx, "track_name", e.target.value)}
                    placeholder="예: 일반, 지역균형 (선택)"
                    style={{
                      flex: 1,
                      height: "38px",
                      padding: "0 12px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Add College Slot Button */}
      {choices.length < 6 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "12px", marginBottom: "0px" }}>
          <button
            onClick={addChoice}
            style={{
              padding: "16px 36px",
              backgroundColor: "rgba(139, 26, 26, 0.03)",
              border: "2px dashed var(--suprima-burgundy)",
              color: "var(--suprima-burgundy)",
              fontWeight: 900,
              borderRadius: "20px",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(139, 26, 26, 0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(139, 26, 26, 0.03)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus className="w-5 h-5" /> 지원 희망 대학 추가하기 ({choices.length}/6)
          </button>
        </div>
      )}

      {/* Autocomplete list */}
      <datalist id="uni-options">
        {uniData.map((u, i) => (
          <option key={i} value={u.name} />
        ))}
      </datalist>

      {/* Bottom Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #ECE0D1" }}>
        <button
          onClick={onPrev}
          style={{
            padding: "12px 24px",
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            color: "#4B5563",
            fontWeight: "bold",
            borderRadius: "16px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer"
          }}
        >
          <ArrowLeft className="w-4 h-4" /> 이전 단계로
        </button>
        <button
          onClick={onEvaluate}
          className="btn-premium"
          style={{ padding: "14px 36px", fontSize: "14px", cursor: "pointer" }}
        >
          AI 위치 진단 실행 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
