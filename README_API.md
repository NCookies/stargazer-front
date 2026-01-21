# API 클라이언트 구현 가이드

> **중요**: 새로운 API를 추가할 때는 이 문서를 먼저 참조하세요.

## 빠른 시작

새로운 OpenAPI JSON 파일을 받았을 때:

1. 이 파일을 Cursor에 전달하면서 다음을 요청하세요:
   ```
   @API_CLIENT_IMPLEMENTATION_GUIDE.md 파일을 참조하여 새로운 API 클라이언트를 구현해주세요.
   ```

2. 또는 직접 파일을 열어두면 Cursor가 자동으로 컨텍스트에 포함시킵니다.

## 자동 참조 방법

### 방법 1: @파일명 사용 (권장)
요청 시 다음과 같이 작성:
```
@API_CLIENT_IMPLEMENTATION_GUIDE.md 
백엔드에서 새로운 openapi.json 파일을 받았습니다. 이 가이드를 참조하여 API 클라이언트를 구현해주세요.
```

### 방법 2: 파일을 열어두기
`API_CLIENT_IMPLEMENTATION_GUIDE.md` 파일을 Cursor에서 열어두면 자동으로 컨텍스트에 포함됩니다.

### 방법 3: .cursorrules 활용
프로젝트 루트의 `.cursorrules` 파일에 가이드 참조 방법이 명시되어 있습니다.

## 주요 내용

이 가이드에는 다음이 포함되어 있습니다:
- OpenAPI 타입 생성 방법
- API 클라이언트 구현 패턴
- 에러 처리 방법
- 인증 처리 방법
- 특수 케이스 처리 (LocalTime 등)
- 구현 체크리스트

자세한 내용은 `API_CLIENT_IMPLEMENTATION_GUIDE.md` 파일을 참조하세요.
