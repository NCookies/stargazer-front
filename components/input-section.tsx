"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Telescope, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StargazingResponse } from "@/types/api"

interface InputSectionProps {
  selectedTime: string // "HH:mm" 형식 또는 "date-time" 형식
  onTimeChange: (time: string) => void
  onCalculate: (selectedTime: string) => Promise<void> | void
  responseData: StargazingResponse | null
  currentLat: number
  currentLon: number
  lastAnalyzedLat: number | null
  lastAnalyzedLon: number | null
  isLoading?: boolean
  error?: string | null
}

export function InputSection({ selectedTime, onTimeChange, onCalculate, responseData, currentLat, currentLon, lastAnalyzedLat, lastAnalyzedLon, isLoading, error }: InputSectionProps) {
  // 관측 가능한 시간대 생성 (현재 시간의 다음 정각부터 내일 08:00까지, 낮 시간 제외)
  const { timeSlots, defaultTime } = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // 시작 시간: 현재 시간의 다음 정각
    let startHour = currentHour
    if (currentMinute > 0) {
      startHour = currentHour + 1
    }
    if (startHour >= 24) {
      startHour = 0
    }
    
    const today = new Date(now)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const formatDate = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}/${day}`
    }
    
    const todayStr = formatDate(today)
    const tomorrowStr = formatDate(tomorrow)
    
    const slots: Array<{ time: string; date: string; dateLabel: string; hour: number }> = []
    
    let hour = startHour
    let isTomorrow = false
    let currentDateLabel = '오늘'
    let currentDateStr = todayStr
    let maxIterations = 48 // 무한 루프 방지 (최대 48시간)
    let iterations = 0
    
    // 내일 08:00까지 반복
    while (iterations < maxIterations) {
      iterations++
      
      // 날짜 변경: 00:00에 도달하면 내일로
      if (hour === 0 && !isTomorrow) {
        isTomorrow = true
        currentDateLabel = '내일'
        currentDateStr = tomorrowStr
      }
      
      // 내일 08:00까지 도달했으면 종료
      if (isTomorrow && hour > 8) {
        break
      }
      
      // 낮 시간대(09:00 ~ 16:59) 제외
      if (hour >= 9 && hour <= 16) {
        hour++
        if (hour >= 24) {
          hour = 0
        }
        continue
      }
      
      const timeStr = `${String(hour).padStart(2, '0')}:00`
      slots.push({
        time: timeStr,
        date: currentDateStr,
        dateLabel: currentDateLabel,
        hour: hour
      })
      
      // 내일 08:00까지 도달했으면 종료
      if (isTomorrow && hour === 8) {
        break
      }
      
      hour++
      if (hour >= 24) {
        hour = 0
      }
    }
    
    // 각 slot에 고유 키 추가 (date는 "MM/DD" 형식이므로 "-"로 변환)
    const slotsWithKey = slots.map(slot => {
      // "MM/DD" 형식을 "MM-DD"로 변환하여 키 생성
      const dateKey = slot.date.replace('/', '-')
      return {
        ...slot,
        key: `${dateKey}-${slot.time}` // "MM-DD-HH:mm" 형식
      }
    })
    
    // 기본값: 첫 번째 시간 (date-time 형식으로 저장)
    const defaultSlot = slotsWithKey.length > 0 ? slotsWithKey[0] : null
    const defaultTime = defaultSlot ? defaultSlot.key : '17:00'
    
    return { timeSlots: slotsWithKey, defaultTime }
  }, [])


  const [hasTimeChanged, setHasTimeChanged] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 선택된 시간이 없으면 기본값으로 설정
  // selectedTime이 "HH:mm" 형식이면 첫 번째 매칭되는 slot의 key로 변환
  const effectiveSelectedKey = useMemo(() => {
    if (!selectedTime) {
      return defaultTime
    }
    
    // 이미 "date-time" 형식이면 그대로 사용
    if (selectedTime.includes('-') && selectedTime.length > 5) {
      // 유효한 키인지 확인
      const isValidKey = timeSlots.some(slot => slot.key === selectedTime)
      return isValidKey ? selectedTime : defaultTime
    }
    
    // "HH:mm" 형식이면 첫 번째 매칭되는 slot의 key 반환
    const matchingSlot = timeSlots.find(slot => slot.time === selectedTime)
    return matchingSlot ? matchingSlot.key : defaultTime
  }, [selectedTime, defaultTime, timeSlots])

  // 초기 마운트 시 또는 선택된 시간이 시간대 목록에 없는 경우 기본값으로 설정
  const isInitialMount = useRef(true)
  const availableKeys = timeSlots.map(item => item.key)
  
  useEffect(() => {
    if (isInitialMount.current) {
      // 초기 마운트 시에만 기본값 설정
      if (!selectedTime && availableKeys.length > 0) {
        onTimeChange(defaultTime)
      }
      isInitialMount.current = false
    } else {
      // 선택된 시간이 시간대 목록에 없으면 기본값으로 설정
      if (selectedTime && availableKeys.length > 0 && !availableKeys.includes(effectiveSelectedKey)) {
        onTimeChange(defaultTime)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableKeys, defaultTime, effectiveSelectedKey]) // selectedTime과 onTimeChange를 의존성에서 제외하여 무한 루프 방지

  // 선택된 시간 또는 좌표가 변경되었는지 확인
  useEffect(() => {
    if (!responseData) {
      // 응답 데이터가 없으면 변경 없음
      setHasTimeChanged(false)
      return
    }

    // 응답 데이터의 시간과 현재 선택한 시간 비교
    const responseTime = responseData.time // "22:00"
    const responseDate = responseData.date // "2025-12-19"
    
    // responseDate를 "MM-DD" 형식으로 변환
    const responseDateParts = responseDate.split('-')
    const responseDateMMDD = responseDateParts.length >= 3 
      ? `${responseDateParts[1]}-${responseDateParts[2]}` // "MM-DD"
      : responseDate
    
    // effectiveSelectedKey 형식: "MM-DD-HH:mm"
    const responseKey = `${responseDateMMDD}-${responseTime}` // "MM-DD-HH:mm"
    const timeMatches = responseKey === effectiveSelectedKey
    
    // 좌표 변경 확인 (소수점 6자리까지 비교하여 위치 변경 감지)
    const coordinateMatches = lastAnalyzedLat !== null && lastAnalyzedLon !== null &&
      Math.abs(currentLat - lastAnalyzedLat) < 0.000001 &&
      Math.abs(currentLon - lastAnalyzedLon) < 0.000001
    
    // 시간 또는 좌표가 변경되었으면 갱신 필요
    const hasChanged = !timeMatches || !coordinateMatches
    setHasTimeChanged(hasChanged)
  }, [effectiveSelectedKey, responseData, currentLat, currentLon, lastAnalyzedLat, lastAnalyzedLon])

  // 선택된 시간으로 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(
        `[data-key="${effectiveSelectedKey}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [effectiveSelectedKey])

  // API 호출을 위해 key에서 date와 time 추출
  const getDateAndTimeFromKey = (key: string) => {
    // timeSlots에서 해당 key를 찾아서 date와 time 추출
    const slot = timeSlots.find(s => s.key === key)
    if (slot) {
      // slot.date는 "MM/DD" 형식이므로 "YYYY-MM-DD"로 변환
      const [month, day] = slot.date.split('/')
      const year = new Date().getFullYear()
      const date = `${year}-${month}-${day}`
      return { date, time: slot.time }
    }
    // key를 찾지 못한 경우 (하위 호환성)
    const parts = key.split('-')
    if (parts.length >= 4) {
      const date = `${new Date().getFullYear()}-${parts[0]}-${parts[1]}`
      const time = `${parts[2]}:${parts[3]}`
      return { date, time }
    }
    // 이미 "HH:mm" 형식이면 현재 날짜 사용
    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return { date, time: key }
  }

  const handleClick = async () => {
    // key에서 date와 time을 추출하여 전달
    const { date, time } = getDateAndTimeFromKey(effectiveSelectedKey)
    // "date|time" 형식으로 전달 (page.tsx에서 파싱)
    await onCalculate(`${date}|${time}`)
    setHasTimeChanged(false)
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Telescope className="w-6 h-6 text-primary" />
          오늘 분석
        </CardTitle>
        <CardDescription>시간대를 선택하여 별 관측 적합도를 분석합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 시간대 선택 타임라인 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">시간대 선택</label>
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(168, 85, 247, 0.2) transparent',
              }}
            >
              {timeSlots.map((item, index) => {
                // 날짜 변경 시 구분선과 날짜 레이블 표시
                const isNewDateSection = index === 0 || timeSlots[index - 1].dateLabel !== item.dateLabel
                
                return (
                  <div key={`${item.date}-${item.time}`} className="flex items-end gap-2 shrink-0">
                    {isNewDateSection && (
                      <>
                        {index > 0 && (
                          <div className="h-12 w-px bg-border/50 mx-1" />
                        )}
                        <div className="flex flex-col items-center gap-2 min-w-[60px]">
                          <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            {item.dateLabel}
                          </span>
                          <button
                            data-key={item.key}
                            onClick={() => onTimeChange(item.key)}
                            className={cn(
                              "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                              "border-2 min-w-[70px]",
                              effectiveSelectedKey === item.key
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                                : "bg-secondary/50 text-foreground border-border hover:bg-secondary hover:border-primary/50"
                            )}
                          >
                            {item.time}
                          </button>
                        </div>
                      </>
                    )}
                    {!isNewDateSection && (
                      <div className="flex flex-col items-center gap-2 min-w-[60px]">
                        <div className="h-6" /> {/* 날짜 레이블과 같은 높이의 공간 확보 */}
                        <button
                          data-key={item.key}
                          onClick={() => onTimeChange(item.key)}
                          className={cn(
                            "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                            "border-2 min-w-[70px] shrink-0",
                            effectiveSelectedKey === item.key
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                              : "bg-secondary/50 text-foreground border-border hover:bg-secondary hover:border-primary/50"
                          )}
                        >
                          {item.time}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 갱신 필요 표시 */}
          {hasTimeChanged && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">시간대 또는 위치가 변경되었습니다. 버튼을 눌러 분석을 갱신하세요.</span>
            </div>
          )}

          <Button
            onClick={handleClick}
            size="lg"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-70"
          >
            {isLoading && <Spinner className="mr-2" />}
            {isLoading ? "계산 중..." : "관측 적합도 계산하기"}
          </Button>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
