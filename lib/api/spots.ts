/**
 * 관측지 관련 API
 * 
 * OpenAPI 스펙 기반 타입 안전한 관측지 API 클라이언트
 */

import { api } from './client';
import type { paths } from '@/types/openapi';
import type { AxiosError } from 'axios';

/**
 * 관측지 API 클라이언트
 */
export const spotsApi = {
  /**
   * 관측지 조회
   * 현재 위치와 반경을 기준으로 관측지를 조회합니다.
   * 인증이 필요하지 않습니다.
   * 
   * @param params 조회 파라미터 (위도, 경도, 반경)
   * @returns 관측지 목록
   */
  async getObservationSpots(params: {
    lat: number;
    lon: number;
    radius: number;
  }): Promise<Array<paths["/api/v1/spots"]["get"]["responses"]["200"]["content"]["*/*"]>> {
    try {
      const response = await api.get<
        "/api/v1/spots",
        paths["/api/v1/spots"]["get"]
      >(
        '/api/v1/spots',
        params
      );

      // 응답이 배열인 경우 그대로 반환, 단일 객체인 경우 배열로 감싸기
      return Array.isArray(response) ? response : [response];
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getObservationSpots] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[getObservationSpots] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },
};
