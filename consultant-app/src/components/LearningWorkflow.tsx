import React, { useMemo, useState } from 'react';
import './LearningWorkflow.css';

type Stage = 'before' | 'input' | 'progress' | 'result' | 'timeline' | 'deliverable';

type StudentResult = {
  id: string;
  name: string;
  grade: number;
  majorFit: string;
  competency: string;
  finalNote: string;
};

const STAGES: { key: Stage; label: string; description: string }[] = [
  { key: 'before', label: '입력 전', description: '대상 학생과 목표를 확인하고 시작합니다.' },
  { key: 'input', label: '입력', description: '학생 기본정보와 활동 데이터를 입력합니다.' },
  { key: 'progress', label: '진행', description: 'AI 분석 및 교과세특 문장 생성을 수행합니다.' },
  { key: 'result', label: '결과', description: '학생별 최종 문장과 핵심 역량을 검토합니다.' },
  { key: 'timeline', label: '경과', description: '진행 이력과 처리 시간을 확인합니다.' },
  { key: 'deliverable', label: '산출', description: '최종 산출물 목록을 문서 기준으로 확인합니다.' },
];

function createMockStudents(count: number): StudentResult[] {
  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    const score = 83 + (n % 14);
    const fit = ['공학', '의학', '사회과학', '경영', '자연과학'][n % 5];
    const competency = ['문제해결', '탐구', '협업', '의사소통', '자기주도'][n % 5];

    return {
      id: `S-${String(n).padStart(3, '0')}`,
      name: `가상학생_${String(n).padStart(3, '0')}`,
      grade: score,
      majorFit: fit,
      competency,
      finalNote: `${fit} 진로 적합성이 높고 ${competency} 역량이 확인됨.`,
    };
  });
}

const LearningWorkflow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<Stage>('before');
  const [processed, setProcessed] = useState(false);
  const students = useMemo(() => createMockStudents(100), []);

  const shownResults = processed ? students : students.slice(0, 8);

  return (
    <section className="workflow-wrap">
      <header className="workflow-header">
        <h1>교과세특 단계형 실행 화면</h1>
        <p>입력 전부터 산출까지, 화면에서 단계별 상태와 결과를 한 번에 확인합니다.</p>
      </header>

      <nav className="workflow-stage-nav" aria-label="workflow-stages">
        {STAGES.map((stage) => (
          <button
            key={stage.key}
            className={activeStage === stage.key ? 'active' : ''}
            onClick={() => setActiveStage(stage.key)}
            type="button"
          >
            {stage.label}
          </button>
        ))}
      </nav>

      <div className="workflow-stage-card">
        <h2>{STAGES.find((s) => s.key === activeStage)?.label}</h2>
        <p>{STAGES.find((s) => s.key === activeStage)?.description}</p>

        {activeStage === 'before' && (
          <ul className="checklist">
            <li>목표 학년: 고1~고3</li>
            <li>대상 수: 100명 (가상 데이터)</li>
            <li>출력 형식: 학생별 최종 교과세특 문장</li>
          </ul>
        )}

        {activeStage === 'input' && (
          <div className="mini-panel">
            <div><strong>입력 소스</strong>: 학생 기본정보 + 활동기록</div>
            <div><strong>검증 상태</strong>: 형식 검증 통과</div>
            <div><strong>누락 필드</strong>: 없음</div>
          </div>
        )}

        {activeStage === 'progress' && (
          <div className="mini-panel">
            <div><strong>분석 엔진</strong>: PocketBase 데이터 기반 분석 파이프라인</div>
            <div><strong>처리 진행률</strong>: {processed ? '100%' : '8%'}</div>
            <button className="run-btn" type="button" onClick={() => setProcessed(true)}>
              100명 전체 처리 실행
            </button>
          </div>
        )}

        {activeStage === 'timeline' && (
          <div className="mini-panel">
            <div>09:00 데이터 로드</div>
            <div>09:03 입력 검증 완료</div>
            <div>09:08 AI 분석 시작</div>
            <div>09:15 결과 산출 {processed ? '완료' : '진행 중'}</div>
          </div>
        )}

        {activeStage === 'deliverable' && (
          <div className="mini-panel">
            <div><strong>산출 폴더</strong>: docs/final_results_100</div>
            <div><strong>문서 개수</strong>: 100개</div>
            <div><strong>문서명 규칙</strong>: 가상학생_001.md ~ 가상학생_100.md</div>
          </div>
        )}
      </div>

      {(activeStage === 'result' || activeStage === 'deliverable' || activeStage === 'progress') && (
        <div className="result-card">
          <div className="result-head">
            <h3>학생 결과 미리보기</h3>
            <span>{processed ? '100명 전체 반영' : '샘플 8명 표시'}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>학생ID</th>
                  <th>이름</th>
                  <th>점수</th>
                  <th>진로적합</th>
                  <th>핵심역량</th>
                  <th>최종 문장</th>
                </tr>
              </thead>
              <tbody>
                {shownResults.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.grade}</td>
                    <td>{s.majorFit}</td>
                    <td>{s.competency}</td>
                    <td>{s.finalNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default LearningWorkflow;
