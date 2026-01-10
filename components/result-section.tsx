"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Moon, Sparkles, HelpCircle, Sun, Sunset } from "lucide-react"
import { CircularGauge } from "@/components/circular-gauge"
import type { StargazingResponse } from "@/types/api"
import { MOON_PHASE_MAP } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                기상 정보
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[500px] overflow-y-auto popover-scroll" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">기상 데이터가 관측에 미치는 영향</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        구름은 별을 가리고, 습도와 시정은 별빛의 선명도를 결정합니다.
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">구름량 (Cloud Cover)</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          하늘이 구름으로 덮인 비율입니다. (0% ~ 100%)
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          별 관측의 가장 큰 방해꾼입니다. 구름이 별을 물리적으로 가리기 때문입니다.
                        </p>
                        <p className="text-xs text-primary font-medium">
                          💡 0~10%일 때 가장 이상적이며, 30%가 넘어가면 관측이 어렵습니다.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">습도 (Humidity)</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          공기 중 수증기의 양입니다.
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          습도가 높으면 별빛이 산란되어 하늘이 뿌옇게 보이고(헤이즈), 망원경 렌즈에 이슬이 맺힐 수 있습니다.
                        </p>
                        <p className="text-xs text-primary font-medium">
                          💡 50% 미만일 때 별이 쨍하게 보입니다. 습도가 높은 날은 별이 흐릿하게 보일 수 있습니다.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">시정 (Visibility)</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          대기의 투명도, 즉 얼마나 멀리까지 선명하게 보이는지를 나타냅니다.
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          미세먼지나 안개가 없어야 시정이 좋습니다. 시정이 나쁘면 지평선 근처의 별은 보기 힘듭니다.
                        </p>
                        <p className="text-xs text-primary font-medium">
                          💡 '매우 좋음(20km 이상)' 상태일 때 은하수나 어두운 별을 볼 확률이 높아집니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-accent" />
                천문 정보
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[500px] overflow-y-auto popover-scroll" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">달과 별의 관계</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        달은 밤하늘에서 가장 밝은 '자연 조명'입니다. 달이 없을수록 별은 잘 보입니다.
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">월령 (Moon Phase)</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          달이 얼마나 차올랐는지를 나타냅니다. (삭=0%, 보름=100%)
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          달빛은 매우 밝아서 주변의 어두운 별빛을 삼켜버립니다. 이를 '월광해'라고 합니다.
                        </p>
                        <p className="text-xs text-primary font-medium">
                          💡 그믐달~초승달 시기(월령이 작을수록)가 별 보기 가장 좋습니다. 보름달일 때는 1등성 같은 밝은 별만 보입니다.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">일출/일몰 & 월출/월몰</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          해와 달이 뜨고 지는 시각입니다.
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          해가 지고 나서도 여명이 사라질 때까지 기다려야 합니다(천문 박명). 달이 떠 있는 시간은 피하는 것이 좋습니다.
                        </p>
                        <p className="text-xs text-primary font-medium">
                          💡 최고의 관측 시간은 "해가 진 후 ~ 달이 뜨기 전" 또는 "달이 지고 난 후 ~ 해가 뜨기 전"입니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                광해 정보
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[500px] overflow-y-auto popover-scroll" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">빛 공해와 관측 등급</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        내 주변의 인공 불빛(가로등, 건물 등)이 얼마나 방해되는지를 알려줍니다.
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">광해 등급 (Bortle Scale)</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          밤하늘의 어두운 정도를 1~9등급으로 나눈 국제 표준 척도입니다.
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          숫자가 낮을수록(1에 가까울수록) 주변이 어둡고 별이 잘 보입니다.
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• <span className="text-primary font-medium">Class 1~3:</span> 은하수를 눈으로 볼 수 있는 청정 지역 (시골, 산)</p>
                          <p>• <span className="text-primary font-medium">Class 4~6:</span> 은하수는 희미하지만, 별자리는 잘 보임 (교외)</p>
                          <p>• <span className="text-primary font-medium">Class 7~9:</span> 1등성 등 밝은 별만 보임 (도심)</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">관측 가능 별 (Limiting Magnitude)</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          사람 눈으로 볼 수 있는 가장 어두운 별의 밝기(등급)입니다.
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          별의 밝기 등급은 숫자가 클수록 어두운 별을 뜻합니다. (예: 1등급은 밝고, 6등급은 매우 희미함)
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1 mb-2">
                          <p>• <span className="text-primary font-medium">3.0 등급:</span> 도심 하늘, 밝은 별만 보임</p>
                          <p>• <span className="text-primary font-medium">5.0 등급:</span> 교외 하늘, 쏟아지는 별을 기대할 수 있음</p>
                          <p>• <span className="text-primary font-medium">6.5 등급:</span> 최상의 조건, 맨눈으로 볼 수 있는 한계치</p>
                        </div>
                        <p className="text-xs text-primary font-medium">
                          💡 숫자가 클수록 환경이 좋은 것입니다!
                        </p>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
