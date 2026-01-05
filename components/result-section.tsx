"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Moon, Sparkles, HelpCircle, Sun, Sunset } from "lucide-react"
import { CircularGauge } from "@/components/circular-gauge"
import type { StargazingResponse } from "@/types/api"
import { MOON_PHASE_MAP } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ResultSectionProps {
  data: StargazingResponse
}

export function ResultSection({ data }: ResultSectionProps) {
  const { totalScore, aiComment, reasons, weather, astronomy, lightPollution } = data

  const getMessage = (score: number) => {
    if (score >= 90) return "오늘은 별 보기 완벽한 날입니다! 🌟"
    if (score >= 75) return "오늘은 별 보기 아주 좋은 날입니다!"
    if (score >= 60) return "오늘은 별 보기 괜찮은 날입니다."
    if (score >= 40) return "별 관측이 다소 어려울 수 있습니다."
    return "오늘은 별 관측이 어렵습니다."
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Gauge Section */}
      <Card className="border-primary/30 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-sm shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-in zoom-in-95 duration-500">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <CircularGauge score={totalScore} />
              {reasons && reasons.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">분석 이유</h4>
                      <ul className="space-y-1.5">
                        {reasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-balance">{getMessage(totalScore)}</p>
              {aiComment ? (
                <p className="text-sm text-muted-foreground">{aiComment}</p>
              ) : (
                <p className="text-sm text-muted-foreground">AI가 기상, 천문, 광해 데이터를 분석했습니다</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Weather Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="w-5 h-5 text-blue-400" />
              기상 정보
            </CardTitle>
            <CardDescription>구름과 습도</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weather ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">구름량</span>
                  <span className="text-lg font-semibold text-foreground">{weather.cloudIndex}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">습도</span>
                  <span className="text-lg font-semibold text-foreground">{weather.humidityIndex}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">시정</span>
                  <span className="text-lg font-semibold text-green-400">{weather.visibilityText}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">기상 정보를 불러올 수 없습니다</p>
            )}
          </CardContent>
        </Card>

        {/* Astronomy Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="w-5 h-5 text-accent" />
              천문 정보
            </CardTitle>
            <CardDescription>달과 별자리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {astronomy ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">월령</span>
                  <span className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {MOON_PHASE_MAP[astronomy.moonPhase] ? (
                      <>
                        <span className="text-xl">{MOON_PHASE_MAP[astronomy.moonPhase].icon}</span>
                        <span>{MOON_PHASE_MAP[astronomy.moonPhase].label}</span>
                      </>
                    ) : (
                      <span>{astronomy.moonPhase}</span>
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-orange-400" />
                      <span className="text-muted-foreground">일출</span>
                      <span className="font-semibold text-orange-400">{astronomy.sunrise}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sunset className="w-4 h-4 text-orange-500" />
                      <span className="text-muted-foreground">일몰</span>
                      <span className="font-semibold text-orange-500">{astronomy.sunset}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">월출</span>
                      <span className="font-semibold text-foreground">{astronomy.moonrise}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">월몰</span>
                      <span className="font-semibold text-foreground">{astronomy.moonset}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">천문 정보를 불러올 수 없습니다</p>
            )}
          </CardContent>
        </Card>

        {/* Light Pollution Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-400/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
              광해 정보
            </CardTitle>
            <CardDescription>주변 밝기</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lightPollution ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">광해 등급</span>
                  <span className="text-lg font-semibold text-foreground">{lightPollution.bortleClass}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">밝기</span>
                  <span className="text-lg font-semibold text-primary">{lightPollution.brightness}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">관측 가능 별</span>
                  <span className="text-lg font-semibold text-green-400">{lightPollution.limitingMag}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">광해 정보를 불러올 수 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
