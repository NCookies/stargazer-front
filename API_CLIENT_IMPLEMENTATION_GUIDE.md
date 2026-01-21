# API 클라이언트 구현 가이드

이 문서는 OpenAPI JSON 파일을 기반으로 프론트엔드 API 클라이언트를 구현하는 가이드입니다.

## 개요

백엔드 팀에서 Swagger/OpenAPI를 통합하여 API 문서를 자동 생성했습니다. `openapi.json` 파일을 제공받으면, 이를 활용하여 프론트엔드 프로젝트에 타입 안전한 API 클라이언트를 구현합니다.

## 구현 프로세스

### 1. OpenAPI JSON 파일 확인
- 제공받은 `openapi.json` 파일을 확인합니다.
- 파일에는 모든 API 엔드포인트, 요청/응답 스키마, 인증 방식 등이 포함되어 있습니다.

### 2. 타입 생성
```bash
# openapi-typescript를 사용하여 타입 생성
npx openapi-typescript <openapi.json 경로> -o types/openapi.d.ts
```

### 3. API 클라이언트 구조

프로젝트의 API 클라이언트는 다음과 같은 구조를 따릅니다:

```
lib/api/
├── client.ts          # OpenAPI 기반 타입 안전한 API 클라이언트 기본 클래스
├── auth.ts            # 인증 관련 API
├── members.ts         # 회원 관련 API
├── spots.ts           # 관측지 관련 API
├── stargazing.ts      # 별 관측 관련 API
├── index.ts           # 통합 export
└── axios.ts           # Axios 인스턴스 및 인터셉터 설정
```

### 4. API 클라이언트 구현 패턴

#### 기본 클라이언트 (`lib/api/client.ts`)
- OpenAPI 타입을 활용한 타입 안전한 API 호출
- CommonResponse 래퍼 자동 처리
- GET, POST, PUT, DELETE 메서드 지원

#### 개별 API 모듈 예시
```typescript
import { api } from './client';
import type { paths } from '@/types/openapi';
import type { AxiosError } from 'axios';

export const exampleApi = {
  async getExample(params: {
    // 파라미터 타입 정의
  }): Promise<paths["/api/v1/example"]["get"]["responses"]["200"]["content"]["*/*"]> {
    try {
      const response = await api.get(
        '/api/v1/example',
        params
      ) as paths["/api/v1/example"]["get"]["responses"]["200"]["content"]["*/*"];

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getExample] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[getExample] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },
};
```

### 5. 특수 케이스 처리

#### LocalTime 파라미터
Spring이 LocalTime을 쿼리 파라미터로 받을 때는 `HH:mm` 형식의 문자열로 전달해야 합니다:
```typescript
const timeString = `${String(params.time.hour).padStart(2, '0')}:${String(params.time.minute).padStart(2, '0')}`;
const queryParams = {
  ...params,
  time: timeString, // HH:mm 형식
};
```

#### 중첩 객체 파라미터
OpenAPI 스펙에서 `request` 파라미터로 객체를 받는 경우, 실제로는 개별 쿼리 파라미터로 전달합니다.

### 6. 에러 처리

#### 공통 에러 처리
- 모든 API 호출은 try-catch로 감싸서 에러를 처리합니다.
- AxiosError를 확인하여 서버 응답 에러를 처리합니다.
- 에러 메시지는 사용자 친화적으로 표시합니다.

#### 필드별 에러 처리 (폼 검증)
서버에서 반환하는 에러 메시지를 파싱하여 해당 필드에 에러를 설정:
```typescript
if (serverMessage.includes('비밀번호') || serverMessage.includes('password')) {
  registerForm.setError('password', {
    type: 'manual',
    message: '비밀번호는 8자 이상, 영문자/숫자/특수문자(!@#$%^&*)를 각각 최소 1개 이상 포함해야 합니다.',
  });
}
```

### 7. 인증 처리

#### JWT Bearer 토큰
- 로그인/회원가입 시 `accessToken`을 받습니다.
- 이후 API 호출 시 `Authorization: Bearer {accessToken}` 헤더를 자동으로 추가합니다.
- `lib/api/axios.ts`의 request interceptor에서 처리합니다.

#### 토큰 재발급
- 401 에러 발생 시 자동으로 `/api/v1/auth/reissue` 엔드포인트로 토큰을 갱신합니다.
- Refresh Token은 HttpOnly 쿠키로 관리되며, 브라우저가 자동으로 전송합니다.
- `lib/api/axios.ts`의 response interceptor에서 처리합니다.

### 8. 응답 구조

백엔드 API 응답은 CommonResponse 래퍼로 감싸져 있습니다:
```typescript
{
  success: boolean,
  status: number,
  message: string,
  data: T  // 실제 데이터는 여기에 있음
}
```

`lib/api/client.ts`에서 자동으로 `response.data.data`를 추출하여 반환합니다.

## API 구현 체크리스트

새로운 API를 추가할 때 다음 사항을 확인하세요:

- [ ] OpenAPI JSON에서 타입 생성 (`types/openapi.d.ts`)
- [ ] 새로운 API 모듈 파일 생성 (`lib/api/<domain>.ts`)
- [ ] 타입 안전한 함수 구현
- [ ] 에러 처리 추가
- [ ] `lib/api/index.ts`에 export 추가
- [ ] 필요한 경우 UI 컴포넌트에서 사용

## 주요 API 엔드포인트

### 인증 관련
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/reissue` - 토큰 재발급
- `POST /api/v1/auth/logout` - 로그아웃

### 회원 관련
- `GET /api/v1/members/me` - 내 정보 조회 (인증 필요)
- `GET /api/v1/members/exists/email` - 이메일 중복 검증

### 관측지 관련
- `GET /api/v1/spots` - 관측지 조회 (인증 불필요)

### 별 관측 관련
- `GET /api/v1/analyze` - 별 관측 조건 분석 (인증 불필요)
- `GET /api/v1/forecast` - 별 관측 예보 조회 (인증 불필요)

## 환경 설정

### API 베이스 URL
- **개발 환경**: `http://localhost:8080`
- **프로덕션 환경**: `https://api.byeolbolil.xyz`

환경 변수: `NEXT_PUBLIC_API_URL`

### CORS 설정
백엔드에서 다음 Origin을 허용:
- `http://localhost:3000`
- `https://www.byeolbolil.xyz`

## 사용 방법

### 기본 사용
```typescript
import { authApi, membersApi, stargazingApi, spotsApi } from '@/lib/api';

// 로그인
await authApi.login({ email, password });

// 회원가입
await authApi.register({ email, password, nickname });

// 내 정보 조회
await membersApi.getMe();

// 별 관측 조건 분석
await stargazingApi.analyzeStargazingCondition({ lat, lon, date, time });

// 관측지 조회
await spotsApi.getObservationSpots({ lat, lon, radius });
```

## 주의사항

1. **타입 안정성**: OpenAPI에서 생성된 타입을 최대한 활용하여 타입 안전성을 보장합니다.
2. **에러 처리**: 모든 API 호출은 적절한 에러 처리를 포함해야 합니다.
3. **인증**: 인증이 필요한 API는 자동으로 토큰이 추가되므로 별도 처리가 필요 없습니다.
4. **CommonResponse**: 백엔드 응답은 항상 CommonResponse로 감싸져 있으므로, 클라이언트에서 자동으로 처리됩니다.
5. **쿠키**: Refresh Token은 HttpOnly 쿠키로 관리되므로, `withCredentials: true` 설정이 필요합니다.

## 기존 API 보존 전략

**⚠️ 중요**: OpenAPI JSON이 업데이트되어도, 이미 구현되어 있는 API는 수정하지 않습니다.

### 구현된 API 확인
새로운 OpenAPI JSON을 받았을 때, 다음 파일을 먼저 확인하세요:
- `IMPLEMENTED_APIS.md` - 현재 구현된 모든 API 목록

### 업데이트 프로세스
1. **기존 API 확인**
   - `IMPLEMENTED_APIS.md`에서 구현된 엔드포인트 목록 확인
   - 기존 API는 최대한 보존

2. **새로운 API만 추가**
   - OpenAPI JSON과 `IMPLEMENTED_APIS.md`를 비교
   - 새로운 엔드포인트만 구현
   - 기존 엔드포인트는 건드리지 않음

3. **스펙 변경이 필요한 경우만 업데이트**
   - OpenAPI 스펙이 변경되었을 때만 필요한 부분만 최소한으로 업데이트
   - 특수 처리 로직 (예: LocalTime 변환)은 반드시 유지
   - 기존 동작을 깨뜨리지 않도록 주의

4. **문서 업데이트**
   - 새로운 API 추가 후 `IMPLEMENTED_APIS.md` 파일도 업데이트

### 요청 템플릿
```
@API_CLIENT_IMPLEMENTATION_GUIDE.md
@IMPLEMENTED_APIS.md

백엔드에서 업데이트된 openapi.json 파일을 받았습니다.
@p:\stargazer\openapi.json

이미 구현된 API는 수정하지 말고, 새로운 API만 추가해주세요.
IMPLEMENTED_APIS.md에 있는 API들은 그대로 유지해주세요.
```

## 참고 자료

- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [Axios Documentation](https://axios-http.com/)
