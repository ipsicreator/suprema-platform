# Suprema Platform

수프리마 랩의 학생부 PDF 분석, 1단계 진단, 2단계 분석, 3단계 전공 주제, 4단계 입시 위치 진단을 제공하는 Next.js 앱입니다.

## 화면

- `/`
- `/diagnosis`
- `/diagnosis/step1`
- `/diagnosis/step2`
- `/diagnosis/step3`
- `/diagnosis/step4`

## 주요 흐름

1. 학생 정보 입력
2. 학생부 분석
3. 전공 주제 생성
4. 입시 위치 진단

## 실행

```bash
npm install
npm run dev
```

- 기본 주소: `http://localhost:3000`

## 검증

```bash
npm run lint
npm run build
npm run check:mojibake
npm run verify:diagnosis
STEP2_VERIFY_PDF="N:\\개인\\입시컨설팅\\에듀탑_2025\\김혜람_세종캠고25\\학생부_김혜람.pdf" npm run verify:step2-report
```

## 주요 API

- `/api/diagnosis/upload-pdf`
- `/api/diagnosis/exploration-topics`
- `/api/send-email`
- `/api/health`

## 문서

- `docs/app-ui-template-spec.md`
- `docs/deployment-ops-2026-06-22.md`
- `docs/technical-report-2026-06-22.md`
- `docs/service-guide-2026-06-22.md`
- `docs/product-technology-sheet-2026-06-22.md`
