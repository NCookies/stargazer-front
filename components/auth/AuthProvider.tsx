"use client"

import { useEffect, useState, createContext, useContext } from 'react'
import { authStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/authApi'

interface AuthProviderProps {
  children: React.ReactNode
}

// 초기화 상태를 공유하기 위한 Context
const AuthInitContext = createContext<{ isInitializing: boolean }>({ isInitializing: true })

export const useAuthInit = () => useContext(AuthInitContext)

/**
 * 앱 초기 로딩 시 토큰 갱신을 시도하는 Provider
 * 새로고침 시에도 로그인 상태를 유지하기 위함
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const accessToken = authStore((state) => state.accessToken)

  useEffect(() => {
    const initializeAuth = async () => {
      // Access Token이 있으면 유효성 검증을 위해 reissue 시도
      // (새로고침 시 로그인 유지)
      if (accessToken) {
        try {
          // 1. Access Token 재발급
          await authApi.reissue()
          
          // 2. 유저 정보 조회 (401 에러가 발생하지 않으면 로그인 성공)
          try {
            await authApi.getMe()
          } catch (error) {
            // getMe 실패 시에도 토큰은 발급되었으므로 계속 진행
            console.error('초기 유저 정보 조회 실패:', error)
          }
        } catch (error) {
          console.error('초기 토큰 갱신 실패:', error)
          // 실패 시 로그아웃 처리 (토큰이 만료되었거나 유효하지 않음)
          authStore.getState().logout()
        }
      } else {
        // Access Token이 없으면 확실히 로그아웃 상태로 설정
        authStore.getState().logout()
      }
      setIsInitializing(false)
    }

    initializeAuth()
  }, []) // 최초 마운트 시에만 실행

  return (
    <AuthInitContext.Provider value={{ isInitializing }}>
      {children}
    </AuthInitContext.Provider>
  )
}
