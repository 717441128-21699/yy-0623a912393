import { InspectionItemStandard } from '@/types'

export const inspectionItemStandards: InspectionItemStandard[] = [
  {
    id: 'pole-spacing-h',
    name: '立杆纵距',
    unit: 'mm',
    qualifiedRange: '≤1500',
    minValue: 0,
    maxValue: 1500,
    description: '立杆纵向间距，指沿脚手架长度方向相邻立杆之间的距离',
    diagramUrl: 'https://picsum.photos/id/119/600/400',
    keyPoints: [
      '纵距应符合专项施工方案要求',
      '最大间距不应超过1500mm',
      '同一跨内纵距偏差不超过50mm'
    ]
  },
  {
    id: 'pole-spacing-v',
    name: '立杆横距',
    unit: 'mm',
    qualifiedRange: '≤800',
    minValue: 0,
    maxValue: 800,
    description: '立杆横向间距，指沿脚手架宽度方向相邻立杆之间的距离',
    diagramUrl: 'https://picsum.photos/id/160/600/400',
    keyPoints: [
      '横距应符合专项施工方案要求',
      '最大间距不应超过800mm',
      '靠近结构一侧立杆距墙面不应大于300mm'
    ]
  },
  {
    id: 'sweep-rod-height',
    name: '扫地杆高度',
    unit: 'mm',
    qualifiedRange: '≤200',
    minValue: 0,
    maxValue: 200,
    description: '扫地杆距地面的高度，纵向扫地杆应在横向扫地杆下方',
    diagramUrl: 'https://picsum.photos/id/201/600/400',
    keyPoints: [
      '纵向扫地杆距底座上皮不应大于200mm',
      '横向扫地杆应设在纵向扫地杆下方',
      '扫地杆必须连续设置，不得断开'
    ]
  },
  {
    id: 'scissor-support',
    name: '剪刀撑设置',
    unit: '°',
    qualifiedRange: '45~60',
    minValue: 45,
    maxValue: 60,
    description: '剪刀撑与地面的夹角，以及剪刀撑的设置范围',
    diagramUrl: 'https://picsum.photos/id/3/600/400',
    keyPoints: [
      '剪刀撑与地面夹角宜在45°~60°之间',
      '每道剪刀撑宽度不应小于4跨',
      '高度超过24m的脚手架应在外侧全立面连续设置剪刀撑'
    ]
  },
  {
    id: 'jack-exposed',
    name: '顶托外露长度',
    unit: 'mm',
    qualifiedRange: '≤300',
    minValue: 0,
    maxValue: 300,
    description: '可调托撑螺杆伸出钢管顶部的长度',
    diagramUrl: 'https://picsum.photos/id/119/600/400',
    keyPoints: [
      '螺杆伸出钢管顶部不应大于300mm',
      '螺杆插入钢管内的长度不应小于150mm',
      'U型托撑与主梁之间应楔紧，不得有空隙'
    ]
  },
  {
    id: 'free-end-height',
    name: '自由端高度',
    unit: 'mm',
    qualifiedRange: '≤500',
    minValue: 0,
    maxValue: 500,
    description: '立杆顶端可调托撑伸出顶层水平杆中心线至支撑点的长度',
    diagramUrl: 'https://picsum.photos/id/160/600/400',
    keyPoints: [
      '自由端高度不应大于500mm',
      '顶层水平杆应连续设置',
      '顶托螺杆轴心应与立杆轴心重合'
    ]
  },
  {
    id: 'base-plate',
    name: '垫板设置',
    unit: 'mm',
    qualifiedRange: '≥100',
    minValue: 100,
    maxValue: 9999,
    description: '立杆底部垫板的宽度，垫板应有足够的强度和支承面积',
    diagramUrl: 'https://picsum.photos/id/201/600/400',
    keyPoints: [
      '每根立杆底部应设置底座或垫板',
      '垫板宽度不应小于100mm，厚度不应小于50mm',
      '垫板应平整，不得有翘曲或损坏'
    ]
  },
  {
    id: 'fastener-torque',
    name: '扣件扭矩',
    unit: 'N·m',
    qualifiedRange: '40~65',
    minValue: 40,
    maxValue: 65,
    description: '扣件螺栓的拧紧扭矩值',
    diagramUrl: 'https://picsum.photos/id/3/600/400',
    keyPoints: [
      '扣件螺栓拧紧扭矩不应小于40N·m',
      '拧紧扭矩不应大于65N·m',
      '主节点处必须设置一根横向水平杆，用直角扣件扣接且严禁拆除'
    ]
  }
]

export const buildingOptions = [
  { value: '1#', label: '1号楼' },
  { value: '2#', label: '2号楼' },
  { value: '3#', label: '3号楼' },
  { value: '4#', label: '4号楼' },
  { value: '5#', label: '5号楼' },
  { value: '6#', label: '6号楼' }
]

export const floorOptions = [
  { value: '-2F', label: '地下2层' },
  { value: '-1F', label: '地下1层' },
  { value: '1F', label: '1层' },
  { value: '2F', label: '2层' },
  { value: '3F', label: '3层' },
  { value: '4F', label: '4层' },
  { value: '5F', label: '5层' },
  { value: '6F', label: '6层' },
  { value: '7F', label: '7层' },
  { value: '8F', label: '8层' },
  { value: '9F', label: '9层' },
  { value: '10F', label: '10层' }
]

export const areaOptions = [
  { value: 'A', label: 'A区（东段）' },
  { value: 'B', label: 'B区（中段）' },
  { value: 'C', label: 'C区（西段）' },
  { value: 'D', label: 'D区（北段）' },
  { value: 'core', label: '核心筒' },
  { value: 'stair', label: '楼梯间' }
]

export const photoCategories = [
  { value: 'node', label: '支架节点' },
  { value: 'fastener', label: '扣件' },
  { value: 'pad', label: '垫板' },
  { value: 'jack', label: '顶托' },
  { value: 'other', label: '其他' }
]

export const severityOptions = [
  { value: 'serious', label: '严重', color: '#F44336' },
  { value: 'general', label: '一般', color: '#FF9800' },
  { value: 'minor', label: '轻微', color: '#FFC107' }
]

export const statusOptions = [
  { value: 'pending', label: '待整改', color: '#F44336' },
  { value: 'processing', label: '整改中', color: '#FF9800' },
  { value: 'reviewed', label: '待复查', color: '#1E88E5' },
  { value: 'closed', label: '已闭合', color: '#4CAF50' }
]
