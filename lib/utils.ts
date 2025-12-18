import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MOON_PHASE_MAP: Record<string, { label: string, icon: string }> = {
  NEW_MOON: { label: "삭", icon: "🌑" },
  WAXING_CRESCENT: { label: "초승달", icon: "🌒" },
  FIRST_QUARTER: { label: "상현달", icon: "🌓" },
  WAXING_GIBBOUS: { label: "상현망간의 달", icon: "🌔" },
  FULL_MOON: { label: "보름달", icon: "🌕" },
  WANING_GIBBOUS: { label: "하현망간의 달", icon: "🌖" },
  LAST_QUARTER: { label: "하현달", icon: "🌗" },
  WANING_CRESCENT: { label: "그믐달", icon: "🌘" },
}
