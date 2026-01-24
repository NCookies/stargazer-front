"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { authStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth'
import { membersApi } from '@/lib/api/members'
import { Header } from '@/components/header'
import { useToast } from '@/hooks/use-toast'
import { useAuthInit } from '@/components/auth/AuthProvider'
import { Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react'
import type { AxiosError } from 'axios'

// 로그인 폼 스키마
const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

// 비밀번호 패턴: 8자 이상, 영문자/숫자/특수문자(!@#$%^&*) 각각 최소 1개 이상
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/

// 회원가입 폼 스키마
const registerSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      passwordPattern,
      '비밀번호는 8자 이상, 영문자/숫자/특수문자(!@#$%^&*)를 각각 최소 1개 이상 포함해야 합니다'
    ),
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다').max(20, '닉네임은 최대 20자까지 가능합니다'),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isInitializing } = useAuthInit()
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // 로그인 폼
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 회원가입 폼
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      nickname: '',
    },
  })

  useEffect(() => {
    // 초기화가 완료된 후에만 리디렉션 체크
    if (isInitializing) {
      return
    }
    
    // 이미 로그인된 경우 메인 페이지로 리다이렉트
    // 단, user 정보가 있어야 확실히 로그인된 상태로 간주
    const user = authStore.getState().user
    if (isAuthenticated && user) {
      router.push('/')
    }
  }, [isAuthenticated, isInitializing, router])

  // 로그인 처리
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await authApi.login(data)
      
      // 유저 정보 가져오기
      await membersApi.getMe()
      
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      })
      
      router.push('/')
    } catch (error) {
      let errorMessage = '로그인에 실패했습니다.'
      
      if ((error as AxiosError).response) {
        const axiosError = error as AxiosError
        const errorData = axiosError.response?.data as any
        
        if (axiosError.response?.status === 401) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (errorData?.message) {
          errorMessage = errorData.message
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        }
      }
      
      toast({
        title: '로그인 실패',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 이메일 중복 검증
  const checkEmailAvailability = async (email: string) => {
    // 이메일이 비어있거나 유효하지 않으면 검증하지 않음
    if (!email || !z.string().email().safeParse(email).success) {
      // 이메일이 비어있거나 유효하지 않으면 에러 클리어
      registerForm.clearErrors('email')
      return
    }

    setIsCheckingEmail(true)
    try {
      const isAvailable = await membersApi.validateEmailDuplicated(email)
      if (!isAvailable) {
        registerForm.setError('email', {
          type: 'manual',
          message: '이미 사용 중인 이메일입니다.',
        })
      } else {
        registerForm.clearErrors('email')
      }
    } catch (error) {
      console.error('이메일 중복 검증 실패:', error)
      // 에러 발생 시에도 에러 클리어 (네트워크 에러 등)
      registerForm.clearErrors('email')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // 회원가입 처리
  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await authApi.register(data)
      
      // 유저 정보 가져오기
      await membersApi.getMe()
      
      toast({
        title: '회원가입 성공',
        description: '환영합니다!',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      })
      
      router.push('/')
    } catch (error) {
      let errorMessage = '회원가입에 실패했습니다.'
      let shouldSetFieldError = false
      let fieldName: 'email' | 'password' | 'nickname' | null = null
      
      if ((error as AxiosError).response) {
        const axiosError = error as AxiosError
        const errorData = axiosError.response?.data as any
        
        if (axiosError.response?.status === 400) {
          // 서버에서 반환하는 에러 메시지 확인
          const serverMessage = errorData?.message || errorData?.error?.message || ''
          
          // 비밀번호 패턴 에러 감지
          if (
            serverMessage.includes('비밀번호') ||
            serverMessage.includes('password') ||
            serverMessage.includes('패턴') ||
            serverMessage.includes('pattern') ||
            serverMessage.includes('문자/숫자/특수문자')
          ) {
            errorMessage = '비밀번호는 8자 이상, 영문자/숫자/특수문자(!@#$%^&*)를 각각 최소 1개 이상 포함해야 합니다.'
            shouldSetFieldError = true
            fieldName = 'password'
          }
          // 이메일 관련 에러
          else if (
            serverMessage.includes('이메일') ||
            serverMessage.includes('email') ||
            serverMessage.includes('중복')
          ) {
            errorMessage = serverMessage || '이메일을 확인해주세요.'
            shouldSetFieldError = true
            fieldName = 'email'
          }
          // 닉네임 관련 에러
          else if (
            serverMessage.includes('닉네임') ||
            serverMessage.includes('nickname')
          ) {
            errorMessage = serverMessage || '닉네임을 확인해주세요.'
            shouldSetFieldError = true
            fieldName = 'nickname'
          }
          // 기타 에러
          else if (serverMessage) {
            errorMessage = serverMessage
          } else {
            errorMessage = '입력한 정보를 확인해주세요.'
          }
        }
      }
      
      // 필드 에러 설정
      if (shouldSetFieldError && fieldName) {
        registerForm.setError(fieldName, {
          type: 'manual',
          message: errorMessage,
        })
      }
      
      toast({
        title: '회원가입 실패',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 소셜 로그인 처리
  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    // authApi.login은 OAuth 로그인을 위해 리다이렉트합니다
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    window.location.href = `${baseURL}/oauth2/authorization/${provider}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">별보기일기</CardTitle>
            <CardDescription className="text-center">
              로그인하여 별 관측 정보를 저장하고 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="register">회원가입</TabsTrigger>
              </TabsList>

              {/* 로그인 탭 */}
              <TabsContent value="login" className="space-y-4 mt-4">
                <form 
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                  className="space-y-4"
                  autoComplete="on"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="example@email.com"
                        className="pl-9"
                        {...loginForm.register('email')}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="비밀번호를 입력하세요"
                        className="pl-9"
                        {...loginForm.register('password')}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        로그인 중...
                      </>
                    ) : (
                      '로그인'
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleSocialLogin('kakao')}
                    className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] font-semibold"
                    size="lg"
                    variant="outline"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                    </svg>
                    카카오로 로그인
                  </Button>

                  <Button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white font-semibold"
                    size="lg"
                    variant="outline"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                    </svg>
                    네이버로 로그인
                  </Button>

                  <Button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300"
                    size="lg"
                    variant="outline"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google로 로그인
                  </Button>
                </div>
              </TabsContent>

              {/* 회원가입 탭 */}
              <TabsContent value="register" className="space-y-4 mt-4">
                <form 
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                  className="space-y-4"
                  autoComplete="on"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        placeholder="example@email.com"
                        className="pl-9"
                        {...registerForm.register('email', {
                          onChange: (e) => {
                            // 이메일이 변경될 때마다 이전 에러 클리어
                            if (registerForm.formState.errors.email?.type === 'manual') {
                              registerForm.clearErrors('email')
                            }
                          },
                          onBlur: (e) => {
                            if (e.target.value) {
                              checkEmailAvailability(e.target.value)
                            }
                          },
                        })}
                      />
                      {isCheckingEmail && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$"
                        placeholder="영문자, 숫자, 특수문자(!@#$%^&*) 포함 8자 이상"
                        className="pl-9"
                        {...registerForm.register('password')}
                      />
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-nickname">닉네임</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-nickname"
                        type="text"
                        autoComplete="nickname"
                        placeholder="별보기일기"
                        className="pl-9"
                        {...registerForm.register('nickname')}
                      />
                    </div>
                    {registerForm.formState.errors.nickname && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.nickname.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading || isCheckingEmail}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        회원가입 중...
                      </>
                    ) : (
                      '회원가입'
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleSocialLogin('kakao')}
                    className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] font-semibold"
                    size="lg"
                    variant="outline"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                    </svg>
                    카카오로 회원가입
                  </Button>

                  <Button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white font-semibold"
                    size="lg"
                    variant="outline"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                    </svg>
                    네이버로 회원가입
                  </Button>

                  <Button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300"
                    size="lg"
                    variant="outline"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google로 회원가입
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
