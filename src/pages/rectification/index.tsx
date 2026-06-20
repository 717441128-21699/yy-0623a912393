import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { RectificationItem } from '@/types'
import RectificationCard from '@/components/RectificationCard'
import { severityOptions, statusOptions } from '@/data/inspectionItems'
import styles from './index.module.scss'

const RectificationPage: React.FC = () => {
  const { rectificationItems } = useInspection()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const pendingCount = rectificationItems.filter(r => r.status === 'pending').length
  const processingCount = rectificationItems.filter(r => r.status === 'processing').length
  const reviewedCount = rectificationItems.filter(r => r.status === 'reviewed').length
  const closedCount = rectificationItems.filter(r => r.status === 'closed').length

  const seriousCount = rectificationItems.filter(r => r.severity === 'serious').length
  const generalCount = rectificationItems.filter(r => r.severity === 'general').length
  const minorCount = rectificationItems.filter(r => r.severity === 'minor').length

  const suspendCount = rectificationItems.filter(r => r.isSuspend).length

  const filteredItems = useMemo(() => {
    return rectificationItems.filter(item => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter
      const severityMatch = severityFilter === 'all' || item.severity === severityFilter
      return statusMatch && severityMatch
    })
  }, [rectificationItems, statusFilter, severityFilter])

  const handleViewDetail = (item: RectificationItem) => {
    Taro.navigateTo({
      url: `/pages/rectification-detail/index?id=${item.id}`
    })
  }

  const statusFilters = [
    { value: 'all', label: '全部' },
    ...statusOptions
  ]

  const severityFilters = [
    { value: 'all', label: '全部严重程度' },
    ...severityOptions
  ]

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={false}
    >
      <View className={styles.header}>
        <Text className={styles.headerTitle}>整改清单</Text>
        <Text className={styles.headerSubtitle}>问题整改跟踪管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{pendingCount + processingCount}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{reviewedCount}</Text>
            <Text className={styles.statLabel}>待复查</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{closedCount}</Text>
            <Text className={styles.statLabel}>已闭合</Text>
          </View>
        </View>
      </View>

      {suspendCount > 0 && (
        <View className={styles.alertBanner}>
          <Text className={styles.alertText}>
            ⚠️ 当前有 {suspendCount} 项严重问题要求暂停浇筑
          </Text>
          <Text className={styles.alertSubtext}>
            请立即处理，整改完成并通过复查后方可恢复施工
          </Text>
        </View>
      )}

      <View className={styles.content}>
        <View className={styles.summarySection}>
          <Text className={styles.summaryTitle}>严重程度分布</Text>
          <View className={styles.summaryGrid}>
            <View className={styles.summaryCard}>
              <Text className={`${styles.summaryCardValue} ${styles.serious}`}>{seriousCount}</Text>
              <Text className={styles.summaryCardLabel}>严重</Text>
            </View>
            <View className={styles.summaryCard}>
              <Text className={`${styles.summaryCardValue} ${styles.general}`}>{generalCount}</Text>
              <Text className={styles.summaryCardLabel}>一般</Text>
            </View>
            <View className={styles.summaryCard}>
              <Text className={`${styles.summaryCardValue} ${styles.minor}`}>{minorCount}</Text>
              <Text className={styles.summaryCardLabel}>轻微</Text>
            </View>
          </View>
        </View>

        <View className={styles.filterTabs}>
          {statusFilters.map(filter => (
            <Button
              key={filter.value}
              className={classnames(
                styles.filterTab,
                statusFilter === filter.value && styles.active
              )}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </View>

        <View className={styles.filterSection}>
          {severityFilters.map(filter => (
            <Button
              key={filter.value}
              className={classnames(
                styles.filterChip,
                severityFilter === filter.value && styles.active
              )}
              onClick={() => setSeverityFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </View>

        {filteredItems.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>暂无整改项</Text>
            <Text className={styles.emptySubtext}>当前筛选条件下没有整改记录</Text>
          </View>
        ) : (
          <View className={styles.listSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleText}>整改项列表</Text>
              <Text className={styles.sectionCount}>共 {filteredItems.length} 项</Text>
            </View>
            {filteredItems.map(item => (
              <RectificationCard
                key={item.id}
                item={item}
                onClick={() => handleViewDetail(item)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default RectificationPage
