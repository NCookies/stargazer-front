/**
 * 북마크 관련 API
 * 
 * OpenAPI 스펙 기반 타입 안전한 북마크 API 클라이언트
 */

import { api } from './client';
import type { paths } from '@/types/openapi';
import type { AxiosError } from 'axios';

/**
 * 북마크 API 클라이언트
 */
export const bookmarksApi = {
  /**
   * 북마크 리스트 조회
   * 현재 로그인한 사용자의 북마크 리스트를 조회합니다.
   * 인증이 필요합니다.
   * 
   * @returns 북마크 목록
   */
  async getBookmarkList(): Promise<Array<paths["/api/v1/bookmarks"]["get"]["responses"]["200"]["content"]["*/*"]>> {
    try {
      const response = await api.get<
        "/api/v1/bookmarks",
        paths["/api/v1/bookmarks"]["get"]
      >('/api/v1/bookmarks');

      // 응답이 배열인 경우 그대로 반환, 단일 객체인 경우 배열로 감싸기
      return Array.isArray(response) ? response : [response];
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getBookmarkList] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[getBookmarkList] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 북마크 추가
   * 새로운 북마크를 추가합니다.
   * 인증이 필요합니다.
   * 
   * @param data 북마크 추가 요청 데이터
   * @returns 추가된 북마크 정보
   */
  async addBookmark(data: paths["/api/v1/bookmarks"]["post"]["requestBody"]["content"]["application/json"]): Promise<paths["/api/v1/bookmarks"]["post"]["responses"]["200"]["content"]["*/*"]> {
    try {
      const response = await api.post<
        "/api/v1/bookmarks",
        paths["/api/v1/bookmarks"]["post"]
      >('/api/v1/bookmarks', data);

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[addBookmark] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[addBookmark] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 북마크 수정
   * 북마크의 이름을 수정합니다.
   * 인증이 필요합니다.
   * 
   * @param bookmarkId 수정할 북마크 ID
   * @param data 북마크 수정 요청 데이터 (name만 수정 가능)
   * @returns 수정된 북마크 정보
   */
  async modifyBookmark(
    bookmarkId: number,
    data: { name: string; memo?: string }
  ): Promise<any> {
    try {
      // PATCH 메서드 사용
      const response = await api.patch(`/api/v1/bookmarks/${bookmarkId}`, data);

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[modifyBookmark] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[modifyBookmark] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 북마크 삭제
   * 북마크를 삭제합니다.
   * 인증이 필요합니다.
   * 
   * @param bookmarkId 삭제할 북마크 ID
   */
  async deleteBookmark(bookmarkId: number): Promise<void> {
    try {
      await api.delete(`/api/v1/bookmarks/${bookmarkId}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('[deleteBookmark] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[deleteBookmark] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },
};
