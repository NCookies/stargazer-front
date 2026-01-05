# 카카오 지도 API 설정 가이드

지도가 보이지 않는 경우, 다음 설정을 확인하세요.

## 1. 카카오 개발자 콘솔 설정

### 1.1 애플리케이션 등록
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 저장

### 1.2 플랫폼 설정 (중요!)
**이 설정이 없으면 지도가 표시되지 않습니다.**

1. 내 애플리케이션 > 앱 선택 > 플랫폼
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인 등록:
   - **로컬 개발**: `http://localhost:3000`
   - **프로덕션**: 실제 도메인 (예: `https://yourdomain.com`)
4. 저장

### 1.3 JavaScript 키 확인
1. 내 애플리케이션 > 앱 선택 > 앱 키
2. **JavaScript 키** 복사
3. `.env.local` 파일에 설정:
   ```env
   NEXT_PUBLIC_KAKAO_APP_KEY=your_javascript_key_here
   ```

### 1.4 REST API 키 확인 (장소 검색용)
1. 내 애플리케이션 > 앱 선택 > 앱 키
2. **REST API 키** 복사
3. `.env.local` 파일에 설정:
   ```env
   NEXT_PUBLIC_KAKAO_REST_API_KEY=your_rest_api_key_here
   ```

### 1.5 플랫폼 도메인 확인
**반드시 확인해야 할 사항:**
- Web 플랫폼이 등록되어 있는지
- 등록된 도메인이 현재 접속한 URL과 일치하는지
- `http://localhost:3000` (로컬 개발 시)
- 실제 도메인 (프로덕션 시)

## 2. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성:

```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_javascript_key_here
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_rest_api_key_here
```

**주의사항:**
- `NEXT_PUBLIC_` 접두사 필수
- 따옴표 없이 입력
- 공백 없이 입력
- 환경 변수 변경 후 **개발 서버 재시작 필수**

## 3. 개발 서버 재시작

환경 변수를 변경한 경우:

```bash
# 개발 서버 중지 (Ctrl+C)
pnpm dev
```

## 4. 브라우저 콘솔 확인

브라우저 개발자 도구(F12) > Console 탭에서 다음 로그 확인:

### 정상적인 경우:
```
[KakaoMapProvider] 환경 변수 확인: { hasAppKey: true, ... }
[KakaoMapProvider] 카카오 지도 스크립트 로드 시작: ...
[KakaoMapProvider] 스크립트 로드 완료, 지도 API 초기화 중...
[KakaoMapProvider] 지도 API 초기화 완료
[MapSelector] 지도 초기화 시작: ...
[KakaoMapProvider] 지도 옵션: ...
[KakaoMapProvider] 지도 객체 생성 완료: ...
[MapSelector] 지도 초기화 성공
```

### 문제가 있는 경우:
- `hasAppKey: false` → 환경 변수 미설정
- `스크립트를 로드할 수 없습니다` → API 키 오류 또는 플랫폼 미등록
- `지도를 생성할 수 없습니다` → 카카오 지도 API 오류

## 5. 일반적인 오류 해결

### 오류: "Invalid app key"
- JavaScript 키가 올바른지 확인
- 플랫폼 도메인이 등록되어 있는지 확인

### 오류: "Forbidden"
- 플랫폼 도메인이 현재 URL과 일치하는지 확인
- `http://localhost:3000` (로컬) 또는 실제 도메인 (프로덕션)

### 지도가 회색으로 표시됨
- 네트워크 연결 확인
- 브라우저 콘솔의 에러 메시지 확인
- 카카오 지도 API 서비스 상태 확인

### 지도 컨테이너는 보이지만 지도가 안 보임
- 컨테이너의 크기가 0이 아닌지 확인
- CSS에서 `display: none` 또는 `visibility: hidden`이 아닌지 확인
- 브라우저 콘솔에서 지도 객체 생성 로그 확인

## 6. 테스트

설정이 완료되면:
1. 브라우저 콘솔에서 에러가 없는지 확인
2. 지도가 정상적으로 표시되는지 확인
3. 지도를 클릭했을 때 마커가 이동하는지 확인
4. 장소 검색이 작동하는지 확인

## 7. 추가 도움말

- [카카오 지도 API 공식 문서](https://apis.map.kakao.com/web/guide/)
- [카카오 개발자 포럼](https://devtalk.kakao.com/)

