/**
 * 회원 관련 API
 * 
 * OpenAPI 스펙 기반 타입 안전한 회원 API 클라이언트
 */

import { api } from './client';
import { authStore, type User } from '@/lib/store/authStore';
import type { paths } from '@/types/openapi';
import type { AxiosError } from 'axios';

/**
 * 회원 API 클라이언트
 */
export const membersApi = {
  /**
   * 내 정보 조회
   * JWT 토큰 인증이 필요합니다.
   * @returns 회원 정보
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get('/api/v1/members/me') as paths["/api/v1/members/me"]["get"]["responses"]["200"]["content"]["*/*"];

      const user: User = {
        memberId: response.memberId,
        nickname: response.nickname,
        ...response,
      };

      // 유저 정보를 Store에 저장
      authStore.getState().setUser(user);

      return user;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getMe] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[getMe] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 이메일 중복 검증
   * 회원가입 전 이메일 중복 여부를 확인합니다.
   * @param email 검증할 이메일 주소
   * @returns 검증 결과 (true: 사용 가능, false: 중복됨)
   */
  async validateEmailDuplicated(email: string): Promise<boolean> {
    try {
      const response = await api.get(
        '/api/v1/members/exists/email',
        { email }
      ) as paths["/api/v1/members/exists/email"]["get"]["responses"]["200"]["content"]["*/*"];

      return response.validated ?? false;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[validateEmailDuplicated] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[validateEmailDuplicated] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },
};
