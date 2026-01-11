"use client"

import { Header } from "@/components/header"
import { StarField } from "@/components/star-field"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Camera, 
  Moon, 
  MapPin, 
  Clock, 
  Settings, 
  AlertCircle, 
  Star,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from "lucide-react"
import Link from "next/link"

export default function GuidePage() {
  return (
    <div className="relative min-h-screen">
      <StarField />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* 뒤로가기 버튼 */}
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                메인으로 돌아가기
              </Button>
            </Link>

            {/* 헤더 섹션 */}
            <div className="space-y-2 mt-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                스마트폰으로 별 사진 찍는 방법
              </h1>
              <p className="text-muted-foreground text-lg">
                초보자를 위한 갤럭시 / 아이폰 별 사진 촬영 가이드
              </p>
            </div>

            {/* 핵심 요약 */}
            <Card className="border-primary/50 bg-primary/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  핵심 원리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium mb-2">
                  <strong>&quot;어두운 환경 + 장노출 + 흔들림 최소화&quot;</strong>
                </p>
                <p className="text-muted-foreground">
                  최근 스마트폰은 천체 촬영을 고려한 전용 모드와 계산 촬영(Computational Photography)을 지원합니다. 
                  기본 원리만 이해하면 충분히 만족스러운 결과를 얻을 수 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* 1. 준비 사항 */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Camera className="w-6 h-6 text-primary" />
                  1. 별 사진 촬영 전 공통 준비 사항
                  <Badge variant="destructive" className="ml-2">중요</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    ① 장소 선택
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span><strong>도심 불가</strong>: 가로등, 건물 불빛이 없는 장소</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span><strong>추천</strong>: 해안가, 산 정상, 농촌 지역</span>
                    </li>
                  </ul>
                  <div className="mt-3 p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="font-semibold mb-2">광해 지수(Bortle Scale) 기준</p>
                    <ul className="space-y-1 text-sm">
                      <li>⭐ 1~4등급: 은하수 가능</li>
                      <li>⭐ 5~6등급: 밝은 별자리 위주</li>
                      <li>⭐ 7 이상: 촬영 난이도 매우 높음</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    ② 시간대
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="flex items-start gap-2">
                      <Moon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span><strong>달 없는 날(그믐 전후)</strong>이 최적</span>
                    </li>
                    <li><strong>밤 10시 ~ 새벽 3시</strong> 권장</li>
                    <li>여름: 은하수 중심부 촬영 유리</li>
                    <li>겨울: 공기 투명도 높아 별 선명</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-accent" />
                    ③ 필수 장비
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span><strong>삼각대 (필수)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>블루투스 리모컨 또는 <strong>2~10초 타이머</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>스마트폰 케이스 분리 (렌즈 간섭 방지)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 2. 갤럭시 방법 */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Smartphone className="w-6 h-6 text-primary" />
                  2. 갤럭시 스마트폰 별 사진 촬영 방법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    2-1. 천체 사진 모드 (최신 기종 권장)
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    지원 기종 예: S22 / S23 / S24 Ultra 이상
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold mb-2">설정 방법</p>
                      <ol className="list-decimal space-y-2 ml-6">
                        <li>카메라 앱 실행</li>
                        <li><strong>[더보기] → [전문가 RAW]</strong></li>
                        <li>상단에서 <strong>[천체 사진]</strong> 활성화</li>
                        <li>삼각대 고정 후 촬영</li>
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="font-semibold mb-2">특징</p>
                      <ul className="space-y-1 text-sm">
                        <li>• 수십~수백 장 촬영 후 자동 합성</li>
                        <li>• 별 궤적 보정 및 노이즈 제거</li>
                        <li>• 은하수 촬영 가능</li>
                      </ul>
                      <p className="mt-3 text-sm font-medium text-primary">
                        💡 별 사진 입문자는 이 모드 하나만 써도 충분합니다!
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    2-2. 프로(Pro) 모드 수동 촬영
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-secondary/50">
                          <th className="border border-border p-3 text-left">항목</th>
                          <th className="border border-border p-3 text-left">값</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3">ISO</td>
                          <td className="border border-border p-3">800 ~ 3200</td>
                        </tr>
                        <tr className="bg-secondary/30">
                          <td className="border border-border p-3">셔터속도</td>
                          <td className="border border-border p-3">10 ~ 20초</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">초점</td>
                          <td className="border border-border p-3">MF → ∞(무한대)</td>
                        </tr>
                        <tr className="bg-secondary/30">
                          <td className="border border-border p-3">화이트밸런스</td>
                          <td className="border border-border p-3">3800~4500K</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">파일 형식</td>
                          <td className="border border-border p-3">RAW (DNG)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="font-semibold mb-2">촬영 팁</p>
                    <ul className="space-y-1 text-sm">
                      <li>• 셔터속도 20초 초과 시 별이 흐려짐(지구 자전)</li>
                      <li>• ISO는 최대한 낮게, 밝기는 노출로 확보</li>
                      <li>• AF 사용 금지 → 반드시 수동 초점</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. 아이폰 방법 */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Smartphone className="w-6 h-6 text-primary" />
                  3. 아이폰 별 사진 촬영 방법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    3-1. 기본 야간 모드 활용 (가장 현실적인 방법)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold mb-2">설정 방법</p>
                      <ol className="list-decimal space-y-2 ml-6">
                        <li>카메라 앱 실행</li>
                        <li>어두운 환경에서 <strong>야간 모드 자동 활성화</strong></li>
                        <li>상단 야간 모드 아이콘 클릭</li>
                        <li><strong>노출 시간 최대로 설정 (최대 30초)</strong></li>
                        <li>삼각대 고정 후 촬영</li>
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="font-semibold mb-2">조건</p>
                      <ul className="space-y-1 text-sm">
                        <li>• 삼각대 사용 시에만 30초 선택 가능</li>
                        <li>• 손으로 들면 최대 10초 제한</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    3-2. 서드파티 앱 사용 (고급)
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    추천 앱: <strong>Halide</strong>, <strong>ProCamera</strong>, <strong>NightCap</strong>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-secondary/50">
                          <th className="border border-border p-3 text-left">항목</th>
                          <th className="border border-border p-3 text-left">값</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3">모드</td>
                          <td className="border border-border p-3">Stars / Long Exposure</td>
                        </tr>
                        <tr className="bg-secondary/30">
                          <td className="border border-border p-3">ISO</td>
                          <td className="border border-border p-3">1600 ~ 3200</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">노출</td>
                          <td className="border border-border p-3">15~30초</td>
                        </tr>
                        <tr className="bg-secondary/30">
                          <td className="border border-border p-3">초점</td>
                          <td className="border border-border p-3">Infinity</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">저장</td>
                          <td className="border border-border p-3">RAW</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. 촬영 후 보정 */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">4. 촬영 후 보정 (결과 차이 큼)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">추천 앱</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Lightroom Mobile</strong></li>
                    <li>• <strong>Snapseed</strong></li>
                    <li>• (PC) Lightroom / Photoshop</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">기본 보정 순서</p>
                  <ol className="list-decimal space-y-2 ml-6">
                    <li>노출 +0.3~0.8</li>
                    <li>대비 +10~20</li>
                    <li>하이라이트 ↓</li>
                    <li>그림자 ↑</li>
                    <li>노이즈 감소 (과하지 않게)</li>
                    <li>색온도 약간 차갑게</li>
                  </ol>
                  <p className="mt-3 text-sm text-muted-foreground">
                    💡 RAW 파일일수록 별 보정 자유도가 높습니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. 실패 원인 */}
            <Card className="border-destructive/50 bg-destructive/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                  5. 실패 원인 TOP 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 ml-6 text-lg">
                  <li><strong>삼각대 미사용</strong></li>
                  <li>자동 초점 사용</li>
                  <li>셔터속도 과다 (별 번짐)</li>
                  <li>달 밝은 날 촬영</li>
                  <li>렌즈에 손자국/김 서림</li>
                </ol>
              </CardContent>
            </Card>

            {/* 한 줄 요약 */}
            <Card className="border-accent/50 bg-accent/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">6. 한 줄 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-xl font-bold text-center p-6 bg-card/50 rounded-lg border-l-4 border-accent">
                  &quot;어두운 곳 + 삼각대 + 장노출 + 수동 초점&quot;
                  <br />
                  <span className="text-lg font-normal text-muted-foreground mt-2 block">
                    이 네 가지만 지켜도 스마트폰 별 사진은 성공 확률이 급격히 올라갑니다.
                  </span>
                </blockquote>
              </CardContent>
            </Card>

            {/* 뒤로가기 버튼 */}
            <div className="flex justify-center pt-6">
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  메인으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

