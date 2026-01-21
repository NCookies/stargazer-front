# 커밋 메시지

## 옵션 1: 간결한 버전

```
feat: 인증 실패 시 커스텀 EntryPoint로 JSON 응답 반환

- JwtAuthenticationEntryPoint 구현하여 인증 실패 시 일관된 JSON 응답 제공
- CommonResponse 형식으로 표준화된 에러 응답 반환
- CORS 문제 해결: Security Filter Chain과의 통합으로 CORS 헤더 포함 응답 보장
```

## 옵션 2: 상세한 버전 (권장)

```
feat: 인증 실패 시 커스텀 AuthenticationEntryPoint 구현

인증되지 않은 요청이 보호된 리소스에 접근할 때 발생하는 CORS 문제를 해결하기 위해 커스텀 AuthenticationEntryPoint를 구현했습니다.

변경 사항:
- JwtAuthenticationEntryPoint 클래스 추가
  - AuthenticationEntryPoint 인터페이스 구현
  - 인증 실패 시 401 상태 코드와 JSON 형식의 에러 응답 반환
  - CommonResponse.error()를 사용한 표준화된 에러 응답 형식 적용

해결된 문제:
- 인증 실패 시 기본 EntryPoint의 리다이렉트로 인한 CORS 헤더 누락 문제 해결
- 프론트엔드에서 일관되게 에러를 처리할 수 있도록 JSON 응답 보장
- Spring Security의 CORS 설정과 올바르게 통합되어 CORS 헤더 포함 응답 반환

영향:
- 프론트엔드에서 인증 에러를 일관되게 처리 가능
- CORS 프리플라이트 및 실제 요청 모두 정상 동작
- 표준화된 에러 응답 형식으로 에러 핸들링 개선
```

## 옵션 3: Conventional Commits 형식

```
feat(auth): 커스텀 AuthenticationEntryPoint 구현으로 CORS 문제 해결

인증 실패 시 발생하던 CORS 문제를 해결하기 위해 JwtAuthenticationEntryPoint를 구현했습니다.

구현 내용:
- JwtAuthenticationEntryPoint 클래스 추가
- 인증 실패 시 CommonResponse 형식의 JSON 응답 반환
- 401 상태 코드와 표준화된 에러 메시지 제공

해결된 이슈:
- 인증 실패 시 CORS 헤더 누락으로 인한 프론트엔드 에러 처리 실패
- 기본 EntryPoint의 리다이렉트로 인한 응답 형식 불일치

BREAKING CHANGE: 없음
```

## 옵션 4: 한국어 버전

```
feat: 인증 실패 시 커스텀 EntryPoint로 JSON 응답 반환 구현

인증되지 않은 요청의 CORS 문제를 해결하기 위해 JwtAuthenticationEntryPoint를 구현했습니다.

주요 변경사항:
- JwtAuthenticationEntryPoint 클래스 추가
  - AuthenticationEntryPoint 인터페이스 구현
  - 인증 실패 시 401 상태 코드와 JSON 형식 에러 응답
  - CommonResponse.error()를 통한 표준화된 에러 응답

해결된 문제:
- 인증 실패 시 CORS 헤더 누락으로 인한 프론트엔드 에러 처리 실패
- 기본 EntryPoint의 리다이렉트로 인한 응답 형식 불일치
- Spring Security CORS 설정과의 통합으로 일관된 CORS 헤더 포함 응답

영향:
- 프론트엔드에서 인증 에러를 일관되게 처리 가능
- CORS 프리플라이트 및 실제 요청 모두 정상 동작
- 표준화된 에러 응답 형식으로 에러 핸들링 개선
```

## 추천

**옵션 2 (상세한 버전)** 또는 **옵션 4 (한국어 버전)**을 추천합니다.

- 변경 사항과 해결된 문제를 명확히 설명
- 다른 개발자가 이해하기 쉬움
- 향후 유지보수 시 참고하기 좋음
