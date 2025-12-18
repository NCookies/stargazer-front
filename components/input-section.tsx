"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin, Locate, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

interface InputSectionProps {
  onCalculate: () => Promise<void> | void
  isLoading?: boolean
  error?: string | null
}

export function InputSection({ onCalculate, isLoading, error }: InputSectionProps) {
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCalculate()
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          관측 정보 입력
        </CardTitle>
        <CardDescription>날짜, 시간, 위치를 입력하면 별 관측 적합도를 계산해드립니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                날짜
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                시간
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          {/* Location Selector */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              위치 선택
            </Label>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="도시 검색 (예: 서울, 부산, 제주)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>

            {/* Map Area Placeholder */}
            <div className="relative bg-secondary/30 border-2 border-dashed border-border/50 rounded-lg h-64 overflow-hidden">
              {/* Map placeholder with grid */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-background/40" />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <MapPin
                    className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    fill="currentColor"
                  />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/20 rounded-full animate-ping" />
                </div>
              </div>

              {/* Map Label */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground">지도 영역</p>
              </div>

              {/* GPS Button */}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-4 right-4 shadow-lg hover:scale-105 transition-transform bg-secondary/90 backdrop-blur-sm"
              >
                <Locate className="w-5 h-5 text-accent" />
                <span className="sr-only">내 위치 가져오기</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-70"
            >
              {isLoading && <Spinner className="mr-2" />}
              {isLoading ? "계산 중..." : "관측 적합도 계산하기"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
