import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { InspectionRecord, RectificationItem, PhotoRecord } from '@/types'
import StatusTag from '@/components/StatusTag'
import AnnotatedPhoto from '@/components/AnnotatedPhoto'
import { getLocationText, formatDateTime } from '@/utils'
import styles from './index.module.scss'

const InspectionDetailPage: React.FC = () => {
  const router = useRouter()
  const {
    inspectionRecords,
    getRectificationsByInspection,
    getPhotosByIds,
    rectificationItems
  } = useInspection()

  const [record, setRecord] = useState<InspectionRecord | null>(null)
  const [viewingPhoto, setViewingPhoto] = useState<PhotoRecord | null>(null)

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

  const relatedRectifications = useMemo(() => {
    if (!record) return []
    return getRectificationsByInspection(record.id)
  }, [record, getRectificationsByInspection, rectificationItems])

  const relatedPhotos = useMemo(() => {
    if (!record) return []
    try {
      return getPhotosByIds(record.photos || [])
    } catch (e) {
      console.error('加载照片失败:', e)
      return []
    }
  }, [record, getPhotosByIds])

  const handleViewRectification = (item: RectificationItem) => {
    Taro.navigateTo({
      url: `/pages/rectification-detail/index?id=${item.id}`
    })
  }

  const handleViewPhoto = (photo: PhotoRecord) => {
    setViewingPhoto(viewingPhoto?.id === photo.id ? null : photo)
  }

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

        {relatedPhotos.length > 0 && (
          <View className={styles.infoCard}>
            <Text className={styles.sectionTitle}>现场照片（{relatedPhotos.length}张）</Text>
            <View className={styles.photosGrid}>
              {relatedPhotos.map(photo => (
                <View key={photo.id} className={styles.photoItem}>
                  <AnnotatedPhoto
                    photo={photo}
                    mode='thumb'
                    showMarks={true}
                    showMeta={true}
                    onClick={() => handleViewPhoto(photo)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.resultsSection}>
          <Text className={styles.sectionTitle}>检查项详情</Text>
          {record.results.map(result => (
            <View
              key={result.itemId}
              className={classnames(
                styles.resultItem,
                !result.isQualified && styles.resultItemFailed
              )}
            >
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
              {!result.isQualified && result.remark && (
                <Text className={styles.resultRemark}>备注：{result.remark}</Text>
              )}
            </View>
          ))}
        </View>

        {relatedRectifications.length > 0 && (
          <View className={styles.rectificationSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>关联整改项（{relatedRectifications.length}项）</Text>
            </View>
            {relatedRectifications.map(item => (
              <View
                key={item.id}
                className={styles.rectificationItem}
                onClick={() => handleViewRectification(item)}
              >
                <View className={styles.rectHeader}>
                  <Text className={styles.rectItemName}>{item.itemName}</Text>
                  <StatusTag type={item.severity} text={item.severityName} size='sm' />
                </View>
                <View className={styles.rectTags}>
                  <StatusTag type={item.status} text={item.statusName} size='sm' />
                  {item.isSuspend && (
                    <View className={`${styles.rectFlag} ${styles.flagDanger}`}>
                      <Text>🚫 暂停浇筑</Text>
                    </View>
                  )}
                  {item.needTechReview && (
                    <View className={`${styles.rectFlag} ${styles.flagInfo}`}>
                      <Text>🔧 技术复核</Text>
                    </View>
                  )}
                </View>
                <Text className={styles.rectDescription}>{item.description}</Text>
                <View className={styles.rectMeta}>
                  <Text className={styles.rectDeadline}>
                    截止：{formatDateTime(item.deadline)}
                  </Text>
                  <Text className={styles.rectReviewCount}>
                    {item.reviewRecords.length > 0
                      ? `已复查${item.reviewRecords.length}次`
                      : '等待整改'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className={styles.remarkSection}>
          <Text className={styles.sectionTitle}>检查备注</Text>
          {record.remark ? (
            <Text className={styles.remarkText}>{record.remark}</Text>
          ) : (
            <Text className={styles.emptyRemark}>暂无备注</Text>
          )}
        </View>
      </View>

      {relatedRectifications.length > 0 && (
        <View className={styles.bottomBar}>
          <Button
            className={classnames(styles.btn, styles.btnPrimary)}
            onClick={() => Taro.switchTab({ url: '/pages/rectification/index' })}
          >
            查看整改清单
          </Button>
        </View>
      )}

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

export default InspectionDetailPage
