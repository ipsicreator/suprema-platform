"use client";

const rows = [
  { university: "서울대학교", type: "학생부종합", major: "컴퓨터공학부", cut26: "2.0", cut25: "2.1", cut24: "-", result: "적정" },
  { university: "연세대학교", type: "학생부교과", major: "인공지능학과", cut26: "-", cut25: "1.6", cut24: "1.6", result: "상향" },
  { university: "고려대학교", type: "학교추천", major: "데이터과학과", cut26: "1.9", cut25: "2.0", cut24: "2.1", result: "적정" },
];

export default function GlassReportPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f1eb", padding: "36px 18px" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          background: "#fffdfa",
          borderRadius: 28,
          border: "1px solid #eadfce",
          padding: 32,
          boxShadow: "0 18px 60px rgba(44, 26, 10, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div>
            <p style={{ margin: 0, color: "#8b1a1a", fontWeight: 900, letterSpacing: "0.16em", fontSize: 12 }}>PREMIUM DIAGNOSIS</p>
            <h1 style={{ margin: "12px 0 8px", fontSize: 40, color: "#1f1720" }}>입시위치진단 보고서</h1>
            <p style={{ margin: 0, color: "#6b7280" }}>학생부 분석 결과와 26컷, 25컷, 24컷 판단 기준을 한 화면에 정리합니다.</p>
          </div>
          <button
            onClick={() => window.print()}
            style={{
              background: "#8b1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 18,
              padding: "16px 24px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            인쇄 / PDF 저장
          </button>
        </div>

        <section style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
            <Metric label="학생명" value="김수프" />
            <Metric label="학교" value="수프리마고" />
            <Metric label="학년" value="고3" />
            <Metric label="주요교과 평균" value="2.10" />
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>학생부 요약</h2>
          <p style={paragraph}>교과학습발달상황, 세부능력 및 특기사항, 창의적 체험활동, 행동특성 및 종합의견을 기준으로 판단합니다.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["독서 2등급", "수학 2등급", "영어 1등급", "화학 3등급", "생명과학 2등급"].map((item) => (
              <span key={item} style={chipStyle}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>지원 대학 6개 진단 구조</h2>
          <p style={paragraph}>겉으로는 컷 기준만 보여주고, 실제 최종 판단에는 학생부 원문과 사정관 평가를 함께 반영합니다.</p>

          <div style={{ overflow: "hidden", borderRadius: 20, border: "1px solid #eadfce" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead style={{ background: "#faf6f0", color: "#6b7280" }}>
                <tr>
                  <th style={thStyle}>대학 / 전형 / 학과</th>
                  <th style={thStyle}>26컷</th>
                  <th style={thStyle}>25컷</th>
                  <th style={thStyle}>24컷</th>
                  <th style={thStyle}>판정</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.university}-${row.major}`} style={{ borderTop: "1px solid #f0e7db" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 800, color: "#1f1720" }}>{row.university}</div>
                      <div style={{ color: "#6b7280", fontSize: 14 }}>
                        {row.type} / {row.major}
                      </div>
                    </td>
                    <td style={tdStyle}>{row.cut26}</td>
                    <td style={tdStyle}>{row.cut25}</td>
                    <td style={tdStyle}>{row.cut24}</td>
                    <td style={tdStyle}>
                      <span style={{ ...chipStyle, background: row.result === "상향" ? "#fff1f2" : "#fef2f2", color: "#b91c1c" }}>{row.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 20, borderRadius: 20, border: "1px solid #eadfce", background: "#fff" }}>
      <div style={{ color: "#9ca3af", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{label}</div>
      <div style={{ color: "#1f1720", fontSize: 32, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #eadfce",
  borderRadius: 24,
  padding: 24,
  background: "#fffaf4",
  marginBottom: 20,
} as const;

const sectionTitle = { margin: "0 0 12px", fontSize: 24, color: "#1f1720" } as const;
const paragraph = { margin: "0 0 16px", color: "#6b7280", lineHeight: 1.6 } as const;
const chipStyle = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #eadfce",
  background: "#fff",
  color: "#7c2d12",
  fontWeight: 700,
  fontSize: 14,
} as const;
const thStyle = { textAlign: "left" as const, padding: 16, fontSize: 14, fontWeight: 800 };
const tdStyle = { padding: 16, color: "#374151", verticalAlign: "top" as const };
