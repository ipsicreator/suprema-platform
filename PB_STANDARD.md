# 🛡️ Suprema Platform: PocketBase Standard Rules

이 문서는 수프리마 플랫폼의 PocketBase 운영 및 개발 표준을 규정합니다. 모든 개발 사항은 아래의 규칙을 엄격히 준수해야 합니다.

## 1. 인증 및 사용자 관리 (Auth)
- **인증 단일화**: 오직 `users` 컬렉션만 사용합니다. (`admins`는 운영 콘솔 전용)
- **역할 체계 (3단계)**: `profiles.role` 필드에 아래 세 가지만 허용합니다.
  - `master`: 전체 관리자
  - `director`: 학원/원장급 관리자
  - `student`: 학생 사용자

## 2. 라이선스 및 권한 (License)
- **라이선스 필드 단일화**: 활성화 여부는 오직 `licenses.active` (boolean) 필드만 사용합니다. (`is_active` 등 유사 필드 금지)
- **권한 체크 쿼리**: `licenses` 컬렉션에서 `academy_id`와 `active=true`를 동시에 만족하는지 여부로만 판정합니다.

## 3. 데이터 관계 및 키 (Relationships)
- **연결키 단일화**:
  - `profiles.user` = `users.id` (1:1 관계)
  - `profiles.academy_id` (학원 소속 식별자)

## 4. 서버 운영 (DevOps)
- **자동 재시작**: PocketBase 프로세스는 시스템 서비스(Service)로 등록하여 비정상 종료 시 자동 재시작되도록 설정합니다.

---
**주의: 위 규칙을 벗어나는 DB 스키마 변경이나 로직 수정은 절대 금지합니다.**
