# Toss 실운영 체크리스트

## 1) 환경변수 설정 (Vercel Production)
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 토스 클라이언트 키 (`live_ck...`)
- `TOSS_SECRET_KEY`: 토스 시크릿 키 (`live_sk...`)
- `TOSS_WEBHOOK_SECRET`: 웹훅 검증용 시크릿
- `NEXTAUTH_URL`: 운영 도메인 (예: `https://suprema-platform.vercel.app`)
- `AUTH_SECRET`: NextAuth 시크릿
- `ADMIN_EMAILS`: 관리자 이메일 목록 (쉼표 구분)

## 2) 토스 개발자센터 URL 등록
- 결제 성공 URL: `https://<운영도메인>/billing/success`
- 결제 실패 URL: `https://<운영도메인>/billing/fail`
- 웹훅 URL: `https://<운영도메인>/api/webhooks/toss`

## 3) 웹훅 이벤트 등록
- `PAYMENT_STATUS_CHANGED`
- `PAYMENT_COMPLETED` (사용 중이면 추가)
- `PAYMENT_CANCELED`

## 4) 사전 점검
- 테스트 키(`test_`)와 실키(`live_`) 혼용 금지
- 결제창 호출 키와 승인 API 키가 같은 프로젝트 세트인지 확인
- 결제 성공 후 `/billing/success`에서 승인 API가 정상 호출되는지 확인
- 웹훅 수신 후 주문 상태가 `paid/refunded`로 변경되는지 확인

## 5) 롤백 포인트
- 문제 발생 시 `TOSS_SECRET_KEY`를 비워 수동 승인 모드로 임시 전환 가능
- 관리자 화면에서 가격을 즉시 조정해 긴급 대응 가능
