"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import dynamic from "next/dynamic"

const MapSelector = dynamic(() => import("@/components/MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
      <p className="text-muted-foreground">지도를 불러오는 중...</p>
    </div>
  ),
})

interface InputSectionProps {
  onCalculate: () => Promise<void> | void
  isLoading?: boolean
  error?: string | null
  lat: number
  lon: number
  setLat: (lat: number) => void
  setLon: (lon: number) => void
  setLocationName: (name: string) => void
}

export function InputSection({ onCalculate, isLoading, error, lat, lon, setLat, setLon, setLocationName }: InputSectionProps) {
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

            {/* Map Selector */}
            <MapSelector lat={lat} lon={lon} setLat={setLat} setLon={setLon} setLocationName={setLocationName} />
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
