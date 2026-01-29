/**
 * 인증 관련 API
 * 
 * OpenAPI 스펙 기반 타입 안전한 인증 API 클라이언트
 */

import { api } from './client';
import { authStore } from '@/lib/store/authStore';
import type { components, paths } from '@/types/openapi';
import type { AxiosError } from 'axios';

// 타입 별칭
type LoginRequest = components['schemas']['LoginRequest'];
type RegisterRequest = components['schemas']['RegisterRequest'];
type AuthTokenResponse = components['schemas']['AuthTokenResponse'];

/**
 * 인증 API 클라이언트
 */
export const authApi = {
  /**
   * 로그인
   * @param credentials 로그인 정보 (이메일, 비밀번호)
   * @returns Access Token
   */
  async login(credentials: LoginRequest): Promise<string> {
    try {
      const response = await api.post(
        '/api/v1/auth/login',
        credentials
      ) as AuthTokenResponse;

      const accessToken = response.accessToken;
      if (!accessToken) {
        throw new Error('Access Token이 응답에 포함되지 않았습니다.');
      }

      // Access Token을 Store에 저장
      authStore.getState().setAccessToken(accessToken);

      return accessToken;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[login] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[login] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 회원가입
   * @param data 회원가입 정보 (이메일, 비밀번호, 닉네임)
   * @returns Access Token
   */
  async register(data: RegisterRequest): Promise<string> {
    try {
      const response = await api.post(
        '/api/v1/auth/register',
        data
      ) as AuthTokenResponse;

      const accessToken = response.accessToken;
      if (!accessToken) {
        throw new Error('Access Token이 응답에 포함되지 않았습니다.');
      }

      // Access Token을 Store에 저장
      authStore.getState().setAccessToken(accessToken);

      return accessToken;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[register] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[register] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 토큰 재발급
   * Refresh Token은 HttpOnly Cookie에 있으므로 자동으로 전송됩니다.
   * @returns 새로운 Access Token
   */
  async reissue(): Promise<string> {
    try {
      // reissue는 Authorization 헤더가 필요 없음 (Refresh Token이 쿠키에 있음)
      // 순환 참조 방지를 위해 직접 axios 호출
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const axios = (await import('axios')).default;
      
      const response = await axios.post<{ data?: AuthTokenResponse }>(
        `${baseURL}/api/v1/auth/reissue`,
        {},
        { withCredentials: true }
      );

      // CommonResponse 래퍼에서 data 추출
      const accessToken = response.data.data?.accessToken ?? (response.data as any).accessToken;

      if (!accessToken) {
        console.error('[reissue] 응답 데이터:', response.data);
        throw new Error('Access Token이 응답에 포함되지 않았습니다.');
      }

      // 새 Access Token을 Store에 저장
      authStore.getState().setAccessToken(accessToken);

      return accessToken;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // 401은 로그인 안 된 상태에서 reissue 시도 시 정상 응답 → 에러 로그 생략
      if (status === 401) {
        authStore.getState().logout();
        throw error;
      }

      if (error instanceof Error) {
        console.error('[reissue] 에러:', error.message);
      } else if (axiosError.response) {
        console.error('[reissue] API 에러:', {
          status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 로그아웃
   * Refresh Token을 무효화하고 로컬 상태를 초기화합니다.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('[logout] API 호출 실패:', error);
    } finally {
      // API 호출 성공/실패와 관계없이 로컬 상태 초기화
      authStore.getState().logout();
    }
  },
};
