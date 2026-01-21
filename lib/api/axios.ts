import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authStore } from '@/lib/store/authStore';

/**
 * ⚠️ 중요: 백엔드 API 응답 구조
 * 백엔드 서버의 모든 API 응답은 CommonResponse 래퍼로 감싸져 있습니다.
 * 사용자가 직접 언급하는 특수한 경우를 제외하면, 항상 response.data.data로 접근해야 합니다.
 * 
 * 응답 구조:
 * {
 *   success: boolean,
 *   status: number,
 *   message: string,
 *   data: T  // 실제 데이터는 여기에 있음
 * }
 */

// API Base URL 설정
// 클라이언트 사이드 요청은 rewrites가 작동하지 않으므로 직접 백엔드 URL 사용
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // HttpOnly Cookie를 위한 필수 설정
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // JSON 응답만 받도록 명시
  },
  maxRedirects: 0, // 리다이렉트 방지 (REST API는 리다이렉트하지 않아야 함)
  validateStatus: (status) => {
    // 401은 interceptor에서 처리하므로 유효한 상태로 간주
    return status >= 200 && status < 300 || status === 401;
  },
});

// 토큰 갱신 중 플래그 및 대기 큐
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// 대기 중인 요청 처리
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Access Token이 있으면 Authorization 헤더에 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = authStore.getState().accessToken;
    
    // 디버깅: 요청 정보 로깅
    if (config.url?.includes('/members/me') || config.url?.includes('/auth/')) {
      console.log('[Axios Request]', {
        url: config.url,
        method: config.method,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        accessTokenPrefix: accessToken ? `${accessToken.substring(0, 20)}...` : '없음',
      });
    }
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      // 디버깅: 헤더 확인
      if (config.url?.includes('/members/me')) {
        console.log('[Axios Request] Authorization 헤더 추가됨:', {
          header: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : '없음',
        });
      }
    } else if (config.url?.includes('/members/me')) {
      console.warn('[Axios Request] ⚠️ Access Token이 없어 Authorization 헤더가 추가되지 않았습니다.');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Network Error 처리 (CORS, 서버 미실행 등)
    if (!error.response && error.request) {
      console.error('Network Error 발생:', {
        message: error.message,
        url: originalRequest?.url,
        baseURL: originalRequest?.baseURL,
        fullUrl: originalRequest?.baseURL ? `${originalRequest.baseURL}${originalRequest.url}` : originalRequest?.url,
        hint: '백엔드 서버가 실행 중인지, CORS 설정이 올바른지 확인하세요.',
      });
    }

    // 리다이렉트 에러 처리 (백엔드가 OAuth 로그인 페이지로 리다이렉트하는 경우)
    if (error.response?.status === 302 || error.response?.status === 301 || error.response?.status === 307 || error.response?.status === 308) {
      console.error('⚠️ 리다이렉트 에러: 백엔드가 인증 실패 시 JSON 대신 리다이렉트를 반환하고 있습니다.', {
        status: error.response.status,
        location: error.response.headers.location,
        url: originalRequest?.url,
        hint: '백엔드에서 인증 실패 시 JSON 에러 응답을 반환하도록 설정해야 합니다.',
      });
      // 리다이렉트를 401로 처리
      error.response.status = 401;
    }

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // 이미 갱신 중이면 대기 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // /reissue API 호출하여 새 Access Token 발급
        // 순환 참조 방지를 위해 직접 axios 호출
        const reissueUrl = `${baseURL}/api/v1/auth/reissue`;
        
        const refreshResponse = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          reissueUrl,
          {},
          { withCredentials: true }
        );
        // CommonResponse 래퍼에서 data 추출
        const newAccessToken = refreshResponse.data.data?.accessToken;
        
        if (!newAccessToken) {
          throw new Error('Access Token이 응답에 포함되지 않았습니다.');
        }

        // 새 토큰을 Store에 저장
        authStore.getState().setAccessToken(newAccessToken);

        // 새 토큰으로 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // 대기 중인 요청들 처리
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        processQueue(refreshError as AxiosError, null);
        authStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
