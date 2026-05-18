export type EngineType = "SEDAN" | "SUV" | "SPORTS" | "OFFROAD";

export type ChoiceKey = "A" | "B" | "C" | "D";

export interface PrismQuestion {
  id: string;
  prompt: string;
  choices: Record<ChoiceKey, string>;
}

export const ENGINE_LABEL: Record<EngineType, string> = {
  SEDAN: "세단형",
  SUV: "SUV형",
  SPORTS: "스포츠카형",
  OFFROAD: "오프로드형",
};

export const ENGINE_TAGLINE: Record<EngineType, string> = {
  SEDAN: "안정·재현·정돈의 기본기 엔진",
  SUV: "맥락·연결·적응의 확장 엔진",
  SPORTS: "속도·도전·압축의 돌파 엔진",
  OFFROAD: "탐색·실험·비정형의 탐구 엔진",
};

export const PRISM_QUESTIONS: PrismQuestion[] = [
  {
    id: "Q01",
    prompt: "새 단원을 시작할 때, 아이가 먼저 하는 행동은?",
    choices: { A: "교과서/개념을 정리한다", B: "예시를 보며 큰 흐름을 잡는다", C: "문제를 바로 풀어본다", D: "다른 방식/도구로 먼저 해본다" },
  },
  {
    id: "Q02",
    prompt: "문장제가 길어지면 가장 자주 나타나는 반응은?",
    choices: { A: "조건을 표시하며 천천히 읽는다", B: "상황을 이야기로 이해한다", C: "감으로 풀고 넘어가려 한다", D: "그림/표를 그리며 풀어본다" },
  },
  {
    id: "Q03",
    prompt: "틀렸을 때 아이의 첫 반응은?",
    choices: { A: "어디서 틀렸는지 찾는다", B: "왜 그런지 맥락을 설명한다", C: "다시 빨리 풀어 재도전한다", D: "다른 방법으로 다시 해본다" },
  },
  {
    id: "Q04",
    prompt: "숙제/과제가 많아지면?",
    choices: { A: "루틴대로 분배해 처리한다", B: "우선순위를 재조정한다", C: "단기간 몰아서 끝내려 한다", D: "흥미 있는 것부터 손댄다" },
  },
  {
    id: "Q05",
    prompt: "설명(서술형)이 필요한 문제에서?",
    choices: { A: "정리된 문장으로 쓰려 한다", B: "이야기처럼 풀어쓴다", C: "답 위주로 간단히 쓴다", D: "그림/도식으로 표현한다" },
  },
  {
    id: "Q06",
    prompt: "수학에서 검산은?",
    choices: { A: "습관적으로 한다", B: "필요할 때만 한다", C: "시간이 없으면 생략한다", D: "다른 풀이로 확인한다" },
  },
  {
    id: "Q07",
    prompt: "낯선 유형 문제가 나오면?",
    choices: { A: "기본 원리를 떠올려 적용한다", B: "비슷한 사례를 연결한다", C: "일단 시도하며 패턴을 찾는다", D: "재미있어 하며 실험한다" },
  },
  {
    id: "Q08",
    prompt: "실수가 반복되는 패턴은?",
    choices: { A: "과잉 확인으로 시간 초과", B: "정리 부족으로 과정 누락", C: "조건/단위 누락", D: "기록이 산만해 채점 손해" },
  },
  {
    id: "Q09",
    prompt: "새 규칙/공식이 나오면?",
    choices: { A: "노트에 정리하고 암기한다", B: "왜 그런지 배경을 궁금해한다", C: "바로 문제에 적용해본다", D: "스스로 변형해본다" },
  },
  {
    id: "Q10",
    prompt: "학원/수업 스타일 선호는?",
    choices: { A: "체계적 커리큘럼", B: "대화형/연결형 수업", C: "문제풀이 강훈련", D: "프로젝트/탐구형" },
  },
  {
    id: "Q11",
    prompt: "성적이 떨어지면?",
    choices: { A: "계획을 재정비한다", B: "원인을 맥락에서 찾는다", C: "더 어려운 걸로 밀어붙인다", D: "방식을 바꿔 새 루트를 찾는다" },
  },
  {
    id: "Q12",
    prompt: "책/자료 읽기에서?",
    choices: { A: "요약하고 정리한다", B: "주제 간 연결을 찾는다", C: "핵심만 빠르게 잡는다", D: "궁금한 곳을 파고든다" },
  },
  {
    id: "Q13",
    prompt: "발표/말하기에서?",
    choices: { A: "준비한 내용대로 한다", B: "상대 반응에 맞춰 설명한다", C: "짧고 강하게 말한다", D: "즉흥적으로 예시를 든다" },
  },
  {
    id: "Q14",
    prompt: "시간 제한이 걸리면?",
    choices: { A: "안정적으로 페이스 유지", B: "상황을 보고 조절", C: "속도를 급격히 올림", D: "유연하게 우회로 선택" },
  },
  {
    id: "Q15",
    prompt: "오답/복기 방식은?",
    choices: { A: "체계적으로 정리", B: "원리와 연결해 정리", C: "재풀이 반복", D: "다른 풀이를 모음" },
  },
  {
    id: "Q16",
    prompt: "탐구/실험 과제에서?",
    choices: { A: "자료를 정돈해 보고서", B: "결과를 의미로 해석", C: "결과를 경쟁적으로 만든다", D: "새로운 시도를 즐긴다" },
  },
  {
    id: "Q17",
    prompt: "교과 간 연결(과학-수학 등)에서?",
    choices: { A: "각 과목을 분리해 정리", B: "연결 포인트를 잘 찾음", C: "어려운 부분만 집중 공략", D: "확장 아이디어가 많음" },
  },
  {
    id: "Q18",
    prompt: "피드백을 받으면?",
    choices: { A: "지적을 반영해 수정", B: "의도/맥락을 설명", C: "다음엔 더 잘 해보려 함", D: "다르게 표현해봄" },
  },
  {
    id: "Q19",
    prompt: "선행을 시키면?",
    choices: { A: "차근차근 따라간다", B: "이해되면 빠르게 확장", C: "속도는 빠르나 구멍이 생김", D: "흥미 없으면 안 붙음" },
  },
  {
    id: "Q20",
    prompt: "문제 풀 때 필기/메모는?",
    choices: { A: "정돈된 메모", B: "핵심 키워드 메모", C: "최소한만", D: "그림/화살표로 자유롭게" },
  },
  {
    id: "Q21",
    prompt: "중요한 시험 전날은?",
    choices: { A: "컨디션과 루틴 유지", B: "범위를 다시 연결", C: "약점만 고속 공략", D: "마음 가는 것부터" },
  },
  {
    id: "Q22",
    prompt: "수학 외 과목(국어/사회)에서?",
    choices: { A: "정리형 학습 강점", B: "서술·연결 강점", C: "요점 압축 강점", D: "탐구·확장 강점" },
  },
  {
    id: "Q23",
    prompt: "어려운 문제를 마주하면?",
    choices: { A: "단계별로 쪼갠다", B: "조건-맥락을 다시 본다", C: "일단 끝까지 밀어본다", D: "새 규칙을 만들어본다" },
  },
  {
    id: "Q24",
    prompt: "학습 동기(스위치)는?",
    choices: { A: "성취 체크와 안정감", B: "의미/목적이 분명할 때", C: "승부/도전 과제가 있을 때", D: "호기심/탐색이 있을 때" },
  },
];

export type PrismAnswers = Record<string, ChoiceKey>;

export interface PrismScore {
  SEDAN: number;
  SUV: number;
  SPORTS: number;
  OFFROAD: number;
}

export const emptyScore = (): PrismScore => ({ SEDAN: 0, SUV: 0, SPORTS: 0, OFFROAD: 0 });

export function scoreAnswers(answers: PrismAnswers): PrismScore {
  const score = emptyScore();
  for (const q of PRISM_QUESTIONS) {
    const picked = answers[q.id];
    if (!picked) continue;
    if (picked === "A") score.SEDAN += 1;
    if (picked === "B") score.SUV += 1;
    if (picked === "C") score.SPORTS += 1;
    if (picked === "D") score.OFFROAD += 1;
  }
  return score;
}

export function resolveEngineType(score: PrismScore): EngineType {
  const entries: Array<[EngineType, number]> = [
    ["SEDAN", score.SEDAN],
    ["SUV", score.SUV],
    ["SPORTS", score.SPORTS],
    ["OFFROAD", score.OFFROAD],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

