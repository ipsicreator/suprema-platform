# handoff-apply-instructions-2026-06-22

## 1. 목적

이 문서는 원격 푸시 없이 오늘 작업 커밋을 다른 브랜치나 다른 작업 공간으로 이관하는 최소 절차를 정리한다.

대상 커밋 범위:

- `12c6452` `Refine diagnosis branding and step1 input screen`
- `3cce3cc` `Add updated service and deployment documentation`
- `87dc056` `Add handoff notes and patch bundle`
- `3b1e220` `Add portable git bundle for handoff`
- `815bf8e` `Refresh handoff bundle metadata`
- `3c9a878` `Sync handoff notes with latest bundle`

## 2. 번들로 이관하는 방법

번들 파일:

- `.handoff-bundle/diagnosis-ui-20260622.bundle`

### 확인

```powershell
git bundle verify .handoff-bundle\diagnosis-ui-20260622.bundle
```

### 번들에서 브랜치 생성

```powershell
git checkout -b diagnosis-ui-import 43e3233
git fetch .handoff-bundle\diagnosis-ui-20260622.bundle "refs/heads/*:refs/remotes/bundle/*"
git log --oneline bundle/HEAD
git cherry-pick 12c6452
git cherry-pick 3cce3cc
git cherry-pick 87dc056
git cherry-pick 3b1e220
git cherry-pick 815bf8e
git cherry-pick 3c9a878
```

## 3. 패치로 이관하는 방법

패치 파일:

- `.handoff-patches/0001-Refine-diagnosis-branding-and-step1-input-screen.patch`
- `.handoff-patches/0001-Add-updated-service-and-deployment-documentation.patch`

### 적용

```powershell
git checkout -b diagnosis-ui-patch-import 43e3233
git am .handoff-patches\0001-Refine-diagnosis-branding-and-step1-input-screen.patch
git am .handoff-patches\0001-Add-updated-service-and-deployment-documentation.patch
```

주의:

- 패치 방식은 handoff 문서/번들 관련 후속 커밋까지는 포함하지 않는다
- 전체 상태를 옮기려면 번들 방식을 우선 사용한다

## 4. 적용 후 확인

```powershell
npm run build
```

화면 확인 경로:

- `/diagnosis/step1`
- `/diagnosis/step2`
- `/diagnosis/step3`
- `/diagnosis/step4`

## 5. 참고 산출물

- UI 이미지 폴더:
  - `C:\Users\chris\Desktop\수프리마플랫폼_UI_화면`
- 인계 문서:
  - `docs/handoff-2026-06-22.md`
