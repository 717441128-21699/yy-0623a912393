import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Button, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { Location, InspectionResult, InspectionRecord } from '@/types'
import LocationSelector from '@/components/LocationSelector'
import InspectionCard from '@/components/InspectionCard'
import StatusTag from '@/components/StatusTag'
import { generateId, getCurrentDateTime, getLocationText, SeverityResult } from '@/utils'
import styles from './index.module.scss'

interface FailedItemWithSeverity {
  result: InspectionResult
  severity: SeverityResult
  standardName: string
  qualifiedRange: string
  unit: string
}

const InspectionPage: React.FC = () => {
  const {
    currentLocation,
    setCurrentLocation,
    currentResults,
    updateResult,
    resetResults,
    inspectionRecords,
    addInspectionRecord,
    itemStandards,
    getItemSeverity,
    photoRecords,
    getCurrentInspectionId
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
  const hasFailed = failedCount > 0

  const failedItemsWithSeverity = useMemo<FailedItemWithSeverity[]>(() => {
    return currentResults
      .filter(r => !r.isQualified && r.measuredValue > 0)
      .map(r => {
        const standard = itemStandards.find(s => s.id === r.itemId)
        const severity = standard
          ? getItemSeverity(r.itemId, r.measuredValue, standard.minValue, standard.maxValue)
          : null
        return {
          result: r,
          severity: severity || {
            severity: 'minor' as const,
            severityName: '轻微',
            isSuspend: false,
            needTechReview: false,
            deviationPercent: 0,
            deviationValue: 0
          },
          standardName: standard?.name || r.itemName,
          qualifiedRange: standard?.qualifiedRange || '',
          unit: standard?.unit || r.unit
        }
      })
  }, [currentResults, itemStandards, getItemSeverity])

  const seriousCount = failedItemsWithSeverity.filter(f => f.severity.severity === 'serious').length
  const generalCount = failedItemsWithSeverity.filter(f => f.severity.severity === 'general').length
  const minorCount = failedItemsWithSeverity.filter(f => f.severity.severity === 'minor').length
  const hasSuspendIssue = failedItemsWithSeverity.some(f => f.severity.isSuspend)

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

    const relatedPhotoIds = photoRecords
      .filter(p =>
        p.location.building === currentLocation.building &&
        p.location.floor === currentLocation.floor &&
        p.location.area === currentLocation.area
      )
      .map(p => p.id)

    const record: InspectionRecord = {
      id: generateId('insp-'),
      location: { ...currentLocation },
      inspector: '当前用户',
      inspectTime: getCurrentDateTime(),
      results: [...currentResults],
      photos: relatedPhotoIds,
      rectifications: [],
      overallStatus,
      overallStatusName: overallStatus === 'passed' ? '检查通过' : '需整改',
      remark
    }

    const rectResult = addInspectionRecord(record)

    Taro.showToast({
      title: overallStatus === 'passed' ? '检查通过' : '已生成整改单',
      icon: 'success'
    })

    setShowSummary(false)
    resetResults()
    setRemark('')

    if (rectResult && rectResult.items.length > 0) {
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/rectification/index'
        })
      }, 1500)
    }
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
                    {record.rectifications.length > 0 && (
                      <Text className={styles.rectCount}>关联{record.rectifications.length}项整改</Text>
                    )}
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
            <ScrollView className={styles.modalScrollBody} scrollY>
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

              {hasFailed && (
                <View className={styles.severitySummary}>
                  <Text className={styles.summarySubTitle}>严重程度分布</Text>
                  <View className={styles.severityRow}>
                    {seriousCount > 0 && (
                      <View className={`${styles.severityBadge} ${styles.serious}`}>
                        <Text className={styles.severityCount}>{seriousCount}</Text>
                        <Text className={styles.severityLabel}>严重</Text>
                      </View>
                    )}
                    {generalCount > 0 && (
                      <View className={`${styles.severityBadge} ${styles.general}`}>
                        <Text className={styles.severityCount}>{generalCount}</Text>
                        <Text className={styles.severityLabel}>一般</Text>
                      </View>
                    )}
                    {minorCount > 0 && (
                      <View className={`${styles.severityBadge} ${styles.minor}`}>
                        <Text className={styles.severityCount}>{minorCount}</Text>
                        <Text className={styles.severityLabel}>轻微</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {hasSuspendIssue && (
                <View className={styles.dangerBox}>
                  <Text className={styles.dangerText}>
                    🚫 检测到严重安全隐患！
                  </Text>
                  <Text className={styles.dangerSubtext}>
                    {seriousCount}项检查严重超限，将要求暂停浇筑并通知技术负责人复核
                  </Text>
                </View>
              )}

              {hasFailed && !hasSuspendIssue && (
                <View className={styles.warningBox}>
                  <Text className={styles.warningText}>
                    ⚠️ 存在{failedCount}项不合格项，将自动生成整改清单
                  </Text>
                </View>
              )}

              {!hasFailed && (
                <View className={styles.infoBox}>
                  <Text className={styles.infoText}>
                    ✓ 所有检查项均合格，可提交检查记录
                  </Text>
                </View>
              )}

              {failedCount > 0 && (
                <View className={styles.failedItems}>
                  <Text className={styles.failedItemsTitle}>不合格项详细清单</Text>
                  {failedItemsWithSeverity.map(({ result, severity, standardName, qualifiedRange, unit }) => (
                    <View key={result.itemId} className={styles.failedItemDetail}>
                      <View className={styles.failedItemHeader}>
                        <Text className={styles.failedItemName}>{standardName}</Text>
                        <StatusTag type={severity.severity} text={severity.severityName} size='sm' />
                      </View>
                      <View className={styles.failedItemInfo}>
                        <View className={styles.infoBlock}>
                          <Text className={styles.infoBlockLabel}>实测值</Text>
                          <Text className={`${styles.infoBlockValue} ${styles.failed}`}>
                            {result.measuredValue}{unit}
                          </Text>
                        </View>
                        <View className={styles.infoBlock}>
                          <Text className={styles.infoBlockLabel}>合格范围</Text>
                          <Text className={styles.infoBlockValue}>{qualifiedRange}{unit}</Text>
                        </View>
                        <View className={styles.infoBlock}>
                          <Text className={styles.infoBlockLabel}>偏差</Text>
                          <Text className={styles.infoBlockValue}>
                            {severity.deviationValue > 0 ? `${severity.deviationValue}${unit}` : '-'}
                          </Text>
                        </View>
                      </View>
                      <View className={styles.failedItemFlags}>
                        {severity.isSuspend && (
                          <View className={`${styles.flag} ${styles.flagDanger}`}>
                            <Text>🚫 暂停浇筑</Text>
                          </View>
                        )}
                        {severity.needTechReview && (
                          <View className={`${styles.flag} ${styles.flagInfo}`}>
                            <Text>🔧 技术复核</Text>
                          </View>
                        )}
                        {!severity.isSuspend && !severity.needTechReview && (
                          <View className={`${styles.flag} ${styles.flagNormal}`}>
                            <Text>✓ 班组整改</Text>
                          </View>
                        )}
                      </View>
                      {result.remark && (
                        <Text className={styles.failedItemRemark}>备注：{result.remark}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
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
                  hasSuspendIssue ? styles.modalBtnDanger : hasFailed ? styles.modalBtnWarning : styles.modalBtnConfirm
                )}
                onClick={handleConfirmSubmit}
              >
                {hasSuspendIssue ? '确认并暂停浇筑' : hasFailed ? '确认并生成整改单' : '确认提交'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default InspectionPage
