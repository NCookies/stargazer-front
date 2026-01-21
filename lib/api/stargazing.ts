/**
 * 별 관측 관련 API
 * 
 * OpenAPI 스펙 기반 타입 안전한 별 관측 API 클라이언트
 */

import { api } from './client';
import type { paths } from '@/types/openapi';
import type { AxiosError } from 'axios';

/**
 * 별 관측 API 클라이언트
 */
export const stargazingApi = {
  /**
   * 별 관측 조건 분석
   * 특정 위치, 날짜, 시간의 별 관측 조건을 종합적으로 분석합니다.
   * 인증이 필요하지 않습니다.
   * 
   * @param params 분석 파라미터 (위도, 경도, 날짜, 시간)
   * @returns 분석 결과
   */
  async analyzeStargazingCondition(params: {
    lat: number;
    lon: number;
    date: string; // yyyy-MM-dd 형식
    time: {
      hour: number;
      minute: number;
      second?: number;
      nano?: number;
    };
  }): Promise<paths["/api/v1/analyze"]["get"]["responses"]["200"]["content"]["*/*"]> {
    try {
      // Spring이 LocalTime을 쿼리 파라미터로 받을 때는 HH:mm 형식의 문자열로 전달해야 함
      // time 객체를 HH:mm 형식의 문자열로 변환
      const timeString = `${String(params.time.hour).padStart(2, '0')}:${String(params.time.minute).padStart(2, '0')}`;
      
      const queryParams: Record<string, any> = {
        lat: params.lat,
        lon: params.lon,
        date: params.date,
        time: timeString, // HH:mm 형식의 문자열로 전달
      };
      
      const response = await api.get(
        '/api/v1/analyze',
        queryParams
      ) as paths["/api/v1/analyze"]["get"]["responses"]["200"]["content"]["*/*"];

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[analyzeStargazingCondition] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[analyzeStargazingCondition] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * 별 관측 예보 조회
   * 특정 위치의 향후 며칠간의 별 관측 예보를 조회합니다.
   * 날짜별, 시간대별로 상세한 관측 조건 정보를 제공합니다.
   * 인증이 필요하지 않습니다.
   * 
   * @param params 예보 조회 파라미터 (위도, 경도, 날짜, 시간 - 날짜와 시간대 범위)
   * @returns 예보 결과
   */
  async getForecast(params: {
    lat: number;
    lon: number;
    date: string; // yyyy-MM-dd 형식
    time: {
      hour: number;
      minute: number;
      second?: number;
      nano?: number;
    };
  }): Promise<paths["/api/v1/forecast"]["get"]["responses"]["200"]["content"]["*/*"]> {
    try {
      // Spring이 LocalTime을 쿼리 파라미터로 받을 때는 HH:mm 형식의 문자열로 전달해야 함
      // time 객체를 HH:mm 형식의 문자열로 변환
      const timeString = `${String(params.time.hour).padStart(2, '0')}:${String(params.time.minute).padStart(2, '0')}`;
      
      const queryParams: Record<string, any> = {
        lat: params.lat,
        lon: params.lon,
        date: params.date,
        time: timeString, // HH:mm 형식의 문자열로 전달
      };
      
      const response = await api.get(
        '/api/v1/forecast',
        queryParams
      ) as paths["/api/v1/forecast"]["get"]["responses"]["200"]["content"]["*/*"];

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getForecast] 에러:', error.message);
      } else if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error('[getForecast] API 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  },
};
