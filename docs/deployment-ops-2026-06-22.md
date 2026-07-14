# Suprema Platform Deployment Ops

작성 기준일: 2026-07-14

## 범위

- Next.js App Router 기반 서비스
- `/diagnosis/step1`부터 `/diagnosis/step4`까지의 진단 화면
- PDF 분석, 전공 주제 생성, 메일 전송, 건강 상태 확인

## 주요 API

- `/api/diagnosis/upload-pdf`
- `/api/diagnosis/upload-pdf-record`
- `/api/diagnosis/upload-init`
- `/api/diagnosis/upload-configure`
- `/api/diagnosis/exploration-topics`
- `/api/send-email`
- `/api/health`

## 환경 변수

- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `PB_URL`
- `NEXT_PUBLIC_PB_URL`
- `PB_ADMIN_EMAIL`
- `PB_ADMIN_PASSWORD`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `REPORT_FROM_EMAIL`
- `RESEND_FROM_EMAIL`
- `TOSS_SECRET_KEY`
- `TOSS_WEBHOOK_SECRET`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`

## 배포 확인

1. `npm run build`
2. `npm run check:mojibake`
3. `npm run verify:diagnosis`
4. 실제 PDF 업로드 결과 확인
5. 메일 전송 결과 확인

## 운영 메모

- 메일 설정이 없으면 발송 요청은 `.cache/suprema-platform/outbox`로 저장
- PocketBase URL이 없으면 직접 업로드 경로가 실패할 수 있음
- 배포 후 `/api/health`로 상태 확인
- 배포 후 `/diagnosis/step1`부터 `/diagnosis/step4`까지 순서대로 확인
