# Design Guide (Suprema Platform)

## Overview
- 다크 배경 위 고대비 텍스트, 글로우 포인트를 사용하는 프리미엄 입시 컨설팅 UI를 유지한다.
- 랜딩, 소개, 진단, 리포트까지 동일한 간격/타이포/카드 톤으로 연결한다.
- 모든 주요 텍스트는 한국어 기준으로 줄바꿈 안정성을 우선한다.

## Colors
- Primary Surface: `#030d22`
- Secondary Surface: `#05214b`
- Card Surface: `rgba(9, 18, 34, 0.86)`
- Primary Text: `#f8fbff`
- Secondary Text: `#c5d8ea`
- Accent Cyan: `#7dd3fc`
- Accent Mint: `#5eead4`
- Success Green: `#16a34a`

## Typography
- 기본: `Inter, Noto Sans KR, sans-serif`
- Hero: 34px~74px, line-height 1.03~1.08, letter-spacing -0.03em
- Section Title: 20px~25px, weight 700~800
- Body: 14px~19px, line-height 1.55~1.66

## Elevation
- 카드: 얕은 보더 + 반투명 배경 + 중간 그림자
- Hero/중요 섹션: stronger shadow와 radial glow 조합
- 버튼: 그라디언트(Accent Cyan→Mint) + 미세 hover lift

## Components
- Hero Block: 뱃지 + 대형 헤드라인 + CTA 2개 + KPI 3칸
- Info Panel: 제목 + 리스트 구조 (장점, 준비물)
- Step Flow Card: 번호 배지 + 단계 텍스트 카드
- Report Table: 고정 헤더 + 줄바꿈 안전 텍스트

## Do
- `word-break: keep-all` + `overflow-wrap: anywhere`를 긴 텍스트 구간에 적용
- 모바일 980px 이하에서 grid를 1열로 전환
- 리포트 영역은 `min-width: 0`과 셀 내 줄바꿈 안정 처리

## Don't
- 보라 계열 기본 테마를 사용하지 않는다.
- 기본 시스템 폰트(Arial/Roboto 단독)를 사용하지 않는다.
- 화면별로 완전히 다른 시각 언어를 섞지 않는다.