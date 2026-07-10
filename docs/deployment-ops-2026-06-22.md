# 나의 입시멘토 배포/운영 문서

기준일: 2026-06-22

## 1. 배포 개요

현재 앱은 Next.js App Router 기반이며, Vercel 배포를 전제로 한다.  
진단 흐름 1~4단계는 프론트 화면과 API 라우트를 함께 사용한다.

## 2. 주요 API 라우트

### 진단 관련

- `/api/diagnosis`
- `/api/diagnosis-comprehensive`
- `/api/diagnosis/exploration-topics`
- `/api/diagnosis/upload-configure`
- `/api/diagnosis/upload-init`
- `/api/diagnosis/upload-pdf`
- `/api/diagnosis/upload-pdf-record`

### 프로필/플랫폼 관련

- `/api/platform/profile`
- `/api/platform/history`
- `/api/platform/keywords`
- `/api/platform/materials`
- `/api/platform/topics`
- `/api/platform/usage`
- `/api/platform/billing`
- `/api/platform/billing/confirm`
- `/api/platform/admin/orders`

### 공통/기타

- `/api/send-email`
- `/api/health`
- `/api/upload`
- `/api/topics`
- `/api/universities`
- `/api/solution`
- `/api/profiles`

### 인증/결제/웹훅

- `/api/auth/[...nextauth]`
- `/api/auth/[provider]`
- `/api/webhooks/toss`

## 3. 핵심 연동 구조

### 3.1 인증

- 파일: `auth.ts`
- NextAuth 사용
- `trustHost: true`
- 세션 전략: `jwt`
- 로컬 개발에서는 `AUTH_SECRET` 또는 `NEXTAUTH_SECRET` 미설정 시 로컬 기본값 사용
- 소셜 로그인 공급자:
  - Google
  - Naver
  - Kakao
- 각 공급자는 환경변수가 있을 때만 활성화

### 3.2 학생부 PDF 업로드

- 업로드 흐름:
  1. `/api/diagnosis/upload-configure`
  2. `/api/diagnosis/upload-init`
  3. PocketBase 컬렉션 업로드
  4. `/api/diagnosis/upload-pdf-record`
- PocketBase 컬렉션명:
  - `suprema_pdf_uploads`
- 목적:
  - Vercel 요청 크기 제한을 우회하고 브라우저에서 직접 업로드 처리

### 3.3 탐구/세특 주제 생성

- 파일: `app/api/diagnosis/exploration-topics/route.ts`
- 과목명 정규화 후 주제 추천
- 반환 데이터:
  - `topic_title`
  - `topic_direction`
  - `books`
  - `papers`
  - `data_sources`
  - `expected_conclusion`
  - `setuk_sentence`

### 3.4 메일 발송

- 파일: `app/api/send-email/route.ts`
- 1차 경로:
  - Resend API 발송
- 2차 경로:
  - 메일 설정이 없으면 `.cache/suprema-platform/outbox` 에 JSON 저장
- 단계별 메일 제목:
  - 학생부 분석 보고서
  - 탐구/독서 제안 보고서
  - 입시위치 진단 보고서

### 3.5 결제

- 파일: `app/api/platform/billing/route.ts`
- 결제 요청 생성, 가격 수정, 주문 정보 관리
- Toss confirm/webhook 라우트 별도 존재

## 4. 환경변수 목록

### 4.1 인증

- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`

### 4.2 PocketBase

- `PB_URL`
- `NEXT_PUBLIC_PB_URL`
- `PB_ADMIN_EMAIL`
- `PB_ADMIN_PASSWORD`

### 4.3 AI/추천

- `GEMINI_API_KEY`

### 4.4 메일

- `RESEND_API_KEY`
- `REPORT_FROM_EMAIL`
- `RESEND_FROM_EMAIL`

### 4.5 결제/운영

- `TOSS_SECRET_KEY`
- `TOSS_WEBHOOK_SECRET`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `NEXT_PUBLIC_ADMIN_EMAILS`

### 4.6 Vercel 참고

- `VERCEL_ENV`
- `VERCEL_GIT_COMMIT_SHA`
- `VERCEL_GIT_COMMIT_REF`

## 5. Vercel 등록 시 점검 항목

### 필수

- Next.js 빌드 성공
- PocketBase URL 등록
- 메일 발송 키 등록 여부 확인
- 인증용 시크릿 등록

### 선택

- Google/Naver/Kakao 로그인 키
- Toss 결제 키
- 관리자 이메일 목록

## 4.7 범위 제외 메모

- `app/ipsidna-prism/**`
- `app/api/ipsidna-prism/**`
- `lib/ipsidna/**`

위 경로는 분리된 별도 프로젝트 소스가 현재 레포에 남아 있는 상태다.
현재 `나의 입시멘토` 운영 문서와 배포 점검 범위에서는 제외한다.
분리 기준 프로젝트 위치는 `C:\Users\chris\Desktop\새 폴더\myungni_next` 이다.

## 6. 배포 후 점검 순서

1. `/api/health` 응답 확인
2. `/diagnosis/step1` 접속 확인
3. 학생 정보 입력 저장 확인
4. PDF 업로드 초기화 확인
5. 2단계 학생부 분석 화면 확인
6. 3단계 탐구활동/독서/세특 생성 확인
7. 4단계 입시위치 진단 화면 확인
8. 메일 보내기 동작 확인

## 7. 현재 확인된 운영상 사실

- 작업 공간에는 `.vercel/project.json` 이 없어서 현재 세션에서는 직접 연결 배포 정보가 없다
- GitHub 브랜치 `diagnosis-ui-20260622` 에 검증된 UI 수정이 올라가 있다
- 메일 발송 키가 없으면 발송 대신 outbox 저장으로 폴백한다
- PocketBase 관리자 계정이 없으면 업로드 컬렉션 자동 구성은 실패한다
