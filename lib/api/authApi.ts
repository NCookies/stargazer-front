import { authApi as newAuthApi } from './auth';
import { membersApi } from './members';

/**
 * 기존 authApi (하위 호환성을 위해 유지)
 * 새로운 authApi를 사용하도록 리다이렉트
 * 
 * @deprecated 새로운 authApi를 직접 사용하세요: import { authApi } from '@/lib/api'
 */
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
   * 
   * @deprecated 새로운 authApi.reissue()를 사용하세요
   */
  reissue: async (): Promise<string> => {
    return newAuthApi.reissue();
  },

  /**
   * 현재 로그인한 유저 정보 조회
   * Access Token이 유효한 경우 유저 정보를 반환
   * 
   * @deprecated 새로운 membersApi.getMe()를 사용하세요
   */
  getMe: async () => {
    return membersApi.getMe();
  },

  /**
   * 로그아웃
   * 백엔드 로그아웃 API 호출 후 로컬 상태 초기화
   * 
   * @deprecated 새로운 authApi.logout()을 사용하세요
   */
  logout: async (): Promise<void> => {
    return newAuthApi.logout();
  },
};
