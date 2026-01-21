# CORS 문제와 AuthenticationEntryPoint 해결 원리

## CORS (Cross-Origin Resource Sharing) 문제란?

### 1. CORS의 기본 개념

CORS는 **Cross-Origin Resource Sharing**의 약자로, 브라우저의 **Same-Origin Policy**를 완화하여 다른 출처(Origin)의 리소스에 접근할 수 있게 해주는 메커니즘입니다.

**Origin의 구성 요소:**
- 프로토콜 (http/https)
- 도메인 (localhost, example.com)
- 포트 (3000, 8080)

예를 들어:
- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:8080`
- → **다른 Origin**이므로 CORS 설정이 필요합니다.

### 2. CORS 요청의 두 가지 유형

#### Simple Request (단순 요청)
- GET, POST, HEAD 메서드
- 특정 헤더만 사용
- **프리플라이트(Preflight) 없이 바로 요청**

#### Preflight Request (프리플라이트 요청)
- PUT, DELETE, PATCH 등
- 커스텀 헤더 사용 (예: `Authorization`)
- **OPTIONS 요청을 먼저 보내서 서버의 허용 여부 확인**

### 3. CORS 문제가 발생하는 이유

브라우저는 보안을 위해 다음을 확인합니다:

1. **프리플라이트 요청 (OPTIONS)**
   - 서버가 `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` 등을 반환해야 함
   - 이 응답이 없거나 잘못되면 실제 요청이 차단됨

2. **실제 요청 (GET, POST 등)**
   - 응답에 `Access-Control-Allow-Origin` 헤더가 있어야 함
   - `Access-Control-Allow-Credentials: true`가 필요할 수 있음 (쿠키 전송 시)

## 왜 AuthenticationEntryPoint를 구현하니 해결되었을까?

### 문제 상황

Spring Security에서 인증되지 않은 요청이 보호된 리소스에 접근할 때:

1. **기본 동작 (EntryPoint 미구현 시)**
   - Spring Security의 기본 `AuthenticationEntryPoint`는 **리다이렉트**를 시도하거나
   - 기본 에러 응답을 반환하는데, 이때 **CORS 헤더가 포함되지 않을 수 있음**
   - 특히 인증 실패 시 401 응답에 CORS 헤더가 누락되면 브라우저가 응답을 차단

2. **CORS 필터의 실행 순서 문제**
   ```
   요청 → CORS Filter → Security Filter Chain → AuthenticationEntryPoint
   ```
   - CORS 필터가 먼저 실행되지만, EntryPoint에서 응답을 직접 작성하면
   - CORS 필터가 이미 지나간 후이므로 CORS 헤더가 추가되지 않을 수 있음

### 해결 방법

#### 1. 커스텀 EntryPoint 구현

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public void commence(
        HttpServletRequest request,
        HttpServletResponse response,
        AuthenticationException authException
    ) throws IOException {
        // 1. 적절한 HTTP 상태 코드 설정
        response.setStatus(code.getStatus().value());
        
        // 2. Content-Type 설정 (JSON 응답)
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        // 3. 표준화된 에러 응답 형식
        CommonResponse<Void> body = CommonResponse.error(code);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
```

#### 2. 왜 이것이 CORS 문제를 해결하는가?

**핵심 원리:**

1. **일관된 응답 형식**
   - 모든 인증 실패 응답이 동일한 형식으로 반환됨
   - Spring Security의 CORS 설정이 일관되게 적용될 수 있음

2. **Security Filter Chain과의 통합**
   - `AuthenticationEntryPoint`는 Security Filter Chain 내에서 호출됨
   - Spring Security의 CORS 설정(`CorsConfigurationSource`)이 적용된 후 실행됨
   - 따라서 CORS 필터가 이미 설정한 헤더를 유지하면서 응답을 작성할 수 있음

3. **명시적인 JSON 응답**
   - 기본 EntryPoint는 HTML 리다이렉트를 시도할 수 있음
   - 커스텀 EntryPoint는 명시적으로 JSON을 반환하므로
   - 프론트엔드에서 일관되게 에러를 처리할 수 있음

### 실제 해결 메커니즘

```java
// Spring Security 설정 예시
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint) // 커스텀 EntryPoint
            )
            // ...
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // 쿠키 전송 허용
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**실행 순서:**
1. 요청이 들어옴
2. **CORS 필터가 CORS 헤더를 추가** (`Access-Control-Allow-Origin` 등)
3. Security Filter Chain 실행
4. 인증 실패 시 → **커스텀 EntryPoint 호출**
5. EntryPoint가 JSON 응답 작성 (CORS 헤더는 이미 추가된 상태)
6. 응답 반환

### 추가 고려사항

만약 여전히 CORS 문제가 발생한다면:

1. **CORS 필터가 EntryPoint 응답에 적용되지 않는 경우**
   - EntryPoint에서 직접 CORS 헤더 추가:
   ```java
   response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
   response.setHeader("Access-Control-Allow-Credentials", "true");
   ```

2. **OPTIONS 요청 처리**
   - Spring Security가 OPTIONS 요청도 인증 체크를 하지 않도록 설정:
   ```java
   http.authorizeHttpRequests(auth -> auth
       .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
   );
   ```

## 요약

**CORS 문제가 해결된 이유:**

1. ✅ **일관된 응답 형식**: 모든 인증 실패가 동일한 JSON 형식으로 반환
2. ✅ **Security Filter Chain 통합**: CORS 설정이 적용된 후 EntryPoint 실행
3. ✅ **명시적 JSON 응답**: HTML 리다이렉트 대신 JSON으로 프론트엔드와 통신
4. ✅ **표준화된 에러 처리**: `CommonResponse` 형식으로 일관성 유지

**핵심 포인트:**
- EntryPoint 자체가 CORS를 해결하는 것이 아니라
- **Spring Security의 CORS 설정과 올바르게 통합**되어
- CORS 헤더가 포함된 응답을 일관되게 반환할 수 있게 됨
