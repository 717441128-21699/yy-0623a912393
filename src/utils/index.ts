export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}-${random}`
}

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export const getCurrentDateTime = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const getLocationText = (location: { building: string; floor: string; area: string }): string => {
  const { building, floor, area } = location
  const buildingText = building ? `${building}楼` : ''
  const floorText = floor ? ` ${floor}` : ''
  const areaText = area ? ` ${area}区` : ''
  return `${buildingText}${floorText}${areaText}`
}

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    serious: '#F44336',
    general: '#FF9800',
    minor: '#FFC107'
  }
  return colors[severity] || '#999999'
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: '#F44336',
    processing: '#FF9800',
    reviewed: '#1E88E5',
    closed: '#4CAF50'
  }
  return colors[status] || '#999999'
}

export const calculateDeviation = (value: number, min: number, max: number): number => {
  if (value >= min && value <= max) return 0
  if (value < min) return value - min
  return value - max
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const validateValue = (
  value: number,
  min: number,
  max: number
): { valid: boolean; message: string } => {
  if (isNaN(value)) {
    return { valid: false, message: '请输入有效的数值' }
  }
  if (value < min) {
    return { valid: false, message: `数值不能小于${min}` }
  }
  if (value > max) {
    return { valid: false, message: `数值不能大于${max}` }
  }
  return { valid: true, message: '' }
}

export interface SeverityResult {
  severity: 'serious' | 'general' | 'minor'
  severityName: string
  isSuspend: boolean
  needTechReview: boolean
  deviationPercent: number
  deviationValue: number
}

export const calculateSeverity = (
  measuredValue: number,
  minValue: number,
  maxValue: number,
  unit: string
): SeverityResult => {
  let deviation = 0
  let referenceValue = 0

  if (measuredValue < minValue) {
    deviation = minValue - measuredValue
    referenceValue = minValue > 0 ? minValue : 1
  } else if (measuredValue > maxValue) {
    deviation = measuredValue - maxValue
    referenceValue = maxValue > 0 ? maxValue : 1
  }

  const deviationPercent = (deviation / referenceValue) * 100

  let severity: 'serious' | 'general' | 'minor' = 'minor'
  let severityName = '轻微'
  let isSuspend = false
  let needTechReview = false

  if (deviationPercent >= 30) {
    severity = 'serious'
    severityName = '严重'
    isSuspend = true
    needTechReview = true
  } else if (deviationPercent >= 10) {
    severity = 'general'
    severityName = '一般'
    isSuspend = false
    needTechReview = false
  } else {
    severity = 'minor'
    severityName = '轻微'
    isSuspend = false
    needTechReview = false
  }

  const criticalItems = ['free-end-height', 'jack-exposed', 'sweep-rod-height']
  const itemId = ''
  if (criticalItems.includes(itemId) && deviationPercent >= 20) {
    severity = 'serious'
    severityName = '严重'
    isSuspend = true
    needTechReview = true
  }

  return {
    severity,
    severityName,
    isSuspend,
    needTechReview,
    deviationPercent,
    deviationValue: deviation
  }
}

export const calculateSeverityByItem = (
  itemId: string,
  measuredValue: number,
  minValue: number,
  maxValue: number
): SeverityResult => {
  let deviation = 0
  let referenceValue = 0

  if (measuredValue < minValue) {
    deviation = minValue - measuredValue
    referenceValue = minValue > 0 ? minValue : 1
  } else if (measuredValue > maxValue) {
    deviation = measuredValue - maxValue
    referenceValue = maxValue > 0 ? maxValue : 1
  }

  const deviationPercent = (deviation / referenceValue) * 100

  let severity: 'serious' | 'general' | 'minor' = 'minor'
  let severityName = '轻微'
  let isSuspend = false
  let needTechReview = false

  const criticalItems = ['free-end-height', 'jack-exposed', 'pole-spacing-h', 'pole-spacing-v']
  const importantItems = ['sweep-rod-height', 'scissor-support', 'fastener-torque']

  if (criticalItems.includes(itemId)) {
    if (deviationPercent >= 20 || deviation >= 100) {
      severity = 'serious'
      severityName = '严重'
      isSuspend = true
      needTechReview = true
    } else if (deviationPercent >= 8 || deviation >= 40) {
      severity = 'general'
      severityName = '一般'
      isSuspend = false
      needTechReview = false
    } else {
      severity = 'minor'
      severityName = '轻微'
      isSuspend = false
      needTechReview = false
    }
  } else if (importantItems.includes(itemId)) {
    if (deviationPercent >= 30 || deviation >= 80) {
      severity = 'serious'
      severityName = '严重'
      isSuspend = true
      needTechReview = true
    } else if (deviationPercent >= 12 || deviation >= 30) {
      severity = 'general'
      severityName = '一般'
      isSuspend = false
      needTechReview = false
    } else {
      severity = 'minor'
      severityName = '轻微'
      isSuspend = false
      needTechReview = false
    }
  } else {
    if (deviationPercent >= 40 || deviation >= 100) {
      severity = 'serious'
      severityName = '严重'
      isSuspend = false
      needTechReview = true
    } else if (deviationPercent >= 15 || deviation >= 40) {
      severity = 'general'
      severityName = '一般'
      isSuspend = false
      needTechReview = false
    } else {
      severity = 'minor'
      severityName = '轻微'
      isSuspend = false
      needTechReview = false
    }
  }

  return {
    severity,
    severityName,
    isSuspend,
    needTechReview,
    deviationPercent,
    deviationValue: deviation
  }
}

export const getDeadline = (severity: 'serious' | 'general' | 'minor'): string => {
  const now = new Date()
  let hoursToAdd = 0

  switch (severity) {
    case 'serious':
      hoursToAdd = 4
      break
    case 'general':
      hoursToAdd = 12
      break
    case 'minor':
      hoursToAdd = 24
      break
  }

  now.setHours(now.getHours() + hoursToAdd)
  return getCurrentDateTime()
}

const STORAGE_KEY = 'formwork_inspection_data_v1'

export interface PersistedData {
  inspectionRecords: any[]
  photoRecords: any[]
  rectificationItems: any[]
  lastUpdated: string
}

export const saveToStorage = (data: Omit<PersistedData, 'lastUpdated'>): void => {
  try {
    const fullData: PersistedData = {
      ...data,
      lastUpdated: getCurrentDateTime()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData))
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

export const loadFromStorage = (): PersistedData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as PersistedData
    return data
  } catch (e) {
    console.error('读取数据失败:', e)
    return null
  }
}

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('清除数据失败:', e)
  }
}
