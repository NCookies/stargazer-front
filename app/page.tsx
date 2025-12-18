"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { InputSection } from "@/components/input-section"
import { ResultSection } from "@/components/result-section"
import { StarField } from "@/components/star-field"

export default function Home() {
  const [hasResult, setHasResult] = useState(false)
  const [suitabilityScore, setSuitabilityScore] = useState(0)

  const handleCalculate = () => {
    // Simulate calculation - in real app this would call an API
    const score = Math.floor(Math.random() * 40) + 60 // Random score 60-100
    setSuitabilityScore(score)
    setHasResult(true)
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            <InputSection onCalculate={handleCalculate} />
            {hasResult && <ResultSection score={suitabilityScore} />}
          </div>
        </main>
      </div>
    </div>
  )
}
