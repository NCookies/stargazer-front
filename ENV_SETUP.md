# 환경 변수 설정 가이드

## 📋 필요한 환경 변수

### 1. 백엔드 API 주소
- `NEXT_PUBLIC_API_URL`: 백엔드 서버 주소
  - 로컬 개발: `http://localhost:8080`
  - Vercel 배포: `https://api.byeolbolil.xyz`

### 2. 카카오 지도 API 키
- `NEXT_PUBLIC_KAKAO_APP_KEY`: 카카오 지도 JavaScript 키 (지도 표시용)
- `NEXT_PUBLIC_KAKAO_REST_API_KEY`: 카카오 REST API 키 (장소 검색용)

## 🖥️ 로컬 개발 환경 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 입력하세요:

```env
# 백엔드 API 주소
NEXT_PUBLIC_API_URL=http://localhost:8080

# 카카오 지도 API 키
NEXT_PUBLIC_KAKAO_APP_KEY=your_javascript_key_here
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_rest_api_key_here
```

**주의사항:**
- 환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다.
- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨).

## ☁️ Vercel 배포 환경 설정

### 방법 1: Vercel 대시보드에서 설정 (권장)

1. Vercel 대시보드 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 다음 환경 변수들을 추가:

| 변수 이름 | 값 | 환경 |
|---------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://api.byeolbolil.xyz` | Production, Preview, Development |
| `NEXT_PUBLIC_KAKAO_APP_KEY` | `your_javascript_key_here` | Production, Preview, Development |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` | `your_rest_api_key_here` | Production, Preview, Development |

4. 각 환경(Production, Preview, Development)에 대해 체크박스를 선택
5. **Save** 클릭

### 방법 2: Vercel CLI 사용

```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_KAKAO_APP_KEY
vercel env add NEXT_PUBLIC_KAKAO_REST_API_KEY
```

## ⚠️ Vercel 경고 메시지에 대해

Vercel에서 `NEXT_PUBLIC_`로 시작하고 `KEY`가 포함된 환경 변수를 등록할 때 다음과 같은 경고가 표시될 수 있습니다:

> "This key, which is prefixed with NEXT_PUBLIC_ and includes the term KEY, might expose sensitive information to the browser. Verify it is safe to share publicly."

### 이 경고를 무시해도 되는 이유:

1. **카카오 지도 API 키는 공개 키입니다**
   - 카카오 지도 API는 클라이언트 사이드에서 사용되므로 브라우저에 노출되어야 합니다.
   - 카카오에서는 **도메인 제한**을 통해 보안을 관리합니다.
   - 따라서 API 키 자체는 공개되어도 안전합니다.

2. **`NEXT_PUBLIC_` 접두사가 필요한 이유**
   - Next.js에서 클라이언트 사이드에서 사용할 환경 변수는 반드시 `NEXT_PUBLIC_` 접두사가 필요합니다.
   - 이 접두사가 없으면 클라이언트에서 접근할 수 없어 지도가 작동하지 않습니다.

3. **보안은 도메인 제한으로 관리**
   - 카카오 개발자 콘솔에서 허용된 도메인만 API를 사용할 수 있도록 설정합니다.
   - 따라서 API 키가 노출되어도 허용되지 않은 도메인에서는 사용할 수 없습니다.

### 결론

**이 경고는 무시하고 계속 진행하셔도 됩니다.** 카카오 지도 API 키는 공개되어도 안전하도록 설계되어 있으며, 도메인 제한으로 보안이 관리됩니다.

## 🔒 보안 주의사항

- ✅ **공개해도 되는 것**: 카카오 지도 API 키 (도메인 제한으로 보안 관리)
- ❌ **절대 공개하면 안 되는 것**: 
  - 서버 사이드 전용 API 키
  - 데이터베이스 비밀번호
  - 인증 토큰
  - 기타 민감한 정보

## 📝 카카오 지도 API 키 발급 방법

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. **플랫폼 설정** (중요!)
   - 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인 입력:
     - 로컬 개발: `http://localhost:3000`
     - Vercel 배포: `https://your-project.vercel.app` 또는 실제 도메인
4. **앱 키 확인**
   - 앱 키 > JavaScript 키 복사 → `NEXT_PUBLIC_KAKAO_APP_KEY`
   - 앱 키 > REST API 키 복사 → `NEXT_PUBLIC_KAKAO_REST_API_KEY`

자세한 설정 방법은 [`lib/map/KAKAO_SETUP.md`](lib/map/KAKAO_SETUP.md)를 참고하세요.

## 🔄 환경 변수 변경 후

환경 변수를 변경한 후에는:

1. **로컬 개발**: 개발 서버 재시작
   ```bash
   # Ctrl+C로 서버 중지 후
   pnpm dev
   ```

2. **Vercel 배포**: 자동으로 재배포되거나 수동으로 재배포
   - Vercel 대시보드 → Deployments → 최신 배포 → Redeploy

