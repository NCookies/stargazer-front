// 스프링 백엔드 API 응답 타입 정의

export interface WeatherInfo {
  cloudIndex: number // 구름량 (%)
  humidityIndex: number // 습도 (%)
  visibilityText: string // "매우 좋음", "보통" 등
}

export interface AstronomyInfo {
  moonPhase: string // "FULL_MOON", "NEW_MOON" 등
  moonRiseTime: string // "23:45"
  sunsetTime: string // "19:32"
}

export interface LightPollutionInfo {
  bortleClass: string // "Class 3"
  brightness: string // "낮음", "높음"
  limitingMag: string // "6등급"
}

export interface StargazingResponse {
  totalScore: number // 종합 점수
  aiComment: string | null // AI 한줄 평
  weather: WeatherInfo | null // 기상 정보
  astronomy: AstronomyInfo | null // 천문 정보
  lightPollution: LightPollutionInfo | null // 광해 정보
}

// 주간 예보 관련 타입
export interface HourlyForecast {
  time: string // "21:00"
  score: number // 0~100
  starGrade: string // "4.5등급"
  cloudCover: number // 0~100
  moonPhase: string // "FULL_MOON", "NEW_MOON" 등
}

export interface DailyForecast {
  date: string // "2025-05-20 (금)"
  hourlyForecasts: HourlyForecast[]
}

export interface StargazingForecastResponse {
  dailyForecasts: DailyForecast[]
}

