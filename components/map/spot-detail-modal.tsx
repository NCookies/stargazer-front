"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Star, Car, ParkingCircle, UtensilsCrossed, MapPin, Bookmark, X, Edit2, Check, X as XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { authStore } from '@/lib/store/authStore'
import { bookmarkStore } from '@/lib/store/bookmarkStore'
import { bookmarksApi } from '@/lib/api'
import type { StargazingSpot } from '@/types/api'
import type { BookmarkResponse } from '@/lib/store/bookmarkStore'

interface SpotDetailModalProps {
  spot?: StargazingSpot | null
  bookmark?: BookmarkResponse | null
  onClose: () => void
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  mapProvider?: any
}

/**
 * 명소/북마크 통합 상세 모달 컴포넌트
 * 명소와 북마크 모두를 표시할 수 있는 재사용 가능한 컴포넌트
 */
export function SpotDetailModal({
  spot,
  bookmark,
  onClose,
  onLocationSelect,
  mapProvider,
}: SpotDetailModalProps) {
  const { toast } = useToast()
  const { isAuthenticated } = authStore()
  const { isSpotBookmarked, getBookmarkBySpotId, addBookmark, updateBookmark, removeBookmark, bookmarks } = bookmarkStore()
  
  // 북마크 이름 수정 관련 상태
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(bookmark?.name || '')
  const [isSavingName, setIsSavingName] = useState(false)

  // 북마크 prop이 변경되거나 store에서 업데이트된 북마크를 가져오기
  const currentBookmark = bookmark && bookmark.bookmarkId
    ? bookmarks.find((b) => b.bookmarkId === bookmark.bookmarkId) || bookmark
    : bookmark

  // 북마크가 변경될 때 editedName 업데이트
  useEffect(() => {
    if (currentBookmark?.name) {
      setEditedName(currentBookmark.name)
    }
  }, [currentBookmark?.name])

  // 표시할 데이터 결정 (currentBookmark 사용)
  const displayData = spot
    ? {
        id: spot.id,
        title: spot.title,
        address: spot.address,
        description: spot.description,
        latitude: spot.latitude,
        longitude: spot.longitude,
        bortleScale: spot.bortleScale,
        isParkingAvailable: spot.isParkingAvailable,
        isRestroomAvailable: spot.isRestroomAvailable,
        isCarAccess: spot.isCarAccess,
        type: 'SPOT' as const,
      }
    : currentBookmark
    ? {
        id: currentBookmark.bookmarkId || 0,
        title: currentBookmark.name || '북마크',
        address: currentBookmark.address || '',
        description: currentBookmark.type === 'CUSTOM' ? '나만의 장소' : '',
        latitude: currentBookmark.latitude || 0,
        longitude: currentBookmark.longitude || 0,
        bortleScale: undefined,
        isParkingAvailable: undefined,
        isRestroomAvailable: undefined,
        isCarAccess: undefined,
        type: currentBookmark.type as 'SPOT' | 'CUSTOM',
      }
    : null

  if (!displayData) return null

  const isBookmarked = spot ? isSpotBookmarked(spot.id) : false
  const existingBookmark = spot ? getBookmarkBySpotId(spot.id) : null
  
  // 북마크 관련 변수도 currentBookmark 사용
  const bookmarkForDisplay = currentBookmark

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: '로그인 필요',
        description: '북마크 기능을 사용하려면 로그인이 필요합니다.',
        variant: 'destructive',
      })
      return
    }

    if (!spot) return

    if (existingBookmark && existingBookmark.bookmarkId) {
      // 북마크 삭제
      try {
        await bookmarksApi.deleteBookmark(existingBookmark.bookmarkId)
        removeBookmark(existingBookmark.bookmarkId)

        // 북마크 마커 제거는 map-selector의 useEffect가 자동으로 처리

        toast({
          title: '성공',
          description: '북마크가 삭제되었습니다.',
        })
      } catch (error) {
        console.error('북마크 삭제 오류:', error)
        toast({
          title: '오류',
          description: '북마크 삭제에 실패했습니다.',
          variant: 'destructive',
        })
      }
    } else {
      // 북마크 추가
      try {
        const response = await bookmarksApi.addBookmark({
          type: 'SPOT',
          spotId: spot.id,
          name: spot.title,
          latitude: spot.latitude,
          longitude: spot.longitude,
          address: spot.address,
        })
        addBookmark(response)
        toast({
          title: '성공',
          description: '북마크가 추가되었습니다.',
        })
      } catch (error) {
        console.error('북마크 추가 오류:', error)
        toast({
          title: '오류',
          description: '북마크 추가에 실패했습니다.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleLocationSelect = async () => {
    if (onLocationSelect && displayData.latitude && displayData.longitude) {
      let address = displayData.address
      if (!address && mapProvider) {
        address = await mapProvider.getAddressFromPosition({
          lat: displayData.latitude,
          lng: displayData.longitude,
        })
      }
      onLocationSelect(displayData.latitude, displayData.longitude, address)
      onClose()
    }
  }

  const handleEditName = () => {
    if (currentBookmark) {
      setEditedName(currentBookmark.name || '')
      setIsEditingName(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setEditedName(currentBookmark?.name || '')
  }

  const handleSaveName = async () => {
    if (!currentBookmark || !currentBookmark.bookmarkId) return
    
    const trimmedName = editedName.trim()
    if (!trimmedName) {
      toast({
        title: '오류',
        description: '북마크 이름을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (trimmedName === currentBookmark.name) {
      setIsEditingName(false)
      return
    }

    setIsSavingName(true)
    try {
      const response = await bookmarksApi.modifyBookmark(currentBookmark.bookmarkId, {
        name: trimmedName,
      })
      updateBookmark(currentBookmark.bookmarkId, response)
      setIsEditingName(false)
      toast({
        title: '성공',
        description: '북마크 이름이 수정되었습니다.',
      })
    } catch (error) {
      console.error('북마크 이름 수정 오류:', error)
      toast({
        title: '오류',
        description: '북마크 이름 수정에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingName(false)
    }
  }

  const handleDeleteBookmark = async () => {
    if (!currentBookmark || !currentBookmark.bookmarkId) return

    try {
      await bookmarksApi.deleteBookmark(currentBookmark.bookmarkId)
      removeBookmark(currentBookmark.bookmarkId)

      // 북마크 마커 제거는 map-selector의 useEffect가 자동으로 처리

      toast({
        title: '성공',
        description: '북마크가 삭제되었습니다.',
      })
      onClose()
    } catch (error) {
      console.error('북마크 삭제 오류:', error)
      toast({
        title: '오류',
        description: '북마크 삭제에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="absolute top-4 right-4 z-20 max-w-sm w-full">
      <Card
        className={cn(
          'border-border/50 bg-card/95 backdrop-blur-sm shadow-lg',
          currentBookmark && 'border-blue-500/50' // 북마크는 파란색 테두리
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {isEditingName && currentBookmark ? (
                <div className="space-y-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="북마크 이름"
                    className="text-lg font-semibold"
                    disabled={isSavingName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveName()
                      } else if (e.key === 'Escape') {
                        handleCancelEdit()
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleSaveName}
                      disabled={isSavingName || !editedName.trim()}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSavingName}
                    >
                      <XIcon className="w-4 h-4 mr-1" />
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {currentBookmark ? (
                      <Bookmark className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Star className="w-5 h-5 text-primary" />
                    )}
                    {displayData.title}
                    {currentBookmark && isAuthenticated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={handleEditName}
                        title="이름 수정"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {displayData.address}
                    {currentBookmark && currentBookmark.type === 'CUSTOM' && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        나만의 장소
                      </Badge>
                    )}
                  </CardDescription>
                </>
              )}
            </div>
            {!isEditingName && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayData.description && (
            <p className="text-sm text-muted-foreground">{displayData.description}</p>
          )}

          {/* 명소 정보 (명소인 경우에만 표시) */}
          {spot && (
            <div className="flex flex-wrap gap-2">
              {displayData.bortleScale !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Bortle {displayData.bortleScale}
                </Badge>
              )}
              {displayData.isParkingAvailable && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <ParkingCircle className="w-3 h-3" />
                  주차 가능
                </Badge>
              )}
              {displayData.isRestroomAvailable && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" />
                  화장실
                </Badge>
              )}
              {displayData.isCarAccess && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  차량 접근
                </Badge>
              )}
            </div>
          )}

          {/* 북마크 버튼 (명소인 경우에만) */}
          {spot && isAuthenticated && (
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              className="w-full"
              onClick={handleBookmarkToggle}
            >
              <Star className={cn('w-4 h-4 mr-2', isBookmarked && 'fill-current')} />
              {isBookmarked ? '북마크됨' : '북마크 추가'}
            </Button>
          )}

          {/* 북마크 삭제 버튼 (북마크인 경우) */}
          {currentBookmark && isAuthenticated && (
            <Button variant="destructive" className="w-full" onClick={handleDeleteBookmark}>
              북마크 삭제
            </Button>
          )}

          {/* 위치 설정 버튼 */}
          <Button variant="default" className="w-full" onClick={handleLocationSelect}>
            <MapPin className="w-4 h-4 mr-2" />
            이 위치로 설정
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
