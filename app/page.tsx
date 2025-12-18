"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { InputSection } from "@/components/input-section"
import { ResultSection } from "@/components/result-section"
import { StarField } from "@/components/star-field"

export default function Home() {
  const [hasResult, setHasResult] = useState(false)
  const [suitabilityScore, setSuitabilityScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lat, setLat] = useState(37.5665); // 서울 기본값
  const [lon, setLon] = useState(126.9780);
  const [locationName, setLocationName] = useState("서울 (지도에서 선택)");

  const handleCalculate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // TODO: 실제 입력값(state)을 연결해서 보내기
          lat: lat,
          lon: lon,
          date: "2024-05-20",
          time: "22:00",
        }),
      })

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status} ${res.statusText}`)
      }

      // 서버에서 점수를 내려주는 형태를 가정
      const data = await res.json().catch(() => null)
      const score =
        typeof data?.score === "number"
          ? data.score
          : Math.floor(Math.random() * 40) + 60 // fallback 더미 점수

      setSuitabilityScore(score)
      setHasResult(true)
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

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            <InputSection 
              onCalculate={handleCalculate} 
              isLoading={isLoading} 
              error={error}
              lat={lat}
              lon={lon}
              setLat={setLat}
              setLon={setLon}
              setLocationName={setLocationName}
            />
            {hasResult && <ResultSection score={suitabilityScore} />}
          </div>
        </main>
      </div>
    </div>
  )
}
