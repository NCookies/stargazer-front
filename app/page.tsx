"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "@/components/header"
import { InputSection } from "@/components/input-section"
import { ResultSection } from "@/components/result-section"
import { ForecastView } from "@/components/forecast-view"
import { TodayRecommendView } from "@/components/today-recommend-view"
import { StarField } from "@/components/star-field"
import { authStore } from "@/lib/store/authStore"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Camera, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { StargazingResponse, StargazingForecastResponse, RecommendedBookmarkResponse } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { stargazingApi, recommendsApi } from "@/lib/api"
import { AxiosError } from "axios"

const MapSelector = dynamic(() => import("@/components/map/map-selector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
      <p className="text-muted-foreground">지도를 불러오는 중...</p>
    </div>
  ),
})

export default function Home() {
  const [activeTab, setActiveTab] = useState("forecast")
  const { toast } = useToast()
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  
  // 현재 관측 관련 상태
  const [hasResult, setHasResult] = useState(false)
  const [responseData, setResponseData] = useState<StargazingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultKey, setResultKey] = useState(0) // 결과 섹션 재렌더링용 키

  // 예보 관련 상태
  const [forecastData, setForecastData] = useState<StargazingForecastResponse | null>(null)
  const [isForecastLoading, setIsForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  // 오늘의 추천 북마크 상태 (탭 전환해도 유지)
  const [recommendData, setRecommendData] = useState<RecommendedBookmarkResponse | null>(null)
  const [isRecommendLoading, setIsRecommendLoading] = useState(false)
  const [recommendError, setRecommendError] = useState<string | null>(null)

  const [lat, setLat] = useState(37.5665); // 서울 기본값
  const [lon, setLon] = useState(126.9780);
  const [isLocationInitialized, setIsLocationInitialized] = useState(false);
  const mapCardRef = useRef<HTMLDivElement>(null);

  // 선택된 시간 상태 (탭 전환 시에도 유지)
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // 마지막 분석에 사용한 좌표 저장
  const [lastAnalyzedLat, setLastAnalyzedLat] = useState<number | null>(null);
  const [lastAnalyzedLon, setLastAnalyzedLon] = useState<number | null>(null);

  // 컴포넌트 마운트 시 현재 위치 가져오기
  useEffect(() => {
    if (isLocationInitialized) return // 이미 초기화되었으면 중복 실행 방지

    if (!navigator.geolocation) {
      console.log('Geolocation API를 지원하지 않는 브라우저입니다. 기본 위치(서울)를 사용합니다.')
      setIsLocationInitialized(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude
        const currentLon = position.coords.longitude
        
        console.log('현재 위치 가져오기 성공:', { lat: currentLat, lon: currentLon })
        
        // 현재 위치로 초기 좌표 설정
        setLat(currentLat)
        setLon(currentLon)
        setIsLocationInitialized(true)
      },
      (error) => {
        console.log('현재 위치 가져오기 실패, 기본 위치(서울)를 사용합니다:', error.message)
        // 위치를 가져오지 못해도 기본값(서울)을 사용하므로 에러 처리하지 않음
        setIsLocationInitialized(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // 캐시된 위치 사용하지 않음
      }
    )
  }, [isLocationInitialized])

  // 현재 관측 분석 API 호출
  const handleCalculate = async (selectedTimeOrKey: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const now = new Date() // 모든 분기에서 사용 가능하도록 함수 시작 부분에서 정의
      let currentDate: string
      let currentTime: string
      
      // "date|time" 형식인지 확인 (새로운 키 형식)
      if (selectedTimeOrKey.includes('|')) {
        const [date, time] = selectedTimeOrKey.split('|')
        currentDate = date
        currentTime = time
      } else {
        // 기존 "HH:mm" 형식 또는 "MM-DD-HH-mm" 형식 (하위 호환성)
        const localYear = now.getFullYear()
        const localMonth = String(now.getMonth() + 1).padStart(2, '0')
        const localDay = String(now.getDate()).padStart(2, '0')
        
        // "MM-DD-HH-mm" 형식인 경우
        if (selectedTimeOrKey.includes('-') && selectedTimeOrKey.length > 5) {
          const parts = selectedTimeOrKey.split('-')
          if (parts.length >= 4) {
            currentDate = `${localYear}-${parts[0]}-${parts[1]}`
            currentTime = `${parts[2]}:${parts[3]}`
          } else {
            // 기존 로직
            const selectedHour = parseInt(selectedTimeOrKey.split(':')[0])
            const currentHour = now.getHours()
            
            let targetDate = `${localYear}-${localMonth}-${localDay}`
            if (selectedHour <= 8 && currentHour >= 17) {
              const nextDay = new Date(now)
              nextDay.setDate(nextDay.getDate() + 1)
              const nextYear = nextDay.getFullYear()
              const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0')
              const nextDayStr = String(nextDay.getDate()).padStart(2, '0')
              targetDate = `${nextYear}-${nextMonth}-${nextDayStr}`
            }
            currentDate = targetDate
            currentTime = selectedTimeOrKey
          }
        } else {
          // 기존 "HH:mm" 형식
          const selectedHour = parseInt(selectedTimeOrKey.split(':')[0])
          const currentHour = now.getHours()
          
          let targetDate = `${localYear}-${localMonth}-${localDay}`
          if (selectedHour <= 8 && currentHour >= 17) {
            const nextDay = new Date(now)
            nextDay.setDate(nextDay.getDate() + 1)
            const nextYear = nextDay.getFullYear()
            const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0')
            const nextDayStr = String(nextDay.getDate()).padStart(2, '0')
            targetDate = `${nextYear}-${nextMonth}-${nextDayStr}`
          }
          currentDate = targetDate
          currentTime = selectedTimeOrKey
        }
      }

      // 디버깅: 전송되는 데이터 확인
      console.log("📅 전송되는 날짜/시간 (한국 시간 기준):", { date: currentDate, time: currentTime, localTime: now.toString() })

      // 시간 문자열을 객체로 변환 (HH:mm 형식)
      const [hour, minute] = currentTime.split(':').map(Number)

      // 새로운 API 클라이언트 사용
      const response = await stargazingApi.analyzeStargazingCondition({
        lat,
        lon,
        date: currentDate,
        time: {
          hour,
          minute,
        },
      })

      // 디버깅: 응답 데이터 콘솔 출력
      console.log("📥 API 응답 데이터:", response)

      // 응답 검증
      if (!response || typeof response.totalScore !== "number") {
        throw new Error("서버 응답 형식이 올바르지 않습니다.")
      }

      setResponseData(response as StargazingResponse)
      setHasResult(true)
      setResultKey(prev => prev + 1) // 결과 섹션 재렌더링 트리거
      
      // 마지막 분석에 사용한 좌표 저장
      setLastAnalyzedLat(lat)
      setLastAnalyzedLon(lon)
      
      // 성공 토스트 메시지 표시
      toast({
        title: "분석 완료",
        description: `${response.date} ${response.time} 시간대의 관측 적합도 분석이 완료되었습니다.`,
      })
    } catch (err) {
      console.error("API 요청 실패:", err)
      setHasResult(false)
      
      // 네트워크 에러인 경우 더 구체적인 메시지 표시
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "서버에 연결할 수 없습니다. 백엔드 서버(localhost:8080)가 실행 중인지 확인해주세요."
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("알 수 없는 오류가 발생했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 주간 예보 API 호출
  const fetchForecast = useCallback(async () => {
    setIsForecastLoading(true)
    setForecastError(null)

    try {
      // 현재 날짜와 시간 생성 (더미 데이터 - 백엔드 nonnull 요구사항 충족)
      const now = new Date()
      const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const currentTime = "00:00" // 더미 시간 값

      // 시간 문자열을 객체로 변환 (HH:mm 형식)
      const [hour, minute] = currentTime.split(':').map(Number)

      // 새로운 API 클라이언트 사용
      const response = await stargazingApi.getForecast({
        lat,
        lon,
        date: currentDate,
        time: {
          hour,
          minute,
        },
      })

      // 디버깅: 응답 데이터 콘솔 출력
      console.log("📥 예보 API 응답 데이터:", response)

      // 응답 검증
      if (!response || !response.dailyForecasts) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.")
      }

      setForecastData(response as StargazingForecastResponse)
    } catch (err) {
      console.error("예보 API 요청 실패:", err)
      setForecastData(null)
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setForecastError(
          "서버에 연결할 수 없습니다. 백엔드 서버(localhost:8080)가 실행 중인지 확인해주세요."
        )
      } else if (err instanceof Error) {
        setForecastError(err.message)
      } else {
        setForecastError("알 수 없는 오류가 발생했습니다.")
      }
    } finally {
      setIsForecastLoading(false)
    }
  }, [lat, lon])

  // 예보 탭이 활성화되고 위치가 변경되면 자동으로 예보 데이터 가져오기
  useEffect(() => {
    if (activeTab === "forecast") {
      fetchForecast()
    }
  }, [activeTab, fetchForecast])

  // 오늘의 추천 북마크 조회 (상태는 page에 두어 탭 전환해도 유지)
  const handleFetchRecommend = useCallback(async () => {
    setIsRecommendLoading(true)
    setRecommendError(null)
    try {
      const response = await recommendsApi.getTodayRecommendedBookmarks()
      setRecommendData(response)
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setRecommendError("로그인이 필요합니다.")
      } else {
        setRecommendError("잠시 후 다시 시도해 주세요.")
      }
    } finally {
      setIsRecommendLoading(false)
    }
  }, [])

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            {/* 별 사진 촬영 가이드 배너 */}
            <Card className="border-primary/50 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 backdrop-blur-sm">
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold">별 사진 촬영이 처음이신가요?</h2>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      스마트폰으로 별 사진을 찍는 방법을 단계별로 알아보세요
                    </p>
                  </div>
                  <Link href="/guide">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      촬영 가이드 보기
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 공동 지도 선택 */}
            <div ref={mapCardRef}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    위치 선택
                  </CardTitle>
                  <CardDescription>지도에서 위치를 선택하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <MapSelector lat={lat} lon={lon} setLat={setLat} setLon={setLon} />
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="forecast">주간 예보</TabsTrigger>
                <TabsTrigger value="current">오늘 분석</TabsTrigger>
                <TabsTrigger value="recommend">오늘의 추천</TabsTrigger>
              </TabsList>
              
              <TabsContent value="forecast" className="mt-6 space-y-4">
                {forecastError && (
                  <Card className="border-destructive/50 bg-destructive/10 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <p className="text-center text-destructive text-sm">{forecastError}</p>
                    </CardContent>
                  </Card>
                )}
                <ForecastView data={forecastData} isLoading={isForecastLoading} />
              </TabsContent>
              
              <TabsContent value="current" className="mt-6 space-y-8">
                <InputSection 
                  selectedTime={selectedTime ?? ""}
                  onTimeChange={(time) => setSelectedTime(time)}
                  onCalculate={(time) => handleCalculate(time)} 
                  responseData={responseData}
                  currentLat={lat}
                  currentLon={lon}
                  lastAnalyzedLat={lastAnalyzedLat}
                  lastAnalyzedLon={lastAnalyzedLon}
                  isLoading={isLoading} 
                  error={error}
                />
                {hasResult && responseData ? (
                  <ResultSection key={resultKey} data={responseData} />
                ) : (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        위의 "관측 적합도 계산하기" 버튼을 눌러 현재 관측 정보를 확인하세요.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recommend" className="mt-6">
                {isAuthenticated ? (
                  <TodayRecommendView
                    data={recommendData}
                    isLoading={isRecommendLoading}
                    error={recommendError}
                    onFetch={handleFetchRecommend}
                    onFocusOnMap={(lat: number, lon: number) => {
                      setLat(lat)
                      setLon(lon)
                      mapCardRef.current?.scrollIntoView({ behavior: "smooth" })
                    }}
                  />
                ) : (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8">
                      <p className="text-center text-muted-foreground mb-4">
                        이 기능을 사용하려면 로그인이 필요합니다.
                      </p>
                      <div className="flex justify-center">
                        <Link href="/login">
                          <Button>로그인하기</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
