import { apiClient } from './axios';
import { authStore, type User } from '@/lib/store/authStore';
import { AxiosError } from 'axios';
import axios from 'axios';
import type { CommonResponse } from '@/types/api';

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

interface ReissueResponseData {
  accessToken: string;
}

interface LoginResponse {
  message?: string;
}

interface MeResponseData {
  nickname: string;
  [key: string]: unknown; // 다른 필드들도 있을 수 있음
}

export const authApi = {
  /**
   * OAuth 로그인 시작
   * 백엔드 OAuth 로그인 페이지로 리다이렉트
   */
  login: (provider: string = 'google') => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    window.location.href = `${baseURL}/oauth2/authorization/${provider}`;
  },

  /**
   * Refresh Token을 사용하여 Access Token 재발급
   * HttpOnly Cookie에 있는 Refresh Token을 자동으로 전송
   */
  reissue: async (): Promise<string> => {
    try {
      // reissue는 Authorization 헤더가 필요 없음 (Refresh Token이 쿠키에 있음)
      // 순환 참조 방지를 위해 직접 axios 호출
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await axios.post<CommonResponse<ReissueResponseData>>(
        `${baseURL}/api/v1/auth/reissue`,
        {},
        { withCredentials: true }
      );
      
      // CommonResponse 래퍼에서 data 추출
      const accessToken = response.data.data?.accessToken;

      if (!accessToken) {
        console.error('[reissue] 응답 데이터:', response.data);
        throw new Error('Access Token이 응답에 포함되지 않았습니다.');
      }

      console.log('[reissue] 토큰 발급 성공:', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        accessTokenPrefix: accessToken ? `${accessToken.substring(0, 20)}...` : '없음',
      });

      // 새 Access Token을 Store에 저장
      authStore.getState().setAccessToken(accessToken);
      
      // 저장 후 확인
      const savedToken = authStore.getState().accessToken;
      console.log('[reissue] 토큰 저장 확인:', {
        saved: !!savedToken,
        matches: savedToken === accessToken,
        savedLength: savedToken?.length || 0,
      });

      if (!savedToken || savedToken !== accessToken) {
        throw new Error('토큰 저장에 실패했습니다.');
      }

      return accessToken;
    } catch (error) {
      // 에러 상세 정보 로깅
      if (error instanceof AxiosError) {
        console.error('[reissue] 에러 상세:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          hasResponse: !!error.response,
          hasRequest: !!error.request,
        });
      } else {
        console.error('[reissue] 에러:', error);
      }
      // 에러 발생 시 로그아웃 처리
      authStore.getState().logout();
      throw error;
    }
  },

  /**
   * 현재 로그인한 유저 정보 조회
   * Access Token이 유효한 경우 유저 정보를 반환
   */
  getMe: async (): Promise<User> => {
    try {
      // 현재 저장된 토큰 확인
      const currentToken = authStore.getState().accessToken;
      console.log('[getMe] 호출 전 토큰 상태:', {
        hasToken: !!currentToken,
        tokenLength: currentToken?.length || 0,
        tokenPrefix: currentToken ? `${currentToken.substring(0, 20)}...` : '없음',
      });
      
      const response = await apiClient.get<CommonResponse<MeResponseData>>('/api/v1/members/me');
      
      // CommonResponse 래퍼에서 data 추출
      const userData = response.data.data;
      const user: User = {
        nickname: userData.nickname,
        ...userData,
      };

      // 유저 정보를 Store에 저장
      authStore.getState().setUser(user);

      return user;
    } catch (error) {
      // 에러 상세 정보 로깅
      if (error instanceof AxiosError) {
        console.error('getMe 에러 상세:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          hasResponse: !!error.response,
          hasRequest: !!error.request,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });

        // Network Error인 경우 (CORS, 서버 미실행 등)
        if (!error.response && error.request) {
          console.error('⚠️ Network Error: 백엔드 서버가 실행 중인지, CORS 설정이 올바른지 확인하세요.');
          console.error('요청 URL:', error.config?.baseURL + error.config?.url);
        }

        // 401 에러인 경우
        if (error.response?.status === 401) {
          console.error('⚠️ 401 Unauthorized: Access Token이 유효하지 않습니다.');
        }
      }
      
      // 401 에러는 axios interceptor에서 처리됨
      throw error;
    }
  },

  /**
   * 로그아웃
   * 백엔드 로그아웃 API 호출 후 로컬 상태 초기화
   * 참고: CommonResponse 래퍼로 감싸져 있을 수 있지만, 로그아웃은 성공 여부만 확인
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // API 호출 성공/실패와 관계없이 로컬 상태 초기화
      authStore.getState().logout();
    }
  },
};
