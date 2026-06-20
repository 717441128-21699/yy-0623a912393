import { InspectionRecord, PhotoRecord, RectificationItem, Location } from '@/types'

const mockLocation1: Location = { building: '1#', floor: '3F', area: 'A' }
const mockLocation2: Location = { building: '2#', floor: '5F', area: 'B' }
const mockLocation3: Location = { building: '1#', floor: '2F', area: 'core' }

export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'insp-001',
    location: mockLocation1,
    inspector: '张工（安全员）',
    inspectTime: '2026-06-21 08:30:00',
    results: [
      { itemId: 'pole-spacing-h', itemName: '立杆纵距', measuredValue: 1200, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'pole-spacing-v', itemName: '立杆横距', measuredValue: 750, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'sweep-rod-height', itemName: '扫地杆高度', measuredValue: 180, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'scissor-support', itemName: '剪刀撑设置', measuredValue: 55, unit: '°', isQualified: true, remark: '' },
      { itemId: 'jack-exposed', itemName: '顶托外露长度', measuredValue: 280, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'free-end-height', itemName: '自由端高度', measuredValue: 450, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'base-plate', itemName: '垫板设置', measuredValue: 150, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'fastener-torque', itemName: '扣件扭矩', measuredValue: 50, unit: 'N·m', isQualified: true, remark: '' }
    ],
    photos: [],
    rectifications: [],
    overallStatus: 'passed',
    overallStatusName: '检查通过',
    remark: '全部合格，同意浇筑'
  },
  {
    id: 'insp-002',
    location: mockLocation2,
    inspector: '李工（施工员）',
    inspectTime: '2026-06-21 09:15:00',
    results: [
      { itemId: 'pole-spacing-h', itemName: '立杆纵距', measuredValue: 1600, unit: 'mm', isQualified: false, remark: '超出规范要求100mm' },
      { itemId: 'pole-spacing-v', itemName: '立杆横距', measuredValue: 850, unit: 'mm', isQualified: false, remark: '超出规范要求50mm' },
      { itemId: 'sweep-rod-height', itemName: '扫地杆高度', measuredValue: 250, unit: 'mm', isQualified: false, remark: '高于规范要求50mm' },
      { itemId: 'scissor-support', itemName: '剪刀撑设置', measuredValue: 40, unit: '°', isQualified: false, remark: '夹角过小' },
      { itemId: 'jack-exposed', itemName: '顶托外露长度', measuredValue: 350, unit: 'mm', isQualified: false, remark: '外露过长' },
      { itemId: 'free-end-height', itemName: '自由端高度', measuredValue: 600, unit: 'mm', isQualified: false, remark: '超出规范要求' },
      { itemId: 'base-plate', itemName: '垫板设置', measuredValue: 80, unit: 'mm', isQualified: false, remark: '垫板宽度不足' },
      { itemId: 'fastener-torque', itemName: '扣件扭矩', measuredValue: 35, unit: 'N·m', isQualified: false, remark: '扭矩不足' }
    ],
    photos: ['photo-001', 'photo-002', 'photo-003'],
    rectifications: ['rect-001', 'rect-002', 'rect-003'],
    overallStatus: 'failed',
    overallStatusName: '需整改',
    remark: '多项指标不合格，需整改后复查'
  },
  {
    id: 'insp-003',
    location: mockLocation3,
    inspector: '张工（安全员）',
    inspectTime: '2026-06-20 14:20:00',
    results: [
      { itemId: 'pole-spacing-h', itemName: '立杆纵距', measuredValue: 1200, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'pole-spacing-v', itemName: '立杆横距', measuredValue: 750, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'sweep-rod-height', itemName: '扫地杆高度', measuredValue: 180, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'scissor-support', itemName: '剪刀撑设置', measuredValue: 50, unit: '°', isQualified: true, remark: '' },
      { itemId: 'jack-exposed', itemName: '顶托外露长度', measuredValue: 320, unit: 'mm', isQualified: false, remark: '略超规范' },
      { itemId: 'free-end-height', itemName: '自由端高度', measuredValue: 480, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'base-plate', itemName: '垫板设置', measuredValue: 120, unit: 'mm', isQualified: true, remark: '' },
      { itemId: 'fastener-torque', itemName: '扣件扭矩', measuredValue: 55, unit: 'N·m', isQualified: true, remark: '' }
    ],
    photos: ['photo-004'],
    rectifications: ['rect-004'],
    overallStatus: 'failed',
    overallStatusName: '需整改',
    remark: '顶托外露略超，整改后可浇筑'
  }
]

export const mockPhotoRecords: PhotoRecord[] = [
  {
    id: 'photo-001',
    inspectionId: 'insp-002',
    url: 'https://picsum.photos/id/119/800/600',
    thumbnail: 'https://picsum.photos/id/119/200/150',
    category: 'node',
    categoryName: '支架节点',
    marks: [
      { id: 'mark-001', x: 35, y: 45, text: '立杆间距过大' },
      { id: 'mark-002', x: 60, y: 30, text: '缺少横向水平杆' }
    ],
    description: '支架节点处立杆纵距约1600mm，超出规范要求',
    createTime: '2026-06-21 09:20:00',
    location: mockLocation2
  },
  {
    id: 'photo-002',
    inspectionId: 'insp-002',
    url: 'https://picsum.photos/id/160/800/600',
    thumbnail: 'https://picsum.photos/id/160/200/150',
    category: 'fastener',
    categoryName: '扣件',
    marks: [
      { id: 'mark-003', x: 50, y: 50, text: '扣件松动，扭矩不足' }
    ],
    description: '部分扣件未拧紧，实测扭矩约35N·m',
    createTime: '2026-06-21 09:25:00',
    location: mockLocation2
  },
  {
    id: 'photo-003',
    inspectionId: 'insp-002',
    url: 'https://picsum.photos/id/201/800/600',
    thumbnail: 'https://picsum.photos/id/201/200/150',
    category: 'jack',
    categoryName: '顶托',
    marks: [
      { id: 'mark-004', x: 45, y: 35, text: '顶托外露过长' },
      { id: 'mark-005', x: 55, y: 60, text: '自由端高度超标' }
    ],
    description: '顶托外露约350mm，自由端约600mm，均超出规范',
    createTime: '2026-06-21 09:30:00',
    location: mockLocation2
  },
  {
    id: 'photo-004',
    inspectionId: 'insp-003',
    url: 'https://picsum.photos/id/3/800/600',
    thumbnail: 'https://picsum.photos/id/3/200/150',
    category: 'jack',
    categoryName: '顶托',
    marks: [
      { id: 'mark-006', x: 50, y: 40, text: '顶托外露略超300mm' }
    ],
    description: '顶托外露约320mm，略超规范要求',
    createTime: '2026-06-20 14:30:00',
    location: mockLocation3
  },
  {
    id: 'photo-005',
    inspectionId: 'insp-004',
    url: 'https://picsum.photos/id/119/800/600',
    thumbnail: 'https://picsum.photos/id/119/200/150',
    category: 'pad',
    categoryName: '垫板',
    marks: [
      { id: 'mark-007', x: 40, y: 65, text: '垫板宽度不足，仅80mm' }
    ],
    description: '立杆底部垫板宽度不足，仅约80mm',
    createTime: '2026-06-20 10:15:00',
    location: mockLocation1
  },
  {
    id: 'photo-006',
    inspectionId: 'insp-004',
    url: 'https://picsum.photos/id/160/800/600',
    thumbnail: 'https://picsum.photos/id/160/200/150',
    category: 'other',
    categoryName: '其他',
    marks: [
      { id: 'mark-008', x: 55, y: 45, text: '扫地杆高度超标' }
    ],
    description: '扫地杆距地面约250mm，高于规范要求',
    createTime: '2026-06-20 10:20:00',
    location: mockLocation1
  }
]

export const mockRectificationItems: RectificationItem[] = [
  {
    id: 'rect-001',
    inspectionId: 'insp-002',
    itemName: '立杆纵距超标',
    description: '2号楼5层B区立杆纵距实测1600mm，规范要求≤1500mm，需调整立杆间距',
    severity: 'serious',
    severityName: '严重',
    location: mockLocation2,
    photos: ['photo-001'],
    isSuspend: true,
    needTechReview: true,
    status: 'pending',
    statusName: '待整改',
    createTime: '2026-06-21 09:35:00',
    deadline: '2026-06-21 18:00:00',
    handler: '王班长',
    reviewRecords: []
  },
  {
    id: 'rect-002',
    inspectionId: 'insp-002',
    itemName: '顶托外露及自由端超标',
    description: '2号楼5层B区顶托外露350mm、自由端600mm，均超出规范要求',
    severity: 'serious',
    severityName: '严重',
    location: mockLocation2,
    photos: ['photo-003'],
    isSuspend: true,
    needTechReview: true,
    status: 'processing',
    statusName: '整改中',
    createTime: '2026-06-21 09:40:00',
    deadline: '2026-06-21 18:00:00',
    handler: '王班长',
    reviewRecords: []
  },
  {
    id: 'rect-003',
    inspectionId: 'insp-002',
    itemName: '扣件扭矩不足',
    description: '2号楼5层B区部分扣件扭矩实测35N·m，规范要求40~65N·m',
    severity: 'general',
    severityName: '一般',
    location: mockLocation2,
    photos: ['photo-002'],
    isSuspend: false,
    needTechReview: false,
    status: 'pending',
    statusName: '待整改',
    createTime: '2026-06-21 09:45:00',
    deadline: '2026-06-21 18:00:00',
    handler: '王班长',
    reviewRecords: []
  },
  {
    id: 'rect-004',
    inspectionId: 'insp-003',
    itemName: '顶托外露略超',
    description: '1号楼2层核心筒顶托外露320mm，略超规范300mm要求',
    severity: 'minor',
    severityName: '轻微',
    location: mockLocation3,
    photos: ['photo-004'],
    isSuspend: false,
    needTechReview: false,
    status: 'reviewed',
    statusName: '待复查',
    createTime: '2026-06-20 14:40:00',
    deadline: '2026-06-20 18:00:00',
    handler: '李班长',
    reviewRecords: [
      {
        id: 'review-001',
        time: '2026-06-20 17:30:00',
        operator: '张工',
        result: 'fail',
        remark: '整改后仍有310mm，需继续调整',
        photos: ['https://picsum.photos/id/119/400/300']
      }
    ]
  },
  {
    id: 'rect-005',
    inspectionId: 'insp-004',
    itemName: '垫板宽度不足',
    description: '1号楼3层A区垫板宽度仅80mm，规范要求≥100mm',
    severity: 'general',
    severityName: '一般',
    location: mockLocation1,
    photos: ['photo-005'],
    isSuspend: false,
    needTechReview: false,
    status: 'closed',
    statusName: '已闭合',
    createTime: '2026-06-20 10:30:00',
    deadline: '2026-06-20 18:00:00',
    handler: '赵班长',
    reviewRecords: [
      {
        id: 'review-002',
        time: '2026-06-20 16:00:00',
        operator: '张工',
        result: 'pass',
        remark: '已更换为150mm宽垫板，符合要求',
        photos: ['https://picsum.photos/id/160/400/300']
      }
    ]
  },
  {
    id: 'rect-006',
    inspectionId: 'insp-004',
    itemName: '扫地杆高度超标',
    description: '1号楼3层A区扫地杆高度250mm，规范要求≤200mm',
    severity: 'minor',
    severityName: '轻微',
    location: mockLocation1,
    photos: ['photo-006'],
    isSuspend: false,
    needTechReview: false,
    status: 'closed',
    statusName: '已闭合',
    createTime: '2026-06-20 10:35:00',
    deadline: '2026-06-20 18:00:00',
    handler: '赵班长',
    reviewRecords: [
      {
        id: 'review-003',
        time: '2026-06-20 16:30:00',
        operator: '张工',
        result: 'pass',
        remark: '已调整至180mm，符合要求',
        photos: ['https://picsum.photos/id/201/400/300']
      }
    ]
  }
]
