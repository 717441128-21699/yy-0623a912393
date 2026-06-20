import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { InspectionRecord } from '@/types'
import StatusTag from '@/components/StatusTag'
import { getLocationText } from '@/utils'
import styles from './index.module.scss'

const InspectionDetailPage: React.FC = () => {
  const router = useRouter()
  const { inspectionRecords } = useInspection()

  const [record, setRecord] = useState<InspectionRecord | null>(null)

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = inspectionRecords.find(r => r.id === id)
      if (found) {
        setRecord(found)
      } else {
        Taro.showToast({
          title: '记录不存在',
          icon: 'none'
        })
      }
    }
  }, [router.params.id, inspectionRecords])

  if (!record) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.content}>
          <Text className={styles.emptyRemark}>加载中...</Text>
        </View>
      </ScrollView>
    )
  }

  const passedCount = record.results.filter(r => r.isQualified).length
  const failedCount = record.results.filter(r => !r.isQualified).length

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.content}>
        <View className={styles.summaryBanner}>
          <Text className={styles.summaryTitle}>
            {getLocationText(record.location)}
          </Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryStatValue}>{passedCount}</Text>
              <Text className={styles.summaryStatLabel}>合格</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryStatValue}>{failedCount}</Text>
              <Text className={styles.summaryStatLabel}>不合格</Text>
            </View>
          </View>
        </View>

        <View className={styles.basicInfo}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>检查人员</Text>
            <Text className={styles.infoValue}>{record.inspector}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>检查时间</Text>
            <Text className={styles.infoValue}>{record.inspectTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>检查位置</Text>
            <Text className={styles.infoValue}>{getLocationText(record.location)}</Text>
          </View>
          <View className={styles.statusRow}>
            <Text className={styles.infoLabel}>检查结果</Text>
            <StatusTag
              type={record.overallStatus === 'passed' ? 'passed' : 'failed'}
              text={record.overallStatusName}
              size='lg'
            />
          </View>
        </View>

        <View className={styles.resultsSection}>
          <Text className={styles.sectionTitle}>检查项详情</Text>
          {record.results.map(result => (
            <View key={result.itemId} className={styles.resultItem}>
              <Text className={styles.resultName}>{result.itemName}</Text>
              <View className={styles.resultValue}>
                <Text
                  className={classnames(
                    styles.measuredValue,
                    result.isQualified ? styles.passed : styles.failed
                  )}
                >
                  {result.measuredValue}{result.unit}
                </Text>
                <Text
                  className={classnames(
                    styles.resultIcon,
                    result.isQualified ? styles.passed : styles.failed
                  )}
                >
                  {result.isQualified ? '✓' : '✗'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.remarkSection}>
          <Text className={styles.sectionTitle}>检查备注</Text>
          {record.remark ? (
            <Text className={styles.remarkText}>{record.remark}</Text>
          ) : (
            <Text className={styles.emptyRemark}>暂无备注</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default InspectionDetailPage
