import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Location, InspectionResult, InspectionRecord, PhotoRecord, RectificationItem, InspectionItemStandard } from '@/types'
import { mockInspectionRecords, mockPhotoRecords, mockRectificationItems } from '@/data/mockData'
import { inspectionItemStandards } from '@/data/inspectionItems'

interface InspectionContextType {
  currentLocation: Location
  setCurrentLocation: (location: Location) => void
  currentResults: InspectionResult[]
  updateResult: (result: InspectionResult) => void
  resetResults: () => void
  inspectionRecords: InspectionRecord[]
  addInspectionRecord: (record: InspectionRecord) => void
  photoRecords: PhotoRecord[]
  addPhotoRecord: (photo: PhotoRecord) => void
  rectificationItems: RectificationItem[]
  addRectificationItem: (item: RectificationItem) => void
  updateRectificationItem: (item: RectificationItem) => void
  itemStandards: InspectionItemStandard[]
  isQualified: (itemId: string, value: number) => boolean
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

  const [inspectionRecords, setInspectionRecords] = useState<InspectionRecord[]>(mockInspectionRecords)
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>(mockPhotoRecords)
  const [rectificationItems, setRectificationItems] = useState<RectificationItem[]>(mockRectificationItems)

  const itemStandards = inspectionItemStandards

  const isQualified = useCallback((itemId: string, value: number): boolean => {
    const standard = itemStandards.find(s => s.id === itemId)
    if (!standard) return false
    return value >= standard.minValue && value <= standard.maxValue
  }, [itemStandards])

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
  }, [])

  const addInspectionRecord = useCallback((record: InspectionRecord) => {
    setInspectionRecords(prev => [record, ...prev])
  }, [])

  const addPhotoRecord = useCallback((photo: PhotoRecord) => {
    setPhotoRecords(prev => [photo, ...prev])
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

  return (
    <InspectionContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        currentResults,
        updateResult,
        resetResults,
        inspectionRecords,
        addInspectionRecord,
        photoRecords,
        addPhotoRecord,
        rectificationItems,
        addRectificationItem,
        updateRectificationItem,
        itemStandards,
        isQualified
      }}
    >
      {children}
    </InspectionContext.Provider>
  )
}
