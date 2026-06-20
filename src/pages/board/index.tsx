import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { RectificationItem, InspectionRecord, PhotoRecord } from '@/types'
import StatusTag from '@/components/StatusTag'
import AnnotatedPhoto from '@/components/AnnotatedPhoto'
import { getLocationText, formatDateTime } from '@/utils'
import { buildingOptions, floorOptions } from '@/data/inspectionItems'
import styles from './index.module.scss'

interface TimelineEvent {
  id: string
  type: 'inspection' | 'photo' | 'rectification' | 'review'
  time: string
  title: string
  detail: string
  statusText?: string
  statusType?: string
  relatedId?: string
  rectItemId?: string
  photoId?: string
}

const BoardPage: React.FC = () => {
  const {
    inspectionRecords,
    rectificationItems,
    photoRecords,
    getPhotosByIds
  } = useInspection()

  const [buildingFilter, setBuildingFilter] = useState<string>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [suspendFilter, setSuspendFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [viewingPhoto, setViewingPhoto] = useState<PhotoRecord | null>(null)

  const buildingFilterOptions = ['全部楼栋', ...buildingOptions.map(b => b.label)]
  const floorFilterOptions = ['全部楼层', ...floorOptions.map(f => f.label)]

  const filteredRectItems = useMemo(() => {
    return rectificationItems.filter(item => {
      if (buildingFilter !== 'all' && item.location.building !== buildingFilter) return false
      if (floorFilter !== 'all' && item.location.floor !== floorFilter) return false
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false
      if (suspendFilter === 'suspend' && !item.isSuspend) return false
      if (suspendFilter === 'normal' && item.isSuspend) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      return true
    })
  }, [rectificationItems, buildingFilter, floorFilter, severityFilter, suspendFilter, statusFilter])

  const stats = useMemo(() => {
    const items = filteredRectItems
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      closed: items.filter(i => i.status === 'closed').length,
      serious: items.filter(i => i.severity === 'serious').length,
      suspend: items.filter(i => i.isSuspend).length
    }
  }, [filteredRectItems])

  const buildTimeline = (item: RectificationItem): TimelineEvent[] => {
    const events: TimelineEvent[] = []

    const inspection = inspectionRecords.find(r => r.id === item.inspectionId)
    if (inspection) {
      const failedCount = inspection.results.filter(r => !r.isQualified).length
      events.push({
        id: `insp-${inspection.id}`,
        type: 'inspection',
        time: inspection.inspectTime,
        title: '现场检查',
        detail: `${getLocationText(inspection.location)}，发现${failedCount}项不合格`,
        statusText: '检查完成',
        statusType: 'failed',
        relatedId: inspection.id
      })
    }

    const itemPhotos = getPhotosByIds(item.photos || [])
    itemPhotos.forEach(photo => {
      events.push({
        id: `photo-${photo.id}`,
        type: 'photo',
        time: photo.createTime,
        title: `问题拍照 - ${photo.categoryName}`,
        detail: photo.marks.length > 0
          ? `${photo.marks.length}处标注：${photo.marks.map(m => m.text).join('、')}`
          : (photo.description || '现场取证照片'),
        relatedId: item.id,
        rectItemId: item.id,
        photoId: photo.id
      })
    })

    events.push({
      id: `rect-${item.id}`,
      type: 'rectification',
      time: item.createTime,
      title: '生成整改项',
      detail: `${item.itemName} - ${item.severityName}${item.isSuspend ? '（暂停浇筑）' : ''}${item.needTechReview ? '（需技术复核）' : ''}`,
      statusText: item.statusName,
      statusType: item.status,
      rectItemId: item.id
    })

    if (item.status !== 'pending') {
      events.push({
        id: `start-${item.id}`,
        type: 'rectification',
        time: item.createTime,
        title: '开始整改',
        detail: '责任人已确认开始整改',
        statusText: '整改中',
        statusType: 'processing',
        rectItemId: item.id
      })
    }

    item.reviewRecords.forEach(review => {
      events.push({
        id: review.id,
        type: 'review',
        time: review.time,
        title: `第${item.reviewRecords.indexOf(review) + 1}次复查`,
        detail: review.remark || (review.result === 'pass' ? '复查通过' : '整改未通过'),
        statusText: review.result === 'pass' ? '通过' : '未通过',
        statusType: review.result === 'pass' ? 'passed' : 'failed',
        rectItemId: item.id
      })
    })

    events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

    return events
  }

  const handleViewInspection = (id: string) => {
    Taro.navigateTo({ url: `/pages/inspection-detail/index?id=${id}` })
  }

  const handleViewRectification = (id: string) => {
    Taro.navigateTo({ url: `/pages/rectification-detail/index?id=${id}` })
  }

  const handleViewPhoto = (photoId: string) => {
    const photo = photoRecords.find(p => p.id === photoId)
    if (photo) {
      setViewingPhoto(viewingPhoto?.id === photoId ? null : photo)
    }
  }

  const handleEventClick = (event: TimelineEvent) => {
    if (event.type === 'photo' && event.photoId) {
      handleViewPhoto(event.photoId)
    } else if (event.type === 'inspection' && event.relatedId) {
      handleViewInspection(event.relatedId)
    } else if ((event.type === 'rectification' || event.type === 'review') && event.rectItemId) {
      handleViewRectification(event.rectItemId)
    }
  }

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'inspection': return '📋'
      case 'photo': return '📷'
      case 'rectification': return '🔧'
      case 'review': return '🔍'
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'inspection': return styles.colorInspection
      case 'photo': return styles.colorPhoto
      case 'rectification': return styles.colorRectification
      case 'review': return styles.colorReview
    }
  }

  return (
    <ScrollView className={styles.page} scrollY refresherEnabled refresherTriggered={false}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>整改闭环看板</Text>
        <Text className={styles.headerSubtitle}>全流程追溯与闭环管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>整改项</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.pending + stats.processing}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.closed}</Text>
            <Text className={styles.statLabel}>已闭合</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.danger}`}>{stats.suspend}</Text>
            <Text className={styles.statLabel}>暂停浇筑</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.filterCard}>
          <Text className={styles.filterTitle}>筛选条件</Text>
          <View className={styles.filterRow}>
            <Picker
              mode='selector'
              range={buildingFilterOptions}
              value={buildingFilter === 'all' ? 0 : buildingOptions.findIndex(b => b.value === buildingFilter) + 1}
              onChange={(e) => {
                const idx = parseInt(e.detail.value)
                setBuildingFilter(idx === 0 ? 'all' : buildingOptions[idx - 1].value)
              }}
            >
              <View className={classnames(styles.filterChip, buildingFilter !== 'all' && styles.active)}>
                <Text>{buildingFilter === 'all' ? '楼栋' : buildingOptions.find(b => b.value === buildingFilter)?.label}</Text>
              </View>
            </Picker>
            <Picker
              mode='selector'
              range={floorFilterOptions}
              value={floorFilter === 'all' ? 0 : floorOptions.findIndex(f => f.value === floorFilter) + 1}
              onChange={(e) => {
                const idx = parseInt(e.detail.value)
                setFloorFilter(idx === 0 ? 'all' : floorOptions[idx - 1].value)
              }}
            >
              <View className={classnames(styles.filterChip, floorFilter !== 'all' && styles.active)}>
                <Text>{floorFilter === 'all' ? '楼层' : floorOptions.find(f => f.value === floorFilter)?.label}</Text>
              </View>
            </Picker>
            <Picker
              mode='selector'
              range={['全部严重度', '严重', '一般', '轻微']}
              value={severityFilter === 'all' ? 0 : severityFilter === 'serious' ? 1 : severityFilter === 'general' ? 2 : 3}
              onChange={(e) => {
                const idx = parseInt(e.detail.value)
                setSeverityFilter(['all', 'serious', 'general', 'minor'][idx])
              }}
            >
              <View className={classnames(styles.filterChip, severityFilter !== 'all' && styles.active)}>
                <Text>{severityFilter === 'all' ? '严重度' : severityFilter === 'serious' ? '严重' : severityFilter === 'general' ? '一般' : '轻微'}</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.filterRow}>
            <Picker
              mode='selector'
              range={['全部', '暂停浇筑', '正常施工']}
              value={suspendFilter === 'all' ? 0 : suspendFilter === 'suspend' ? 1 : 2}
              onChange={(e) => {
                const idx = parseInt(e.detail.value)
                setSuspendFilter(['all', 'suspend', 'normal'][idx])
              }}
            >
              <View className={classnames(styles.filterChip, suspendFilter !== 'all' && styles.active)}>
                <Text>{suspendFilter === 'all' ? '浇筑状态' : suspendFilter === 'suspend' ? '暂停浇筑' : '正常施工'}</Text>
              </View>
            </Picker>
            <Picker
              mode='selector'
              range={['全部状态', '待整改', '整改中', '待复查', '已闭合']}
              value={statusFilter === 'all' ? 0 : statusFilter === 'pending' ? 1 : statusFilter === 'processing' ? 2 : statusFilter === 'reviewed' ? 3 : 4}
              onChange={(e) => {
                const idx = parseInt(e.detail.value)
                setStatusFilter(['all', 'pending', 'processing', 'reviewed', 'closed'][idx])
              }}
            >
              <View className={classnames(styles.filterChip, statusFilter !== 'all' && styles.active)}>
                <Text>{statusFilter === 'all' ? '整改状态' : statusFilter === 'pending' ? '待整改' : statusFilter === 'processing' ? '整改中' : statusFilter === 'reviewed' ? '待复查' : '已闭合'}</Text>
              </View>
            </Picker>
          </View>
        </View>

        {filteredRectItems.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>暂无匹配的整改项</Text>
            <Text className={styles.emptySubtext}>调整筛选条件查看更多</Text>
          </View>
        ) : (
          <View className={styles.timelineList}>
            {filteredRectItems.map(item => {
              const timeline = buildTimeline(item)
              const isExpanded = expandedItem === item.id

              return (
                <View key={item.id} className={styles.timelineCard}>
                  <View
                    className={styles.cardHeader}
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  >
                    <View className={styles.cardHeaderLeft}>
                      <Text className={styles.cardItemName}>{item.itemName}</Text>
                      <Text className={styles.cardLocation}>{getLocationText(item.location)}</Text>
                    </View>
                    <View className={styles.cardHeaderRight}>
                      <StatusTag type={item.severity} text={item.severityName} size='sm' />
                      <StatusTag type={item.status} text={item.statusName} size='sm' />
                      <Text className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                    </View>
                  </View>

                  {item.isSuspend && (
                    <View className={styles.suspendBanner}>
                      <Text className={styles.suspendText}>🚫 要求暂停浇筑</Text>
                    </View>
                  )}

                  {isExpanded && (
                    <View className={styles.timelineContent}>
                      {timeline.map((event, index) => (
                        <View
                          key={event.id}
                          className={classnames(styles.timelineEvent, styles.clickable)}
                          onClick={() => handleEventClick(event)}
                        >
                          <View className={styles.timelineLine}>
                            <View className={classnames(styles.timelineDot, getEventColor(event.type))}>
                              <Text className={styles.dotIcon}>{getEventIcon(event.type)}</Text>
                            </View>
                            {index < timeline.length - 1 && <View className={styles.timelineConnector} />}
                          </View>
                          <View className={styles.timelineBody}>
                            <View className={styles.timelineHeader}>
                              <Text className={styles.timelineTitle}>{event.title}</Text>
                              {event.statusText && (
                                <StatusTag
                                  type={(event.statusType as any) || 'pending'}
                                  text={event.statusText}
                                  size='sm'
                                />
                              )}
                            </View>
                            <Text className={styles.timelineDetail}>{event.detail}</Text>
                            <Text className={styles.timelineTime}>{formatDateTime(event.time)}</Text>
                            <Text className={styles.clickHint}>
                              {event.type === 'photo' ? '📷 点击查看原图' : '→ 点击查看详情'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </View>

      {viewingPhoto && (
        <View className={styles.photoModalOverlay} onClick={() => setViewingPhoto(null)}>
          <View className={styles.photoModalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.photoModalHeader}>
              <Text className={styles.photoModalTitle}>照片详情</Text>
              <Button className={styles.photoModalClose} onClick={() => setViewingPhoto(null)}>
                ✕
              </Button>
            </View>
            <ScrollView className={styles.photoModalBody} scrollY>
              <AnnotatedPhoto
                photo={viewingPhoto}
                mode='full'
                showMarks={true}
                showMeta={true}
              />
            </ScrollView>
            <View className={styles.photoModalFooter}>
              <View className={styles.photoInfo}>
                <View className={styles.photoInfoRow}>
                  <Text className={styles.photoInfoLabel}>位置</Text>
                  <Text className={styles.photoInfoValue}>{getLocationText(viewingPhoto.location)}</Text>
                </View>
                <View className={styles.photoInfoRow}>
                  <Text className={styles.photoInfoLabel}>分类</Text>
                  <Text className={styles.photoInfoValue}>{viewingPhoto.categoryName}</Text>
                </View>
                <View className={styles.photoInfoRow}>
                  <Text className={styles.photoInfoLabel}>拍摄时间</Text>
                  <Text className={styles.photoInfoValue}>{formatDateTime(viewingPhoto.createTime)}</Text>
                </View>
                {viewingPhoto.description && (
                  <View className={styles.photoInfoRow}>
                    <Text className={styles.photoInfoLabel}>描述</Text>
                    <Text className={styles.photoInfoValue}>{viewingPhoto.description}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default BoardPage
