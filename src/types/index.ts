export interface Location {
  building: string
  floor: string
  area: string
}

export interface InspectionItemStandard {
  id: string
  name: string
  unit: string
  qualifiedRange: string
  minValue: number
  maxValue: number
  description: string
  diagramUrl: string
  keyPoints: string[]
}

export interface InspectionResult {
  itemId: string
  itemName: string
  measuredValue: number
  unit: string
  isQualified: boolean
  remark: string
}

export interface PhotoRecord {
  id: string
  inspectionId: string
  url: string
  thumbnail: string
  category: 'node' | 'fastener' | 'pad' | 'jack' | 'other'
  categoryName: string
  marks: PhotoMark[]
  description: string
  createTime: string
  location: Location
}

export interface PhotoMark {
  id: string
  x: number
  y: number
  text: string
}

export interface RectificationItem {
  id: string
  inspectionId: string
  itemName: string
  description: string
  severity: 'serious' | 'general' | 'minor'
  severityName: string
  location: Location
  photos: string[]
  isSuspend: boolean
  needTechReview: boolean
  status: 'pending' | 'processing' | 'reviewed' | 'closed'
  statusName: string
  createTime: string
  deadline: string
  handler: string
  reviewRecords: ReviewRecord[]
}

export interface ReviewRecord {
  id: string
  time: string
  operator: string
  result: 'pass' | 'fail'
  remark: string
  photos: string[]
}

export interface InspectionRecord {
  id: string
  location: Location
  inspector: string
  inspectTime: string
  results: InspectionResult[]
  photos: PhotoRecord[]
  rectifications: string[]
  overallStatus: 'passed' | 'failed' | 'pending'
  overallStatusName: string
  remark: string
}

export type SeverityLevel = 'serious' | 'general' | 'minor'

export interface BuildingOption {
  value: string
  label: string
}

export interface FloorOption {
  value: string
  label: string
}

export interface AreaOption {
  value: string
  label: string
}
