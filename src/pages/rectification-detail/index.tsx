import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Button, Image, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { RectificationItem, ReviewRecord, PhotoRecord } from '@/types'
import StatusTag from '@/components/StatusTag'
import { getLocationText, formatDateTime, generateId, getCurrentDateTime } from '@/utils'
import styles from './index.module.scss'

const RectificationDetailPage: React.FC = () => {
  const router = useRouter()
  const {
    rectificationItems,
    updateRectificationItem,
    getPhotosByIds,
    photoRecords
  } = useInspection()

  const [item, setItem] = useState<RectificationItem | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewResult, setReviewResult] = useState<'pass' | 'fail'>('pass')
  const [reviewRemark, setReviewRemark] = useState('')
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null)

  const actualPhotos = useMemo(() => {
    if (!item) return []
    const directPhotos = getPhotosByIds(item.photos || [])
    const additionalPhotos = item.inspectionId
      ? photoRecords.filter(p => p.inspectionId === item.inspectionId)
      : []
    const allPhotos = [...directPhotos]
    additionalPhotos.forEach(p => {
      if (!allPhotos.find(ap => ap.id === p.id)) {
        allPhotos.push(p)
      }
    })
    return allPhotos
  }, [item, getPhotosByIds, photoRecords])

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = rectificationItems.find(r => r.id === id)
      if (found) {
        setItem(found)
      } else {
        Taro.showToast({
          title: '记录不存在',
          icon: 'none'
        })
      }
    }
  }, [router.params.id, rectificationItems])

  const handleStartProcess = () => {
    if (!item) return
    const updated = {
      ...item,
      status: 'processing' as const,
      statusName: '整改中'
    }
    updateRectificationItem(updated)
    setItem(updated)
    Taro.showToast({ title: '已开始整改', icon: 'success' })
  }

  const handleSubmitReview = () => {
    setShowReviewModal(true)
    setReviewResult('pass')
    setReviewRemark('')
  }

  const handleConfirmReview = () => {
    if (!item) return

    const newReview: ReviewRecord = {
      id: generateId('review-'),
      time: getCurrentDateTime(),
      operator: '当前用户',
      result: reviewResult,
      remark: reviewRemark,
      photos: []
    }

    const newStatus = reviewResult === 'pass' ? 'closed' : 'processing'
    const newStatusName = reviewResult === 'pass' ? '已闭合' : '整改中'

    const updated = {
      ...item,
      status: newStatus,
      statusName: newStatusName,
      reviewRecords: [...item.reviewRecords, newReview]
    }

    updateRectificationItem(updated)
    setItem(updated)
    setShowReviewModal(false)

    Taro.showToast({
      title: reviewResult === 'pass' ? '复查通过，已闭合' : '需继续整改',
      icon: 'success'
    })
  }

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        const rectId = router.params.id
        Taro.navigateTo({
          url: `/pages/photo-mark/index?tempPath=${res.tempFilePaths[0]}&rectificationId=${rectId}`
        })
      }
    })
  }

  const handleViewPhoto = (index: number) => {
    const photos = actualPhotos
    if (photos.length === 0) return
    Taro.previewImage({
      urls: photos.map(p => p.url),
      current: photos[index].url
    })
  }

  if (!item) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.content}>
          <Text className={styles.descriptionText}>加载中...</Text>
        </View>
      </ScrollView>
    )
  }

  const canStartProcess = item.status === 'pending'
  const canReview = item.status === 'processing' || item.status === 'reviewed'

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.content}>
        <View className={styles.headerCard}>
          <Text className={styles.itemName}>{item.itemName}</Text>
          <View className={styles.tagsRow}>
            <StatusTag type={item.severity} text={item.severityName} size='lg' />
            <StatusTag type={item.status} text={item.statusName} size='lg' />
          </View>
          <View className={styles.warningFlags}>
            {item.isSuspend && (
              <View className={`${styles.warningFlag} ${styles.danger}`}>
                <Text>⚠</Text>
                <Text>暂停浇筑</Text>
              </View>
            )}
            {item.needTechReview && (
              <View className={`${styles.warningFlag} ${styles.info}`}>
                <Text>🔧</Text>
                <Text>技术复核</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>问题位置</Text>
            <Text className={styles.infoValue}>{getLocationText(item.location)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>责任人</Text>
            <Text className={styles.infoValue}>{item.handler}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(item.createTime)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>截止时间</Text>
            <Text className={classnames(styles.infoValue, styles.deadlineText)}>
              {formatDateTime(item.deadline)}
            </Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>问题描述</Text>
          <Text className={styles.descriptionText}>{item.description}</Text>
        </View>

        <View className={styles.infoCard}>
          <View className={styles.sectionHeaderRow}>
            <Text className={styles.sectionTitle}>问题照片（{actualPhotos.length}张）</Text>
            <Button
              className={styles.takePhotoBtn}
              onClick={handleTakePhoto}
            >
              + 补充拍照
            </Button>
          </View>
          {actualPhotos.length === 0 ? (
            <View className={styles.emptyPhoto}>
              <Text className={styles.emptyPhotoIcon}>📷</Text>
              <Text className={styles.emptyPhotoText}>暂无照片，可点击上方按钮补充拍照</Text>
            </View>
          ) : (
            <View className={styles.photosGrid}>
              {actualPhotos.map((photo, index) => (
                <View
                  key={photo.id}
                  className={styles.photoCard}
                  onClick={() => handleViewPhoto(index)}
                >
                  <Image
                    className={styles.photoThumb}
                    src={photo.thumbnail || photo.url}
                    mode='aspectFill'
                  />
                  {photo.marks && photo.marks.length > 0 && (
                    <View className={styles.marksCountBadge}>
                      <Text>{photo.marks.length}标注</Text>
                    </View>
                  )}
                  <View className={styles.photoMeta}>
                    <Text className={styles.photoCategory}>{photo.categoryName}</Text>
                  </View>
                  {photo.marks && photo.marks.length > 0 && (
                    <View className={styles.marksPreview}>
                      {photo.marks.slice(0, 2).map((mark, idx) => (
                        <Text key={mark.id} className={styles.markPreviewItem}>
                          • {idx + 1}. {mark.text}
                        </Text>
                      ))}
                      {photo.marks.length > 2 && (
                        <Text className={styles.markMore}>...等{photo.marks.length}处</Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.reviewsSection}>
          <Text className={styles.sectionTitle}>复查记录（{item.reviewRecords.length}次）</Text>
          {item.reviewRecords.length === 0 ? (
            <View className={styles.emptyReview}>
              <Text className={styles.emptyReviewText}>暂无复查记录</Text>
            </View>
          ) : (
            item.reviewRecords.map((review, index) => (
              <View key={review.id} className={styles.reviewItem}>
                <View className={styles.reviewHeader}>
                  <View>
                    <Text className={styles.reviewOperator}>第{index + 1}次复查 · {review.operator}</Text>
                    <Text className={styles.reviewTime}>{formatDateTime(review.time)}</Text>
                  </View>
                  <Text
                    className={classnames(
                      styles.reviewResult,
                      review.result === 'pass' ? styles.pass : styles.fail
                    )}
                  >
                    {review.result === 'pass' ? '✓ 通过' : '✗ 未通过'}
                  </Text>
                </View>
                <Text className={styles.reviewRemark}>{review.remark}</Text>
                {review.photos.length > 0 && (
                  <View className={styles.reviewPhotos}>
                    {review.photos.map((photo, idx) => (
                      <Image
                        key={idx}
                        className={styles.reviewPhoto}
                        src={photo}
                        mode='aspectFill'
                      />
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        {canStartProcess && (
          <>
            <Button
              className={classnames(styles.btn, styles.btnSecondary)}
              onClick={() => Taro.navigateBack()}
            >
              返回
            </Button>
            <Button
              className={classnames(styles.btn, styles.btnWarning)}
              onClick={handleStartProcess}
            >
              开始整改
            </Button>
          </>
        )}
        {canReview && (
          <>
            <Button
              className={classnames(styles.btn, styles.btnSecondary)}
              onClick={() => Taro.navigateBack()}
            >
              返回
            </Button>
            <Button
              className={classnames(styles.btn, styles.btnSuccess)}
              onClick={handleSubmitReview}
            >
              提交复查
            </Button>
          </>
        )}
        {item.status === 'closed' && (
          <Button
            className={classnames(styles.btn, styles.btnPrimary)}
            onClick={() => Taro.navigateBack()}
          >
            返回列表
          </Button>
        )}
      </View>

      {showReviewModal && (
        <View className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>提交复查</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.modalSection}>
                <Text className={styles.modalLabel}>复查结果</Text>
                <View className={styles.resultOptions}>
                  <Button
                    className={classnames(
                      styles.resultOption,
                      reviewResult === 'pass' && styles.active,
                      reviewResult === 'pass' && styles.pass
                    )}
                    onClick={() => setReviewResult('pass')}
                  >
                    ✓ 通过
                  </Button>
                  <Button
                    className={classnames(
                      styles.resultOption,
                      reviewResult === 'fail' && styles.active,
                      reviewResult === 'fail' && styles.fail
                    )}
                    onClick={() => setReviewResult('fail')}
                  >
                    ✗ 未通过
                  </Button>
                </View>
              </View>
              <View className={styles.modalSection}>
                <Text className={styles.modalLabel}>复查意见</Text>
                <Textarea
                  className={styles.modalTextarea}
                  placeholder='请输入复查意见...'
                  value={reviewRemark}
                  onInput={(e) => setReviewRemark(e.detail.value)}
                  maxlength={300}
                />
              </View>
            </View>
            <View className={styles.modalFooter}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowReviewModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnConfirm)}
                onClick={handleConfirmReview}
              >
                确认提交
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default RectificationDetailPage
