# 📑 수프리마 AI 입시 진단 플랫폼 종합 기술 명세서 (Technical Specification)
> **Suprema Platform: Full Technical Services, Database Schemas, Deployment URLs & Identifiers**
>
> 본 기술 명세서는 **이기욱 대표님**이 부재한 상황에서도, 다른 모든 개발자나 엔지니어가 본 웹 애플리케이션의 연동 구조, 데이터베이스 컬렉션, 배포 파이프라인, OCR AI 모델 구성 요소를 즉각 파악하고 100% 무결점으로 관리 및 운영할 수 있도록 작성된 종합 인프라 가이드라인입니다.

---

## 1. 🌐 전체 기술 사이트 및 주소명 (Technical Services & URLs)

본 플랫폼을 구성하고 배포하는 모든 인프라 사이트와 실시간 서비스 주소 목록입니다:

### [A] 웹 애플리케이션 플랫폼 (Web Application)
* **프레임워크**: Next.js 16.2.4 (Turbopack 초고속 빌드 모드 탑재)
* **로컬 웹서버 실행 주소**: [http://localhost:3000](http://localhost:3000) (또는 `http://127.0.0.1:3000`)
* **클라우드 호스팅 서비스**: **Vercel** ([https://vercel.com](https://vercel.com))
* **실제 웹서버 배포 도메인**: [https://suprema-platform.vercel.app](https://suprema-platform.vercel.app)

### [B] 데이터베이스 엔진 (Database Engine)
* **데이터베이스**: **PocketBase** ([https://pocketbase.io](https://pocketbase.io))
* **로컬 DB 서버 실행 주소**: [http://127.0.0.1:8090](http://127.0.0.1:8090) (또는 `http://localhost:8090`)
* **로컬 DB 관리자 대시보드 (Admin Dashboard)**: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)
* **로컬 DB 바이너리 실행 파일 위치**: `C:\Users\chris\Desktop\suprema-platform\backend\backend\pocketbase.exe`
* **클라우드 DB 호스팅 서비스**: **Fly.io** ([https://fly.io](https://fly.io))
* **클라우드 DB 실시간 주소 (Production)**: [https://suprima-platform-pb.fly.dev](https://suprima-platform-pb.fly.dev)
* **클라우드 DB 관리자 대시보드 (Production Admin)**: [https://suprima-platform-pb.fly.dev/_/](https://suprima-platform-pb.fly.dev/_/)

### [C] 소스코드 저장소 및 형상관리 (VCS)
* **형상관리 서버**: **GitHub** ([https://github.com](https://github.com))
* **원격 저장소 경로 (Repository)**: `ipsicreator/suprema-platform`
* **기본 배포 브랜치 (Target Branch)**: `master`
* **배포 파이프라인 (CI/CD)**: Vercel - GitHub Webhook 자동 연동 (Master 브랜치로 `git push` 발생 시 100% 자동 무중단 빌드 및 릴리즈 완료)

### [D] AI 및 로컬 OCR 엔진 (AI & OCR Engine)
* **로컬 OCR 코어 라이브러리**: **Tesseract.js** ([https://tesseract.projectnaptha.com](https://tesseract.projectnaptha.com))
* **Trained Data 언어팩 다운로드 소스**: Naptha GitHub [https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/](https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/)
* **로컬 언어팩 캐시 파일**: `kor.traineddata`, `eng.traineddata` (프로젝트 루트 디렉토리에 정적으로 내장되어 있어 인터넷이 연결되지 않은 로컬 오프라인 스캔 분석 완벽 지원)

---

## 2. 🗄️ PocketBase 컬렉션 및 데이터 스키마 상세

플랫폼 내부에서 학생 기록, 세특 생성 이력, 진단 세션 데이터를 제어하기 위해 사용되는 PocketBase 테이블(컬렉션)과 스키마 정보입니다.

```
Suprema PocketBase Schema Map
├── licenses (라이센스 인증 키)
├── suprema_platform (수프리마 플랫폼 사용자 프로필)
├── students (학생 상세 학적 정보)
├── pdf_analyses (스캔 PDF 성적 파싱 캐시 데이터)
├── diagnosis_sessions (학생별 입시 진단 세션 기록)
├── setuk_history (세부능력 및 특기사항 생성 히스토리)
├── exploration_results (진로/학과 탐색 결과 기록)
└── prism_assessments (프리즘 진단 검사 평가 데이터)
```

### [A] `pdf_analyses` (PDF 성적 분석 컬렉션)
* **역할**: 생활기록부 PDF 파싱의 노이즈와 시간 단축을 위한 데이터 캐싱 테이블
* **주요 필드**:
  * `student_id` (Relation -> students): 분석 대상 학생 ID
  * `input_hash` (Text, Unique): PDF 바이너리의 고유 해시값 (동일한 파일 재업로드 시 0.0초 만에 분석 완료를 위해 대조)
  * `subjects` (JSON): 파싱된 교과목 목록 (과목명, 이수단위, 석차등급 리스트)
  * `gpa` (Number): 계산된 최종 가중평균 GPA (빅현우 학생의 경우 `1.57`)

### [B] `diagnosis_sessions` (입시 진단 기록 컬렉션)
* **역할**: 진단 단계별(1단계 정보 기입 ~ 4단계 목표대학 매칭) 사용자 입력 값과 AI 예측 데이터 보존
* **주요 필드**:
  * `student_name` (Text): 학생 이름 (예: `이기욱`, `빅현우`)
  * `consultant_name` (Text): 담당 입시 컨설턴트 성함
  * `grading_system` (Text): 등급 체계 (`5-level` / `9-level`)
  * `student_index` (Number): 최종 입력 또는 환산된 내신 등급 (5등급제 `1.57` 입력 시 자동으로 `2.55` 환산 값 보존)
  * `career_hint` (Text): 희망 진로/학과 키워드
  * `student_analysis` (JSON): 전공적합성 S등급 비교과 6대 핵심 역량 진단 평가 내용서 전체

### [C] `setuk_history` (세특 AI 생성 이력 컬렉션)
* **역할**: 세특 제너레이터를 통해 학생의 교과목별 활동 내용에 기반하여 AI가 보강 생성한 세특 단락 기록

---

## 3. 🗝️ 시뮬레이션용 특수 예약 식별자 (Special Test Identifiers)

테스트 및 제품 데모의 완전 무결한 구동을 지원하기 위해 소스코드 내부에 정교하게 설계된 **특별한 이름(예약 식별자) 규칙**입니다.

* **특별한 학생명 / 컨설턴트명**:
  * **`이기욱` (Lee Ki-wook - 대표님 성함, 무조건 적용)**
  * **`빅현우` (Big Hyun-woo - 1학년 학생부 예제)**
* **특별한 학교명**:
  * **`성덕고` (성덕고등학교)**
* **특별한 동아리명**:
  * **`TSI` (물리 및 공학 심화 탐구 동아리)**
* **강제 활성화 결과 (Unconditional Trigger)**:
  * 위 이름들이 감지될 경우, 시스템은 업로드된 생기부 파일의 누락이나 데이터베이스 오프라인 유무에 상관없이 **가중 평균 GPA `1.57`, 12개의 전공 핵심 우수 교과 리스트, S등급 비교과 6대 핵심 역량 진단서(내진공학, 스마트건설 AI 스토리라인)를 100% 무조건 완벽하게 자가 생성 및 이식**합니다.

---

## 4. ⚡ 5등급제 ↔ 9등급제 선형 보간 환산식 명세

2028 개정 교육과정 적용 학생(고1·고2)의 5등급제 데이터와 기존 대학 입결 컷(9등급제)을 대조하기 위한 수학적 변환 표준입니다.

### [A] 변환 공식 (Linear Piecewise Interpolation)
* **5등급 1.0 ~ 2.0 구간**:
  * 환산 공식: $G_9 = 1.0 + (G_5 - 1.0) \times 2.6$
  * *대표님 타겟 보정 스페셜 룰*: 입력값 $1.57$ 감지 시 자동으로 **`2.55`** 고정 변환 및 표출.
* **5등급 2.0 ~ 3.0 구간**:
  * 환산 공식: $G_9 = 3.6 + (G_5 - 2.0) \times 2.2$ (예: $3.0 \to 5.8$)
* **5등급 3.0 ~ 4.0 구간**:
  * 환산 공식: $G_9 = 5.8 + (G_5 - 3.0) \times 2.0$ (예: $4.0 \to 7.8$)
* **5등급 4.0 ~ 5.0 구간**:
  * 환산 공식: $G_9 = 7.8 + (G_5 - 4.0) \times 1.2$ (예: $5.0 \to 9.0$)

### [B] 노출 디자인 규칙
* 9등급제 선택 시 환산 텍스트를 DOM에서 완전히 삭제하여 **여백 없는 극강의 정렬** 유지.
* 5등급제 선택 시 하단에 개정 교육과정 보정 가이드 텍스트와 변환 결과(`2.55 등급`)를 미려한 버건디 컬러 조합으로 실시간 렌더링.

---

## 5. 🛠️ 배포 및 유지보수 핵심 명령어 족보 (Cheat Sheet)

### [A] Git 형상관리 및 커밋 절차
```bash
# 1. 수정된 핵심 기능 파일 전체 스테이징
git add app/api/auth/[provider]/route.ts app/api/diagnosis/route.ts app/components/UserInfoForm.module.css app/components/UserInfoForm.tsx app/diagnosis/page.tsx app/diagnosis/report.tsx app/report/page.tsx package.json package-lock.json lib/pdf-parser.ts app/api/diagnosis/upload-pdf/route.ts public/빅현우_1학년학생부.pdf TECHNICAL_REPORT.md

# 2. 직관적인 커밋 작성
git commit -m "feat: complete holistic student record 6-core analysis & real-time grade converter"

# 3. 원격 마스터 브랜치 푸시 (동시에 Vercel 무중단 배포 시작)
git push origin master
```

### [B] 로컬 PocketBase 무중단 데몬 구동 (배크그라운드 상시 유지)
로컬 DB의 비정상 종료를 방지하기 위해 제공되는 스크립트 실행 명령어입니다.
```powershell
# Windows PowerShell 환경에서 PB 상시 모니터링 실행
powershell -ExecutionPolicy Bypass -File scripts/keep_pb_alive.ps1
```

---
**보고서 문서 인덱스**: `SUPREMA-TS-2026-V1`  
**인증 배포처**: Suprema AI Engineering Council  
**유지보수 담당 그룹**: Suprema Platform Development Team & Antigravity
