export type FullChoice = "A" | "B" | "C" | "D";

export type FullDimension =
  | "reading" // 조건 읽기/해석
  | "representation" // 표상 전환(그림/표/식)
  | "inference" // 추론/식화
  | "verification" // 검산/점검
  | "organization" // 정리/요약/기록
  | "stamina" // 지속/페이스/번아웃
  | "exploration"; // 탐구/질문/확장

export interface FullQuestion {
  id: string;
  dimension: FullDimension;
  prompt: string;
  choices: Record<FullChoice, string>;
}

// “본 진단”은 유형 재분류가 목적이 아니라 병목/처방을 만드는 것이 목적.
// A/B/C/D는 점수화가 아니라 “상황 반응”을 구분하는 선택지로 쓰고,
// scoring 단계에서 각 선택을 dimension별 약점 신호로 변환한다.
export const FULL_QUESTIONS_24: FullQuestion[] = [
  {
    id: "F01",
    dimension: "reading",
    prompt: "문장제를 풀 때, 조건을 표시하는 방식은?",
    choices: { A: "표시하고 다시 읽는다", B: "대충 이해하고 넘어간다", C: "읽다가 곧바로 푼다", D: "그림/표를 그리며 정리한다" },
  },
  {
    id: "F02",
    dimension: "reading",
    prompt: "시험에서 ‘아는 내용인데 틀림’이 생길 때 가장 가까운 원인은?",
    choices: { A: "조건/단위 누락", B: "시간 압박", C: "실수/검산 생략", D: "문제 해석 오류" },
  },
  {
    id: "F03",
    dimension: "representation",
    prompt: "그림·표·식 중 가장 편한 방식은?",
    choices: { A: "식", B: "표", C: "그림", D: "상황에 따라 바꾼다" },
  },
  {
    id: "F04",
    dimension: "representation",
    prompt: "풀이가 막히면 보통 어떻게 전환하나요?",
    choices: { A: "식부터 다시 세운다", B: "조건을 다시 읽는다", C: "그림/표로 바꿔본다", D: "다른 문제로 넘어갔다가 온다" },
  },
  {
    id: "F05",
    dimension: "inference",
    prompt: "풀이가 길어지는 편인가요?",
    choices: { A: "짧고 압축적이다", B: "중간 정도", C: "길고 설명이 많다", D: "문제마다 들쭉날쭉" },
  },
  {
    id: "F06",
    dimension: "inference",
    prompt: "수학에서 ‘식 세우기’가 어려운 이유는?",
    choices: { A: "변수/관계를 못 잡음", B: "문장 해석이 늦음", C: "표상 전환이 안 됨", D: "급하게 넘어감" },
  },
  {
    id: "F07",
    dimension: "verification",
    prompt: "검산은 언제 하나요?",
    choices: { A: "항상 한다", B: "시간 남으면 한다", C: "거의 안 한다", D: "다른 풀이로 확인한다" },
  },
  {
    id: "F08",
    dimension: "verification",
    prompt: "실수가 가장 자주 나는 지점은?",
    choices: { A: "조건/단위", B: "계산", C: "중간 과정", D: "마지막 정리" },
  },
  {
    id: "F09",
    dimension: "organization",
    prompt: "오답 정리는 어떤가요?",
    choices: { A: "규칙적으로 한다", B: "필요할 때만 한다", C: "거의 안 한다", D: "정리는 하는데 오래 걸린다" },
  },
  {
    id: "F10",
    dimension: "organization",
    prompt: "서술형/설명형 문제에서 점수를 잃는 이유는?",
    choices: { A: "문장화가 느리다", B: "핵심만 쓰다 누락", C: "과정이 산만", D: "근거를 못 적음" },
  },
  {
    id: "F11",
    dimension: "stamina",
    prompt: "학습이 길어지면 나타나는 패턴은?",
    choices: { A: "페이스 유지", B: "후반에 실수 증가", C: "후반에 집중 급락", D: "후반에 더 빨라짐" },
  },
  {
    id: "F12",
    dimension: "stamina",
    prompt: "번아웃/회피가 생기는 시점은?",
    choices: { A: "과제가 겹칠 때", B: "난도가 갑자기 오를 때", C: "반복이 많을 때", D: "평가가 다가올 때" },
  },
  {
    id: "F13",
    dimension: "exploration",
    prompt: "탐구/프로젝트 과제에서 가장 어려운 것은?",
    choices: { A: "주제(질문) 정하기", B: "자료 조사", C: "정리/보고서", D: "발표/설명" },
  },
  {
    id: "F14",
    dimension: "exploration",
    prompt: "아이의 질문은 어떤 편인가요?",
    choices: { A: "적다", B: "필요할 때만", C: "많다(확장형)", D: "깊게 파고든다" },
  },
  {
    id: "F15",
    dimension: "reading",
    prompt: "문제를 ‘끝까지 읽기 전에’ 풀이를 시작하나요?",
    choices: { A: "거의 없다", B: "가끔 있다", C: "자주 있다", D: "상황에 따라 다르다" },
  },
  {
    id: "F16",
    dimension: "organization",
    prompt: "학습 계획은 어떤 방식인가요?",
    choices: { A: "루틴대로", B: "주간 단위로 조절", C: "그때그때", D: "몰아서" },
  },
  {
    id: "F17",
    dimension: "verification",
    prompt: "시험에서 ‘마지막 5분’은 주로 무엇을 하나요?",
    choices: { A: "검산/점검", B: "남은 문제 풀기", C: "다시 읽기", D: "손 놓음" },
  },
  {
    id: "F18",
    dimension: "representation",
    prompt: "그림/표를 그리면 오히려 시간이 더 걸리나요?",
    choices: { A: "오히려 빨라진다", B: "비슷하다", C: "더 느려진다", D: "문제에 따라 다르다" },
  },
  {
    id: "F19",
    dimension: "inference",
    prompt: "낯선 문제에서 첫 시도는?",
    choices: { A: "원리부터 적용", B: "패턴부터 찾음", C: "예시를 만들어봄", D: "일단 끝까지 밀어봄" },
  },
  {
    id: "F20",
    dimension: "stamina",
    prompt: "학습 동기의 스위치는?",
    choices: { A: "성취 체크", B: "의미/목적", C: "경쟁/도전", D: "호기심" },
  },
  {
    id: "F21",
    dimension: "exploration",
    prompt: "탐구 결과를 ‘한 장’으로 정리할 수 있나요?",
    choices: { A: "쉽다", B: "보통", C: "어렵다", D: "해본 적 없다" },
  },
  {
    id: "F22",
    dimension: "organization",
    prompt: "기록/정리(노트/오답)에서 가장 취약한 것은?",
    choices: { A: "꾸준함", B: "형식/틀", C: "요약/압축", D: "근거/출처" },
  },
  {
    id: "F23",
    dimension: "reading",
    prompt: "문제에서 ‘핵심 조건 2개’를 바로 뽑아낼 수 있나요?",
    choices: { A: "거의 항상", B: "대부분", C: "가끔", D: "자주 놓친다" },
  },
  {
    id: "F24",
    dimension: "verification",
    prompt: "실수 방지 장치가 있나요?",
    choices: { A: "체크리스트가 있다", B: "머릿속으로만", C: "없다", D: "그때그때 만든다" },
  },
];

