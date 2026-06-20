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
