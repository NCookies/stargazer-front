import { create } from 'zustand';
import type { components } from '@/types/openapi';

export type BookmarkResponse = components['schemas']['BookmarkResponse'];

interface BookmarkState {
  bookmarks: BookmarkResponse[];
  isLoading: boolean;
  error: string | null;
  setBookmarks: (bookmarks: BookmarkResponse[]) => void;
  addBookmark: (bookmark: BookmarkResponse) => void;
  updateBookmark: (bookmarkId: number, bookmark: BookmarkResponse) => void;
  removeBookmark: (bookmarkId: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // 북마크된 spotId Set을 반환하는 selector
  getBookmarkedSpotIds: () => Set<number>;
  // 특정 spotId가 북마크되어 있는지 확인
  isSpotBookmarked: (spotId: number) => boolean;
  // 특정 spotId의 북마크 정보 가져오기
  getBookmarkBySpotId: (spotId: number) => BookmarkResponse | undefined;
}

export const bookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,
  
  setBookmarks: (bookmarks) => set({ bookmarks }),
  
  addBookmark: (bookmark) => set((state) => {
    // 중복 체크: 같은 bookmarkId가 이미 있으면 추가하지 않음
    const existingIndex = state.bookmarks.findIndex(
      (b) => b.bookmarkId === bookmark.bookmarkId
    )
    
    if (existingIndex >= 0) {
      // 이미 존재하면 업데이트
      const newBookmarks = [...state.bookmarks]
      newBookmarks[existingIndex] = bookmark
      return { bookmarks: newBookmarks }
    }
    
    // 새로 추가
    return {
      bookmarks: [...state.bookmarks, bookmark],
    }
  }),
  
  updateBookmark: (bookmarkId, bookmark) => set((state) => {
    const existingIndex = state.bookmarks.findIndex(
      (b) => b.bookmarkId === bookmarkId
    )
    
    if (existingIndex >= 0) {
      // 업데이트
      const newBookmarks = [...state.bookmarks]
      newBookmarks[existingIndex] = bookmark
      return { bookmarks: newBookmarks }
    }
    
    // 없으면 그대로 반환
    return state
  }),
  
  removeBookmark: (bookmarkId) => set((state) => ({
    bookmarks: state.bookmarks.filter((b) => b.bookmarkId !== bookmarkId),
  })),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  getBookmarkedSpotIds: () => {
    const { bookmarks } = get();
    return new Set(
      bookmarks
        .filter((b) => b.type === 'SPOT' && b.spotId)
        .map((b) => b.spotId as number)
    );
  },
  
  isSpotBookmarked: (spotId) => {
    const { bookmarks } = get();
    return bookmarks.some(
      (b) => b.type === 'SPOT' && b.spotId === spotId
    );
  },
  
  getBookmarkBySpotId: (spotId) => {
    const { bookmarks } = get();
    return bookmarks.find(
      (b) => b.type === 'SPOT' && b.spotId === spotId
    );
  },
}));
