"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { InputSection } from "@/components/input-section"
import { ResultSection } from "@/components/result-section"
import { ForecastView } from "@/components/forecast-view"
import { StarField } from "@/components/star-field"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import type { StargazingResponse, StargazingForecastResponse } from "@/types/api"
import { useToast } from "@/hooks/use-toast"

const MapSelector = dynamic(() => import("@/components/map/map-selector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
      <p className="text-muted-foreground">지도를 불러오는 중...</p>
    </div>
  ),
})

export default function Home() {
  const [activeTab, setActiveTab] = useState("forecast")
  const { toast } = useToast()
  
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

  const [lat, setLat] = useState(37.5665); // 서울 기본값
  const [lon, setLon] = useState(126.9780);

  // 선택된 시간 상태 (탭 전환 시에도 유지)
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // 마지막 분석에 사용한 좌표 저장
  const [lastAnalyzedLat, setLastAnalyzedLat] = useState<number | null>(null);
  const [lastAnalyzedLon, setLastAnalyzedLon] = useState<number | null>(null);

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

      const requestBody = {
        lat: lat,
        lon: lon,
        date: currentDate,
        time: currentTime,
      }

      console.log("📤 API 요청 데이터:", requestBody)

      const res = await fetch("/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status} ${res.statusText}`)
      }

      // 스프링 응답 데이터 파싱
      const data: StargazingResponse = await res.json()

      // 응답 데이터 검증
      if (!data || typeof data.totalScore !== "number") {
        throw new Error("서버 응답 형식이 올바르지 않습니다.")
      }

      setResponseData(data)
      setHasResult(true)
      setResultKey(prev => prev + 1) // 결과 섹션 재렌더링 트리거
      
      // 마지막 분석에 사용한 좌표 저장
      setLastAnalyzedLat(lat)
      setLastAnalyzedLon(lon)
      
      // 성공 토스트 메시지 표시
      toast({
        title: "분석 완료",
        description: `${data.date} ${data.time} 시간대의 관측 적합도 분석이 완료되었습니다.`,
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
      const requestBody = {
        lat: lat,
        lon: lon,
      }

      console.log("📤 예보 API 요청 데이터:", requestBody)

      const res = await fetch("/api/v1/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        // 서버 에러 응답 본문 읽기 시도
        let errorMessage = `서버 오류: ${res.status} ${res.statusText}`
        try {
          const errorData = await res.json()
          console.error("서버 에러 응답:", errorData)
          if (errorData.message) {
            errorMessage = `서버 오류: ${errorData.message}`
          } else if (typeof errorData === 'string') {
            errorMessage = `서버 오류: ${errorData}`
          }
        } catch (parseError) {
          // JSON 파싱 실패 시 텍스트로 읽기 시도
          try {
            const errorText = await res.text()
            console.error("서버 에러 응답 (텍스트):", errorText)
            if (errorText) {
              errorMessage = `서버 오류: ${errorText.substring(0, 200)}`
            }
          } catch (textError) {
            console.error("에러 응답 읽기 실패:", textError)
          }
        }
        throw new Error(errorMessage)
      }

      const data: StargazingForecastResponse = await res.json()

      if (!data || !data.dailyForecasts) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.")
      }

      setForecastData(data)
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

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            {/* 공동 지도 선택 */}
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="forecast">주간 예보</TabsTrigger>
                <TabsTrigger value="current">오늘 분석</TabsTrigger>
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
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
