/**
 * API 클라이언트 통합 export
 * 
 * 모든 API 클라이언트를 한 곳에서 import할 수 있도록 합니다.
 */

export { api, ApiClient } from './client';
export { authApi } from './auth';
export { membersApi } from './members';
export { spotsApi } from './spots';
export { stargazingApi } from './stargazing';
export { bookmarksApi } from './bookmarks';
export { recommendsApi } from './recommends';
export { apiClient } from './axios';

// 타입 export
export type { paths, components } from '@/types/openapi';
