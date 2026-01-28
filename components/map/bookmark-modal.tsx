"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { MapPosition } from '@/lib/map/types'
import { bookmarksApi } from '@/lib/api'
import { bookmarkStore } from '@/lib/store/bookmarkStore'

interface BookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: MapPosition | null
  address: string
  onSave?: (bookmark: any) => void
}

export function BookmarkModal({
  open,
  onOpenChange,
  position,
  address,
  onSave,
}: BookmarkModalProps) {
  const [customName, setCustomName] = useState('')
  const [memo, setMemo] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { addBookmark, bookmarks } = bookmarkStore()

  // 모달이 열릴 때마다 기본값: 장소 이름은 주소로 채움
  useEffect(() => {
    if (open) {
      setCustomName(address || '')
      setMemo('')
    }
  }, [open, address])

  const handleSave = async () => {
    if (!position) {
      toast({
        title: '오류',
        description: '위치 정보가 없습니다.',
        variant: 'destructive',
      })
      return
    }

    if (!customName.trim()) {
      toast({
        title: '오류',
        description: '장소 이름을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    // 북마크 추가 전 좌표 중복 확인
    const hasDuplicateCoordinates = bookmarks.some((bookmark) => {
      if (!bookmark.latitude || !bookmark.longitude) return false
      // 좌표값이 완전히 동일한지 확인 (부동소수점 오차 고려)
      const latDiff = Math.abs(bookmark.latitude - position.lat)
      const lonDiff = Math.abs(bookmark.longitude - position.lng)
      return latDiff < 0.000001 && lonDiff < 0.000001
    })

    if (hasDuplicateCoordinates) {
      toast({
        title: '중복된 위치',
        description: '이미 동일한 좌표의 북마크가 존재합니다.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await bookmarksApi.addBookmark({
        type: 'CUSTOM',
        spotId: undefined,
        name: customName.trim(),
        latitude: position.lat,
        longitude: position.lng,
        address: address,
        memo: memo.trim() || undefined,
      })

      // Store에 추가
      addBookmark(response)

      toast({
        title: '성공',
        description: '북마크가 저장되었습니다.',
      })

      // 모달 닫기
      onOpenChange(false)
      setCustomName('')
      setMemo('')

      // 콜백 호출 (추가된 북마크 정보 전달)
      onSave?.(response)
    } catch (error) {
      console.error('북마크 저장 오류:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '북마크 저장에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCustomName('')
    setMemo('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            나만의 장소 추가
          </DialogTitle>
          <DialogDescription>
            클릭한 위치를 북마크로 저장합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          {/* 장소 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="customName">장소 이름 *</Label>
            <Input
              id="customName"
              value={customName}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setCustomName(e.target.value)
                }
              }}
              placeholder="예: 우리 집, 관측 장소 등"
              disabled={isSaving}
              maxLength={50}
            />
            <div className="text-xs text-muted-foreground text-right">
              {customName.length}/50
            </div>
          </div>

          {/* 메모 입력 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택사항)</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setMemo(e.target.value)
                }
              }}
              placeholder="이 장소에 대한 메모를 작성해주세요 (최대 500자)"
              disabled={isSaving}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {memo.length}/500
            </div>
          </div>

          {/* 주소 표시 */}
          <div className="space-y-2">
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              value={address}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* 좌표 표시 (숨김 필드) */}
          {position && (
            <div className="space-y-2">
              <Label htmlFor="coordinates">좌표</Label>
              <Input
                id="coordinates"
                value={`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
                readOnly
                className="bg-muted text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !customName.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
