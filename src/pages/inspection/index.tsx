import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, Button, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { Location, InspectionResult, InspectionRecord } from '@/types'
import LocationSelector from '@/components/LocationSelector'
import InspectionCard from '@/components/InspectionCard'
import StatusTag from '@/components/StatusTag'
import { generateId, getCurrentDateTime, getLocationText } from '@/utils'
import styles from './index.module.scss'

const InspectionPage: React.FC = () => {
  const {
    currentLocation,
    setCurrentLocation,
    currentResults,
    updateResult,
    resetResults,
    inspectionRecords,
    addInspectionRecord,
    itemStandards
  } = useInspection()

  const [showSummary, setShowSummary] = useState(false)
  const [remark, setRemark] = useState('')

  const handleLocationChange = useCallback((location: Location) => {
    setCurrentLocation(location)
  }, [setCurrentLocation])

  const handleResultChange = useCallback((result: InspectionResult) => {
    updateResult(result)
  }, [updateResult])

  const progress = currentResults.length > 0
    ? Math.round((currentResults.filter(r => r.measuredValue > 0).length / itemStandards.length) * 100)
    : 0

  const isLocationComplete = currentLocation.building && currentLocation.floor && currentLocation.area
  const isFormComplete = currentResults.filter(r => r.measuredValue > 0).length === itemStandards.length
  const canSubmit = isLocationComplete && isFormComplete

  const passedCount = currentResults.filter(r => r.isQualified).length
  const failedCount = currentResults.filter(r => !r.isQualified && r.measuredValue > 0).length
  const hasSeriousIssue = currentResults.some(r => !r.isQualified && r.measuredValue > 0)

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({
        title: '请完成所有检查项',
        icon: 'none'
      })
      return
    }
    setShowSummary(true)
  }

  const handleConfirmSubmit = () => {
    const failedItems = currentResults.filter(r => !r.isQualified)
    const overallStatus = failedItems.length === 0 ? 'passed' : 'failed'
    
    const record: InspectionRecord = {
      id: generateId('insp-'),
      location: { ...currentLocation },
      inspector: '当前用户',
      inspectTime: getCurrentDateTime(),
      results: [...currentResults],
      photos: [],
      rectifications: [],
      overallStatus,
      overallStatusName: overallStatus === 'passed' ? '检查通过' : '需整改',
      remark
    }

    addInspectionRecord(record)
    
    Taro.showToast({
      title: overallStatus === 'passed' ? '检查通过' : '已生成整改单',
      icon: 'success'
    })

    setShowSummary(false)
    resetResults()
    setRemark('')
  }

  const handleReset = () => {
    Taro.showModal({
      title: '确认重置',
      content: '重置后当前填写的内容将丢失，确定要重置吗？',
      success: (res) => {
        if (res.confirm) {
          resetResults()
          setRemark('')
        }
      }
    })
  }

  const handleViewDetail = (record: InspectionRecord) => {
    Taro.navigateTo({
      url: `/pages/inspection-detail/index?id=${record.id}`
    })
  }

  const todayRecords = inspectionRecords.filter(r => 
    r.inspectTime.startsWith(getCurrentDateTime().split(' ')[0])
  )

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={false}
    >
      <View className={styles.header}>
        <Text className={styles.headerTitle}>今日检查</Text>
        <Text className={styles.headerSubtitle}>模板支撑安全现场复核</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayRecords.length}</Text>
            <Text className={styles.statLabel}>今日检查</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayRecords.filter(r => r.overallStatus === 'passed').length}</Text>
            <Text className={styles.statLabel}>检查通过</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayRecords.filter(r => r.overallStatus === 'failed').length}</Text>
            <Text className={styles.statLabel}>待整改</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.inspectionForm}>
          <LocationSelector
            value={currentLocation}
            onChange={handleLocationChange}
          />

          {isLocationComplete && (
            <View className={styles.itemsSection}>
              <View className={styles.itemsHeader}>
                <Text className={styles.sectionTitle}>检查项</Text>
                <Text className={styles.progressText}>{progress}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View className={styles.progressFill} style={{ width: `${progress}%` }} />
              </View>

              {itemStandards.map(standard => (
                <InspectionCard
                  key={standard.id}
                  standard={standard}
                  result={currentResults.find(r => r.itemId === standard.id)}
                  onChange={handleResultChange}
                  showDetail={true}
                />
              ))}

              <View className={styles.itemsSection}>
                <Text className={styles.sectionTitle}>检查备注</Text>
                <Textarea
                  className={styles.remarkInput}
                  placeholder='输入检查备注（可选）'
                  value={remark}
                  onInput={(e) => setRemark(e.detail.value)}
                  maxlength={500}
                  style={{
                    width: '100%',
                    minHeight: '120rpx',
                    padding: '24rpx',
                    fontSize: '28rpx',
                    backgroundColor: '#f5f7fa',
                    borderRadius: '12rpx',
                    border: '2rpx solid #e0e0e0',
                    lineHeight: '1.5'
                  }}
                />
              </View>
            </View>
          )}
        </View>

        <View className={styles.recentSection}>
          <Text className={styles.sectionTitle}>今日检查记录</Text>
          {todayRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无检查记录</Text>
            </View>
          ) : (
            <View className={styles.recentList}>
              {todayRecords.map(record => (
                <View
                  key={record.id}
                  className={styles.recentItem}
                  onClick={() => handleViewDetail(record)}
                >
                  <View className={styles.recentHeader}>
                    <Text className={styles.recentLocation}>
                      {getLocationText(record.location)}
                    </Text>
                    <StatusTag
                      type={record.overallStatus === 'passed' ? 'passed' : 'failed'}
                      text={record.overallStatusName}
                      size='sm'
                    />
                  </View>
                  <View className={styles.recentMeta}>
                    <Text className={styles.recentTime}>{record.inspectTime}</Text>
                  </View>
                  <View className={styles.recentResult}>
                    <Text className={`${styles.resultItem} ${styles.passed}`}>
                      ✓ {record.results.filter(r => r.isQualified).length}项合格
                    </Text>
                    {record.results.filter(r => !r.isQualified).length > 0 && (
                      <Text className={`${styles.resultItem} ${styles.failed}`}>
                        ✗ {record.results.filter(r => !r.isQualified).length}项不合格
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {isLocationComplete && (
        <View className={styles.bottomBar}>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={handleReset}
          >
            重置
          </Button>
          <Button
            className={classnames(
              styles.btn,
              styles.btnPrimary,
              !canSubmit && styles.btnDisabled
            )}
            onClick={handleSubmit}
          >
            提交检查
          </Button>
        </View>
      )}

      {showSummary && (
        <View className={styles.summaryModal} onClick={() => setShowSummary(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>检查结果确认</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.summaryStats}>
                <View className={`${styles.summaryStat} ${styles.passed}`}>
                  <Text className={`${styles.summaryStatValue} ${styles.passed}`}>{passedCount}</Text>
                  <Text className={styles.summaryStatLabel}>合格项</Text>
                </View>
                <View className={`${styles.summaryStat} ${styles.failed}`}>
                  <Text className={`${styles.summaryStatValue} ${styles.failed}`}>{failedCount}</Text>
                  <Text className={styles.summaryStatLabel}>不合格项</Text>
                </View>
              </View>

              {hasSeriousIssue && (
                <View className={styles.warningBox}>
                  <Text className={styles.warningText}>
                    ⚠️ 存在不合格项，将自动生成整改清单。严重不合格项将要求暂停浇筑并通知技术负责人复核。
                  </Text>
                </View>
              )}

              {!hasSeriousIssue && (
                <View className={styles.infoBox}>
                  <Text className={styles.infoText}>
                    ✓ 所有检查项均合格，可提交检查记录。
                  </Text>
                </View>
              )}

              {failedCount > 0 && (
                <View className={styles.failedItems}>
                  <Text className={styles.failedItemsTitle}>不合格项清单</Text>
                  {currentResults.filter(r => !r.isQualified).map(item => (
                    <View key={item.itemId} className={styles.failedItem}>
                      <Text className={styles.failedItemName}>{item.itemName}</Text>
                      <Text className={styles.failedItemValue}>
                        {item.measuredValue}{item.unit}（不合格）
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View className={styles.modalFooter}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowSummary(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(
                  styles.modalBtn,
                  hasSeriousIssue ? styles.modalBtnDanger : styles.modalBtnConfirm
                )}
                onClick={handleConfirmSubmit}
              >
                {hasSeriousIssue ? '确认并生成整改单' : '确认提交'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default InspectionPage
