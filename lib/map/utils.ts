/**
 * 지역 감지 유틸리티
 */

/**
 * 국가 코드 감지 방식
 */
type CountryDetectionMethod = 'timezone' | 'locale' | 'api'

/**
 * 타임존으로 한국 여부 감지
 * 한국 타임존: Asia/Seoul
 */
function isKoreaByTimezone(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezone === 'Asia/Seoul'
  } catch {
    return false
  }
}

/**
 * 브라우저 locale로 한국 여부 감지
 */
function isKoreaByLocale(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const locale = navigator.language || (navigator as any).userLanguage
    return locale.toLowerCase().startsWith('ko')
  } catch {
    return false
  }
}

/**
 * GeoIP API로 국가 코드 가져오기 (선택적)
 * 실제 구현 시 GeoIP 서비스 (예: ipapi.co, ip-api.com) 사용 가능
 */
async function getCountryByAPI(): Promise<string | null> {
  try {
    // 예시: 무료 GeoIP API 사용
    // 실제로는 환경 변수로 API 키 설정 필요
    // const response = await fetch('https://ipapi.co/json/')
    // const data = await response.json()
    // return data.country_code
    
    // 현재는 비활성화 (API 호출 비용 및 속도 고려)
    return null
  } catch {
    return null
  }
}

/**
 * 현재 사용자가 한국에 있는지 여부를 감지
 * 
 * @param method 감지 방식 ('timezone' | 'locale' | 'api')
 * @returns 한국 여부
 */
export function detectIsKorea(method: CountryDetectionMethod = 'timezone'): boolean {
  if (typeof window === 'undefined') {
    console.log('[detectIsKorea] 서버 사이드에서는 false 반환')
    return false
  }
  
  let result = false
  switch (method) {
    case 'timezone':
      result = isKoreaByTimezone()
      break
    case 'locale':
      result = isKoreaByLocale()
      break
    case 'api':
      // API는 비동기이므로 동기 함수에서는 사용 불가
      // 별도의 비동기 함수 사용 필요
      result = isKoreaByTimezone() // fallback
      break
    default:
      result = isKoreaByTimezone()
  }
  
  console.log('[detectIsKorea] 결과:', { method, result })
  return result
}

/**
 * 비동기로 국가 코드 감지 (API 사용)
 * 
 * @param fallbackMethod API 실패 시 사용할 fallback 방식
 * @returns 한국 여부
 */
export async function detectIsKoreaAsync(
  fallbackMethod: CountryDetectionMethod = 'timezone'
): Promise<boolean> {
  // API로 국가 코드 가져오기
  const countryCode = await getCountryByAPI()
  
  if (countryCode) {
    return countryCode.toUpperCase() === 'KR'
  }
  
  // API 실패 시 fallback 방식 사용
  return detectIsKorea(fallbackMethod)
}

/**
 * 환경 변수로 강제 설정된 Provider 타입 가져오기
 */
export function getForcedProviderType(): 'kakao' | 'google' | null {
  if (typeof window === 'undefined') {
    console.log('[getForcedProviderType] 서버 사이드에서는 null 반환')
    return null
  }
  
  const forced = process.env.NEXT_PUBLIC_MAP_PROVIDER
  console.log('[getForcedProviderType] 환경 변수 확인:', { forced })
  
  if (forced === 'kakao' || forced === 'google') {
    return forced
  }
  
  return null
}

