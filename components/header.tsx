"use client"

import { useState } from "react"
import { Telescope, LogIn, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authStore } from "@/lib/store/authStore"
import { authApi } from "@/lib/api/authApi"

export function Header() {
  const router = useRouter()
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  const user = authStore((state) => state.user)
  const [isLogoutHovered, setIsLogoutHovered] = useState(false)
  const [isLoginHovered, setIsLoginHovered] = useState(false)

  const handleLogout = async () => {
    await authApi.logout()
    router.push('/')
  }

  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Telescope className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                별볼일
              </h1>
              <p className="text-xs text-muted-foreground">오늘 밤 별볼일 있나요?</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            {isAuthenticated && user?.nickname ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">
                  {user.nickname}님
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  onMouseEnter={() => setIsLogoutHovered(true)}
                  onMouseLeave={() => setIsLogoutHovered(false)}
                  className="gap-2 transition-all"
                >
                  {isLogoutHovered ? (
                    <User className="w-4 h-4 transition-transform" />
                  ) : (
                    <LogOut className="w-4 h-4 transition-transform" />
                  )}
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                onMouseEnter={() => setIsLoginHovered(true)}
                onMouseLeave={() => setIsLoginHovered(false)}
                className="gap-2 transition-all"
              >
                {isLoginHovered ? (
                  <User className="w-4 h-4 transition-transform" />
                ) : (
                  <LogIn className="w-4 h-4 transition-transform" />
                )}
                로그인
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
