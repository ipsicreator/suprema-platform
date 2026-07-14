type SubjectRow = {
  subject: string;
  grade: number;
  term: string;
  rawScore: number;
  scoreAverage: number;
};

type StudentAnalysisLike = {
  comprehensiveOpinion?: string;
  majorSuitability?: string;
};

type PeerSummary = {
  studentName: string;
  averageGrade: number;
  keywordCount: number;
};

export function buildSubjectComparison(subjects: SubjectRow[], leftSubject: string, rightSubject: string) {
  const left = subjects.find((item) => item.subject === leftSubject);
  const right = subjects.find((item) => item.subject === rightSubject);

  if (!left || !right) {
    return null;
  }

  return {
    left,
    right,
    gradeGapText: `등급 차이 ${Math.abs(left.grade - right.grade).toFixed(2)}`,
    scoreGapText: `원점수 차이 ${Math.abs(left.rawScore - right.rawScore)}`,
  };
}

export function buildRiskSignals(subjects: SubjectRow[], analysis?: StudentAnalysisLike) {
  const risks: string[] = [];

  const weakGrade = subjects.find((item) => item.grade >= 5);
  if (weakGrade) {
    risks.push(`${weakGrade.subject} 과목은 5등급 이상 구간이라 보완이 필요합니다.`);
  }

  const rawScoreGap = subjects.find(
    (item) => item.rawScore > 0 && item.scoreAverage > 0 && item.rawScore < item.scoreAverage - 10,
  );
  if (rawScoreGap) {
    risks.push(`${rawScoreGap.subject} 과목은 원점수가 평균보다 10점 이상 낮아 위험 신호로 봅니다.`);
  }

  if (analysis?.majorSuitability) {
    risks.push(`전공적합성 메모: ${analysis.majorSuitability}`);
  }

  if (analysis?.comprehensiveOpinion) {
    risks.push(`종합 의견 메모: ${analysis.comprehensiveOpinion}`);
  }

  return risks;
}

export function buildPeerComparisonSummary(current: PeerSummary, peer: PeerSummary) {
  return {
    studentNamePair: `${current.studentName} / ${peer.studentName}`,
    gradeGapText: `평균 등급 차이 ${Math.abs(current.averageGrade - peer.averageGrade).toFixed(2)}`,
    keywordGapText: `핵심 키워드 차이 ${Math.abs(current.keywordCount - peer.keywordCount)}개`,
  };
}
