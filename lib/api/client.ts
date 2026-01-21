/**
 * OpenAPI 기반 타입 안전한 API 클라이언트
 * 
 * 이 파일은 OpenAPI 스펙에서 생성된 타입을 사용하여
 * 타입 안전한 API 호출을 제공합니다.
 * 
 * ⚠️ 중요: 백엔드 API 응답 구조
 * 백엔드 서버의 모든 API 응답은 CommonResponse 래퍼로 감싸져 있습니다.
 * 항상 response.data.data로 접근해야 합니다.
 */

import { apiClient } from './axios';
import type { paths, components } from '@/types/openapi';
import type { CommonResponse } from '@/types/api';

/**
 * API 클라이언트 기본 클래스
 * OpenAPI 타입을 활용한 타입 안전한 API 호출
 */
export class ApiClient {
  /**
   * GET 요청
   */
  async get<Path extends keyof paths>(
    path: Path,
    params?: Record<string, any>
  ): Promise<any> {
    const response = await apiClient.get<CommonResponse<any>>(path as string, { params });
    // 백엔드가 CommonResponse로 감싸서 반환하는 경우 data 추출
    return (response.data as any).data ?? response.data;
  }

  /**
   * POST 요청
   */
  async post<Path extends keyof paths>(
    path: Path,
    data?: any,
    params?: Record<string, any>
  ): Promise<any> {
    const response = await apiClient.post<CommonResponse<any>>(path as string, data, { params });
    // 백엔드가 CommonResponse로 감싸서 반환하는 경우 data 추출
    return (response.data as any).data ?? response.data;
  }

  /**
   * PUT 요청
   */
  async put<Path extends keyof paths>(
    path: Path,
    data?: any,
    params?: Record<string, any>
  ): Promise<any> {
    const response = await apiClient.put<CommonResponse<any>>(path as string, data, { params });
    return (response.data as any).data ?? response.data;
  }

  /**
   * DELETE 요청
   */
  async delete<Path extends keyof paths>(
    path: Path,
    params?: Record<string, any>
  ): Promise<any> {
    const response = await apiClient.delete<CommonResponse<any>>(path as string, { params });
    return (response.data as any).data ?? response.data;
  }
}

// 싱글톤 인스턴스
export const api = new ApiClient();

// 타입 재사용을 위한 export
export type { paths, components } from '@/types/openapi';
