"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { MapPin, Cloud, Moon, Clock, Star, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import type { RecommendedBookmarkResponse, RecommendedBookmarkItemResponse } from "@/types/api"
import { MOON_PHASE_MAP } from "@/lib/utils"

export interface TodayRecommendViewProps {
  data: RecommendedBookmarkResponse | null
  isLoading: boolean
  error: string | null
  onFetch: () => void
}

export function TodayRecommendView({ data, isLoading, error, onFetch }: TodayRecommendViewProps) {

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-purple-500/20 text-purple-200 border-purple-500/50"
    if (score >= 60) return "bg-blue-500/20 text-blue-200 border-blue-500/50"
    if (score >= 40) return "bg-amber-500/20 text-amber-200 border-amber-500/50"
    return "bg-slate-700/50 text-slate-400 border-slate-700"
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-purple-200"
    if (score >= 60) return "text-blue-200"
    if (score >= 40) return "text-amber-200"
    return "text-slate-400"
  }

  const getMoonPhaseDisplay = (moonPhase: string) => {
    if (MOON_PHASE_MAP[moonPhase]) {
      return { icon: MOON_PHASE_MAP[moonPhase].icon, label: MOON_PHASE_MAP[moonPhase].label }
    }
    const byLabel = Object.entries(MOON_PHASE_MAP).find(([, v]) => v.label === moonPhase)
    return byLabel ? { icon: byLabel[1].icon, label: byLabel[1].label } : null
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border-primary/30 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            오늘 밤 관측 추천
          </CardTitle>
          <CardDescription>
            저장한 북마크 중 오늘 저녁 ~ 내일 일출 전 야간 관측에 적합한 상위 5곳을 추천합니다. 분석에 5~15초 정도 걸릴 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onFetch}
            disabled={isLoading}
            className="gap-2 shadow-md hover:shadow-lg transition-shadow"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                잠시만 기다려 주세요...
              </>
            ) : (
              "오늘의 추천 받기"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            {error === "로그인이 필요합니다." && (
              <Link href="/login">
                <Button variant="outline" size="sm">로그인하기</Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">북마크를 분석하고 있습니다. 잠시만 기다려 주세요.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="px-4 py-3 space-y-2 border-b border-border/50">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <CardContent className="pt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && data && (
        <>
          {data.isPartialResult && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>일부만 분석됨</AlertTitle>
              <AlertDescription>
                일부 북마크는 요청 제한으로 분석되지 않았습니다. 잠시 후 다시 시도하면 더 많은 결과를 볼 수 있습니다.
              </AlertDescription>
            </Alert>
          )}

          {(!data.items || data.items.length === 0) ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <p className="text-center text-muted-foreground text-sm leading-relaxed">
                  {data.totalRequested === 0
                    ? "등록된 북마크가 없습니다. 북마크를 추가한 뒤 다시 시도해 주세요."
                    : "오늘 추천할 수 있는 장소가 없습니다."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((item: RecommendedBookmarkItemResponse) => {
                const scoreColor = getScoreColor(item.score)
                const scoreTextColor = getScoreTextColor(item.score)
                const moonDisplay = getMoonPhaseDisplay(item.moonPhase)
                return (
                  <Card
                    key={item.bookmarkId}
                    className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/30 p-0 gap-0"
                  >
                    {/* 점수 강조 헤더 - 카드 상단과 맞춤 */}
                    <div className={`rounded-t-xl border-b border-current/20 px-6 py-3 ${scoreColor} shadow-sm`}>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-semibold truncate text-foreground">
                          {item.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-2xl font-bold ${scoreTextColor}`}>
                            {item.score}
                          </span>
                          <span className={`text-sm font-medium ${scoreTextColor}`}>점</span>
                          {item.reasons && item.reasons.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className={`${scoreTextColor} opacity-80 hover:opacity-100 transition-opacity cursor-help`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold mb-2">감점 사유</p>
                                  <ul className="list-disc list-inside space-y-1 text-xs">
                                    {item.reasons.map((reason, i) => (
                                      <li key={i}>{reason}</li>
                                    ))}
                                  </ul>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      {item.address && (
                        <CardDescription className="flex items-start gap-1.5 text-xs mt-1.5 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.address}</span>
                        </CardDescription>
                      )}
                    </div>
                    <CardContent className="pt-4 pb-5 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary/80" />
                          최적 시간
                        </span>
                        <span className="font-semibold text-foreground">{item.bestTime}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Cloud className="w-4 h-4 text-blue-400/90" />
                          구름량
                        </span>
                        <span className="font-semibold text-foreground">{item.cloudCover}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Moon className="w-4 h-4 text-accent" />
                          달 위상
                        </span>
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          {moonDisplay ? (
                            <>
                              <span className="text-base">{moonDisplay.icon}</span>
                              {moonDisplay.label}
                            </>
                          ) : (
                            item.moonPhase
                          )}
                        </span>
                      </div>
                      {item.starGrade && (
                        <div className="flex justify-between items-center text-sm pt-1 border-t border-border/50">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Star className="w-4 h-4 text-amber-400/90" />
                            관측 등급
                          </span>
                          <span className="font-semibold text-foreground">{item.starGrade}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
