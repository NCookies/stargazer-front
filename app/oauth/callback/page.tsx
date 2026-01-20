"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { authApi } from '@/lib/api/authApi'
import { useToast } from '@/hooks/use-toast'

export default function OAuthCallback() {
  const router = useRouter()
  const hasCalledReissue = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    // React StrictMode 대응: 중복 호출 방지
    if (hasCalledReissue.current) {
      return
    }
    hasCalledReissue.current = true

    // 컴포넌트 마운트 즉시 reissue API 호출
    const handleReissue = async () => {
      try {
        // 1. Access Token 재발급
        await authApi.reissue()
        
        // 2. 유저 정보 조회 (401 에러가 발생하지 않으면 로그인 성공)
        try {
          await authApi.getMe()
        } catch (error) {
          // getMe 실패 시에도 토큰은 발급되었으므로 계속 진행
          console.error('유저 정보 조회 실패:', error)
        }
        
        // 성공 토스트 표시
        toast({
          title: '로그인 성공',
          description: '정상적으로 로그인되었습니다.',
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        })
        
        // 메인 페이지로 이동
        setTimeout(() => {
          router.push('/')
        }, 500)
      } catch (error) {
        console.error('토큰 재발급 실패:', error)
        // 실패 시 로그인 페이지로 이동
        router.push('/login')
      }
    }

    handleReissue()
  }, [router, toast])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  )
}
