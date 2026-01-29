/**
 * 추천 관련 API (오늘의 추천 북마크)
 *
 * OpenAPI 스펙 기반 타입 안전한 추천 API 클라이언트
 */

import { api } from './client';
import type { RecommendedBookmarkResponse } from '@/types/api';
import type { AxiosError } from 'axios';

export const recommendsApi = {
  /**
   * 오늘 관측 추천 북마크 조회
   * 사용자 북마크 중 오늘 저녁 ~ 내일 일출 전 야간 관측 적합도 상위 5개 추천.
   * JWT 인증 필요. 첫 조회 시 5~15초 소요 가능.
   */
  async getTodayRecommendedBookmarks(): Promise<RecommendedBookmarkResponse> {
    try {
      // openapi.d.ts에 추천 경로가 없어 직접 호출 (응답 타입은 RecommendedBookmarkResponse)
      const response = await (api as { get: (path: string) => Promise<unknown> }).get(
        '/api/v1/recommends/bookmarks/today'
      );
      return response as RecommendedBookmarkResponse;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getTodayRecommendedBookmarks] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[getTodayRecommendedBookmarks] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },
};
