"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Star } from "lucide-react"
import type { StargazingForecastResponse } from "@/types/api"
import { Skeleton } from "@/components/ui/skeleton"
import { MOON_PHASE_MAP } from "@/lib/utils"

interface ForecastViewProps {
  data: StargazingForecastResponse | null
  isLoading: boolean
}

export function ForecastView({ data, isLoading }: ForecastViewProps) {
  // 우주 등급 컬러셋: 점수가 높을수록 영롱하게 빛나고, 낮을수록 어둠 속으로 사라지는 컨셉
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-purple-500/20 text-purple-200 border-purple-500/50" // 최상: 영롱한 보라 (Legendary)
    if (score >= 60) return "bg-blue-500/20 text-blue-200 border-blue-500/50" // 좋음: 시원한 파랑 (Rare)
    if (score >= 40) return "bg-amber-500/20 text-amber-200 border-amber-500/50" // 흐림: 주의의 주황 (광해 느낌)
    return "bg-slate-700/50 text-slate-400 border-slate-700" // 나쁨: 묻히는 회색 (배경에 묻힘)
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-purple-200"
    if (score >= 60) return "text-blue-200"
    if (score >= 40) return "text-amber-200"
    return "text-slate-400"
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 forecast-scroll">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm min-w-[280px] shrink-0">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || !data.dailyForecasts || data.dailyForecasts.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">예보 데이터가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 forecast-scroll">
      {data.dailyForecasts.map((daily, index) => (
        <Card
          key={index}
          className="border-border/50 bg-card/50 backdrop-blur-sm min-w-[280px] shrink-0 flex flex-col"
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{daily.date}</CardTitle>
            <CardDescription>
              {daily.hourlyForecasts.length}개 시간대 예보
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {daily.hourlyForecasts.map((hourly, hourIndex) => (
              <div
                key={hourIndex}
                className={`${getScoreColor(hourly.score)} rounded-lg p-4 border flex flex-col gap-2 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-base font-semibold ${getScoreTextColor(hourly.score)}`}>
                    {hourly.time}
                  </div>
                  <div className={`text-2xl font-bold ${getScoreTextColor(hourly.score)}`}>
                    {hourly.score}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Cloud className={`w-4 h-4 ${getScoreTextColor(hourly.score)}`} />
                    <span className={getScoreTextColor(hourly.score)}>{hourly.cloudCover}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className={`w-3.5 h-3.5 ${getScoreTextColor(hourly.score)}`} />
                    <span className={getScoreTextColor(hourly.score)}>{hourly.starGrade}</span>
                  </div>
                </div>
                <div className={`text-xs ${getScoreTextColor(hourly.score)} opacity-90 text-center pt-1 border-t border-current/20 flex items-center justify-center gap-1.5`}>
                  {MOON_PHASE_MAP[hourly.moonPhase] ? (
                    <>
                      <span className="text-base">{MOON_PHASE_MAP[hourly.moonPhase].icon}</span>
                      <span>{MOON_PHASE_MAP[hourly.moonPhase].label}</span>
                    </>
                  ) : (
                    <span>{hourly.moonPhase}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

