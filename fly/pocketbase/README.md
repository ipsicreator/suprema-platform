# PocketBase (Fly.io)

## 목표
- Fly.io에 PocketBase를 올리고(24/7)
- 데이터는 볼륨으로 영속화
- Admin UI는 제한(권장)

## 필요한 것
- Fly 앱 이름: `ipsidna-prism-pb`
- 볼륨 1개(예: 1GB)
- PocketBase Linux 바이너리 (`fly/pocketbase/pocketbase`)
  - 현재 repo의 `backend/backend/pocketbase.exe`는 Windows용이라 Fly에서 동작하지 않습니다.

## 배포 개요(명령 예시)
1) 앱 생성
- `fly launch --name ipsidna-prism-pb --no-deploy`

2) 볼륨 생성 (pb_data 영속화)
- `fly volumes create pb_data --size 1 --region nrt`

3) 배포
- `fly deploy`

## 제한(권장)
- 최소: Admin UI 경로/IP 제한 또는 Fly private network
- 데이터 수집/조회는 Next.js 서버의 Admin API로만 수행하도록 구성

