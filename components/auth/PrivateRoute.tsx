"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStore } from '@/lib/store/authStore'

interface PrivateRouteProps {
  children: React.ReactNode
}

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * AuthProvider에서 이미 초기화를 처리하므로 여기서는 인증 상태만 확인
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter()
  const isAuthenticated = authStore((state) => state.isAuthenticated)

  useEffect(() => {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // 인증되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
