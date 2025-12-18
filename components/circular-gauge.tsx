"use client"

import { useEffect, useState } from "react"

interface CircularGaugeProps {
  score: number
}

export function CircularGauge({ score }: CircularGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore((prev) => {
          if (prev >= score) {
            clearInterval(interval)
            return score
          }
          return prev + 1
        })
      }, 15)
      return () => clearInterval(interval)
    }, 300)

    return () => clearTimeout(timer)
  }, [score])

  const radius = 120
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-accent"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "rgb(74, 222, 128)"
    if (score >= 60) return "rgb(250, 204, 21)"
    if (score >= 40) return "rgb(251, 146, 60)"
    return "rgb(248, 113, 113)"
  }

  return (
    <div className="relative w-64 h-64">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
        {/* Background circle */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke="currentColor"
          strokeWidth="20"
          fill="none"
          className="text-secondary/50"
        />

        {/* Progress circle */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke={getStrokeColor(animatedScore)}
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 drop-shadow-[0_0_10px_currentColor]"
          style={{
            filter: `drop-shadow(0 0 10px ${getStrokeColor(animatedScore)})`,
          }}
        />

        {/* Inner glow circle */}
        <circle
          cx="140"
          cy="140"
          r={radius - 30}
          fill="none"
          stroke={getStrokeColor(animatedScore)}
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-6xl font-bold ${getColor(animatedScore)} drop-shadow-[0_0_20px_currentColor]`}>
          {animatedScore}
        </div>
        <div className="text-sm text-muted-foreground mt-2">관측 적합도</div>
      </div>
    </div>
  )
}
