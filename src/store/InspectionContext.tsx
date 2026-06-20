import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Location, InspectionResult, InspectionRecord, PhotoRecord, RectificationItem, InspectionItemStandard } from '@/types'
import { mockInspectionRecords, mockPhotoRecords, mockRectificationItems } from '@/data/mockData'
import { inspectionItemStandards } from '@/data/inspectionItems'
import {
  generateId,
  getCurrentDateTime,
  calculateSeverityByItem,
  getDeadline,
  saveToStorage,
  loadFromStorage,
  SeverityResult
} from '@/utils'

interface RectificationGenerateResult {
  items: RectificationItem[]
  severityInfo: Record<string, SeverityResult>
}

interface InspectionContextType {
  currentLocation: Location
  setCurrentLocation: (location: Location) => void
  currentResults: InspectionResult[]
  updateResult: (result: InspectionResult) => void
  resetResults: () => void
  currentInspectionPhotoIds: string[]
  addPhotoToCurrentInspection: (photoId: string) => void
  inspectionRecords: InspectionRecord[]
  addInspectionRecord: (record: InspectionRecord) => RectificationGenerateResult | null
  photoRecords: PhotoRecord[]
  addPhotoRecord: (photo: PhotoRecord) => void
  updatePhotoRecord: (photo: PhotoRecord) => void
  rectificationItems: RectificationItem[]
  addRectificationItem: (item: RectificationItem) => void
  updateRectificationItem: (item: RectificationItem) => void
  itemStandards: InspectionItemStandard[]
  isQualified: (itemId: string, value: number) => boolean
  generateRectifications: (
    inspectionId: string,
    results: InspectionResult[],
    location: Location,
    photoIds: string[]
  ) => RectificationGenerateResult
  getRectificationsByInspection: (inspectionId: string) => RectificationItem[]
  getPhotosByInspection: (inspectionId: string) => PhotoRecord[]
  getPhotosByIds: (photoIds: string[]) => PhotoRecord[]
  getCurrentInspectionId: () => string | null
  setCurrentInspectionId: (id: string | null) => void
  clearAllData: () => void
  getItemSeverity: (itemId: string, value: number, min: number, max: number) => SeverityResult
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined)

export const useInspection = () => {
  const context = useContext(InspectionContext)
  if (!context) {
    throw new Error('useInspection must be used within InspectionProvider')
  }
  return context
}

interface InspectionProviderProps {
  children: ReactNode
}

export const InspectionProvider: React.FC<InspectionProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location>({
    building: '',
    floor: '',
    area: ''
  })

  const [currentResults, setCurrentResults] = useState<InspectionResult[]>([])
  const [currentInspectionId, setCurrentInspectionIdState] = useState<string | null>(null)
  const [currentInspectionPhotoIds, setCurrentInspectionPhotoIds] = useState<string[]>([])

  const [inspectionRecords, setInspectionRecords] = useState<InspectionRecord[]>([])
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>([])
  const [rectificationItems, setRectificationItems] = useState<RectificationItem[]>([])

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = loadFromStorage()
    if (saved && saved.inspectionRecords && saved.inspectionRecords.length > 0) {
      setInspectionRecords(saved.inspectionRecords)
      setPhotoRecords(saved.photoRecords || [])
      setRectificationItems(saved.rectificationItems || [])
    } else {
      setInspectionRecords(mockInspectionRecords)
      setPhotoRecords(mockPhotoRecords)
      setRectificationItems(mockRectificationItems)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    saveToStorage({
      inspectionRecords,
      photoRecords,
      rectificationItems
    })
  }, [inspectionRecords, photoRecords, rectificationItems, isLoaded])

  const itemStandards = inspectionItemStandards

  const isQualified = useCallback((itemId: string, value: number): boolean => {
    const standard = itemStandards.find(s => s.id === itemId)
    if (!standard) return false
    return value >= standard.minValue && value <= standard.maxValue
  }, [itemStandards])

  const getItemSeverity = useCallback((itemId: string, value: number, min: number, max: number): SeverityResult => {
    return calculateSeverityByItem(itemId, value, min, max)
  }, [])

  const updateResult = useCallback((result: InspectionResult) => {
    setCurrentResults(prev => {
      const index = prev.findIndex(r => r.itemId === result.itemId)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = result
        return updated
      }
      return [...prev, result]
    })
  }, [])

  const resetResults = useCallback(() => {
    setCurrentResults([])
    setCurrentLocation({ building: '', floor: '', area: '' })
    setCurrentInspectionIdState(null)
    setCurrentInspectionPhotoIds([])
  }, [])

  const addPhotoToCurrentInspection = useCallback((photoId: string) => {
    setCurrentInspectionPhotoIds(prev => {
      if (prev.includes(photoId)) return prev
      return [...prev, photoId]
    })
  }, [])

  const generateRectifications = useCallback((
    inspectionId: string,
    results: InspectionResult[],
    location: Location,
    photoIds: string[]
  ): RectificationGenerateResult => {
    const failedItems = results.filter(r => !r.isQualified)
    const severityInfo: Record<string, SeverityResult> = {}
    const items: RectificationItem[] = []

    const itemPhotosMap = new Map<string, string[]>()
    const currentInspectionPhotos = photoRecords.filter(p => photoIds.includes(p.id))
    currentInspectionPhotos.forEach(p => {
      if (p.itemId) {
        const existing = itemPhotosMap.get(p.itemId) || []
        existing.push(p.id)
        itemPhotosMap.set(p.itemId, existing)
      }
    })

    failedItems.forEach((result) => {
      const standard = itemStandards.find(s => s.id === result.itemId)
      if (!standard) return

      const severity = calculateSeverityByItem(
        result.itemId,
        result.measuredValue,
        standard.minValue,
        standard.maxValue
      )

      severityInfo[result.itemId] = severity

      const direction = result.measuredValue > standard.maxValue ? '超出' : '不足'
      const deviationText = severity.deviationValue > 0
        ? `偏差${severity.deviationValue}${standard.unit}（${severity.deviationPercent.toFixed(1)}%）`
        : ''

      const description = `${getLocationText(location)} ${result.itemName}实测${result.measuredValue}${standard.unit}，` +
        `合格范围${standard.qualifiedRange}${standard.unit}，${direction}规范要求。${deviationText}` +
        `${result.remark ? ' 备注：' + result.remark : ''}`

      const matchedPhotos = itemPhotosMap.get(result.itemId) || []

      const item: RectificationItem = {
        id: generateId('rect-'),
        inspectionId,
        itemName: result.itemName,
        description,
        severity: severity.severity,
        severityName: severity.severityName,
        location: { ...location },
        photos: matchedPhotos,
        isSuspend: severity.isSuspend,
        needTechReview: severity.needTechReview,
        status: 'pending',
        statusName: '待整改',
        createTime: getCurrentDateTime(),
        deadline: getDeadline(severity.severity),
        handler: '待分配',
        reviewRecords: []
      }

      items.push(item)
    })

    return { items, severityInfo }
  }, [itemStandards, photoRecords])

  const getLocationText = (location: { building: string; floor: string; area: string }): string => {
    const { building, floor, area } = location
    const buildingText = building ? `${building}楼` : ''
    const floorText = floor ? ` ${floor}` : ''
    const areaText = area ? ` ${area}区` : ''
    return `${buildingText}${floorText}${areaText}`
  }

  const addInspectionRecord = useCallback((record: InspectionRecord): RectificationGenerateResult | null => {
    const failedItems = record.results.filter(r => !r.isQualified)

    const finalPhotoIds = [...currentInspectionPhotoIds]

    let rectResult: RectificationGenerateResult | null = null

    if (failedItems.length > 0) {
      rectResult = generateRectifications(
        record.id,
        record.results,
        record.location,
        finalPhotoIds
      )

      const newRectItems = rectResult.items
      const rectIds = newRectItems.map(r => r.id)

      const updatedRecord: InspectionRecord = {
        ...record,
        photos: finalPhotoIds,
        rectifications: rectIds
      }

      setInspectionRecords(prev => [updatedRecord, ...prev])
      setRectificationItems(prev => [...newRectItems, ...prev])
    } else {
      const finalRecord: InspectionRecord = {
        ...record,
        photos: finalPhotoIds
      }
      setInspectionRecords(prev => [finalRecord, ...prev])
    }

    setCurrentInspectionIdState(record.id)

    return rectResult
  }, [generateRectifications, currentInspectionPhotoIds])

  const addPhotoRecord = useCallback((photo: PhotoRecord) => {
    setPhotoRecords(prev => [photo, ...prev])
    const inInspectionProcess = currentResults.length > 0 || currentInspectionId || photo.inspectionId
    if (inInspectionProcess) {
      addPhotoToCurrentInspection(photo.id)
    }
  }, [currentResults.length, currentInspectionId, addPhotoToCurrentInspection])

  const updatePhotoRecord = useCallback((photo: PhotoRecord) => {
    setPhotoRecords(prev => {
      const index = prev.findIndex(p => p.id === photo.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = photo
        return updated
      }
      return [photo, ...prev]
    })
  }, [])

  const addRectificationItem = useCallback((item: RectificationItem) => {
    setRectificationItems(prev => [item, ...prev])
  }, [])

  const updateRectificationItem = useCallback((item: RectificationItem) => {
    setRectificationItems(prev => {
      const index = prev.findIndex(i => i.id === item.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = item
        return updated
      }
      return prev
    })
  }, [])

  const getRectificationsByInspection = useCallback((inspectionId: string): RectificationItem[] => {
    return rectificationItems.filter(r => r.inspectionId === inspectionId)
  }, [rectificationItems])

  const getPhotosByInspection = useCallback((inspectionId: string): PhotoRecord[] => {
    return photoRecords.filter(p => p.inspectionId === inspectionId)
  }, [photoRecords])

  const getPhotosByIds = useCallback((photoIds: string[]): PhotoRecord[] => {
    return photoIds.map(id => photoRecords.find(p => p.id === id)).filter(Boolean) as PhotoRecord[]
  }, [photoRecords])

  const getCurrentInspectionId = useCallback((): string | null => {
    return currentInspectionId
  }, [currentInspectionId])

  const setCurrentInspectionId = useCallback((id: string | null) => {
    setCurrentInspectionIdState(id)
  }, [])

  const clearAllData = useCallback(() => {
    setInspectionRecords(mockInspectionRecords)
    setPhotoRecords(mockPhotoRecords)
    setRectificationItems(mockRectificationItems)
    resetResults()
  }, [resetResults])

  return (
    <InspectionContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        currentResults,
        updateResult,
        resetResults,
        currentInspectionPhotoIds,
        addPhotoToCurrentInspection,
        inspectionRecords,
        addInspectionRecord,
        photoRecords,
        addPhotoRecord,
        updatePhotoRecord,
        rectificationItems,
        addRectificationItem,
        updateRectificationItem,
        itemStandards,
        isQualified,
        generateRectifications,
        getRectificationsByInspection,
        getPhotosByInspection,
        getPhotosByIds,
        getCurrentInspectionId,
        setCurrentInspectionId,
        clearAllData,
        getItemSeverity
      }}
    >
      {children}
    </InspectionContext.Provider>
  )
}
