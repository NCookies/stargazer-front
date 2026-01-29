// 스프링 백엔드 API 응답 타입 정의

// 공통 응답 래퍼
export interface CommonResponse<T> {
  success: boolean
  status: number
  message: string
  data: T
}

export interface WeatherInfo {
  cloudIndex: number // 구름량 (%)
  humidityIndex: number // 습도 (%)
  visibilityText: string // "매우 좋음", "보통" 등
}

export interface AstronomyInfo {
  moonPhase: string // "초승달"
  sunrise: string // "06:30"
  sunset: string // "19:32"
  moonrise: string // "23:45"
  moonset: string // "12:00"
}

export interface LightPollutionInfo {
  bortleClass: string // "Class 3"
  brightness: string // "낮음", "높음"
  limitingMag: string // "6등급"
}

export interface StargazingResponse {
  date: string // "2025-12-19"
  time: string // "22:00"
  totalScore: number // 종합 점수
  aiComment: string | null // AI 한줄 평
  reasons: string[] | null // 분석 점수에 대한 이유들
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
  reasons: string[] | null // 분석 점수에 대한 이유들
}

export interface DailyForecast {
  date: string // "2025-05-20 (금)"
  sunrise: string // "06:30"
  sunset: string // "19:32"
  moonrise: string // "23:45"
  moonset: string // "12:00"
  hourlyForecasts: HourlyForecast[]
}

export interface StargazingForecastResponse {
  dailyForecasts: DailyForecast[]
}

// 별보기 명소 스팟 관련 타입
export interface StargazingSpot {
  id: number
  title: string
  address: string
  latitude: number
  longitude: number
  description: string
  bortleScale: number // 1-9 스케일
  isParkingAvailable: boolean
  isRestroomAvailable: boolean
  isCarAccess: boolean
}

// 오늘의 추천 북마크 API 응답 타입
export interface RecommendedBookmarkItemResponse {
  bookmarkId: number
  name: string
  latitude: number
  longitude: number
  address: string
  score: number // 0–100
  reasons: string[]
  starGrade: string
  cloudCover: number
  moonPhase: string
  bestTime: string
}

export interface RecommendedBookmarkResponse {
  items: RecommendedBookmarkItemResponse[]
  totalRequested: number
  analyzedCount: number
  isPartialResult: boolean
}
