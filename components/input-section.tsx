"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Telescope } from "lucide-react"

interface InputSectionProps {
  onCalculate: () => Promise<void> | void
  isLoading?: boolean
  error?: string | null
}

export function InputSection({ onCalculate, isLoading, error }: InputSectionProps) {
  const handleClick = async () => {
    await onCalculate()
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Telescope className="w-6 h-6 text-primary" />
          현재 관측 분석
        </CardTitle>
        <CardDescription>현재 위치와 시간 기준으로 별 관측 적합도를 분석합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={handleClick}
            size="lg"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-70"
          >
            {isLoading && <Spinner className="mr-2" />}
            {isLoading ? "계산 중..." : "관측 적합도 계산하기"}
          </Button>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
