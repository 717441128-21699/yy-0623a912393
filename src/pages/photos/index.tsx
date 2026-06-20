import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { PhotoRecord } from '@/types'
import PhotoCard from '@/components/PhotoCard'
import { photoCategories } from '@/data/inspectionItems'
import { formatDateTime, getLocationText } from '@/utils'
import styles from './index.module.scss'

const PhotosPage: React.FC = () => {
  const { photoRecords } = useInspection()

  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [viewingPhoto, setViewingPhoto] = useState<PhotoRecord | null>(null)
  const [activeMark, setActiveMark] = useState<string | null>(null)

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'all') return photoRecords
    return photoRecords.filter(p => p.category === activeFilter)
  }, [activeFilter, photoRecords])

  const photosWithMarks = photoRecords.filter(p => p.marks.length > 0).length
  const photosToday = photoRecords.filter(p => 
    p.createTime.startsWith(new Date().toISOString().split('T')[0])
  ).length

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        Taro.navigateTo({
          url: `/pages/photo-mark/index?tempPath=${res.tempFilePaths[0]}`
        })
      }
    })
  }

  const handleViewPhoto = (photo: PhotoRecord) => {
    setViewingPhoto(photo)
    setActiveMark(null)
  }

  const handleMarkClick = (markId: string) => {
    setActiveMark(activeMark === markId ? null : markId)
  }

  const filters = [
    { value: 'all', label: '全部' },
    ...photoCategories
  ]

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={false}
    >
      <View className={styles.header}>
        <Text className={styles.headerTitle}>拍照记录</Text>
        <Text className={styles.headerSubtitle}>现场问题照片存档</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{photoRecords.length}</Text>
            <Text className={styles.statLabel}>总照片数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{photosWithMarks}</Text>
            <Text className={styles.statLabel}>标注照片</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{photosToday}</Text>
            <Text className={styles.statLabel}>今日上传</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.filterSection}>
          {filters.map(filter => (
            <Button
              key={filter.value}
              className={classnames(
                styles.filterChip,
                activeFilter === filter.value && styles.active
              )}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </View>

        {filteredPhotos.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📷</Text>
            <Text className={styles.emptyText}>暂无照片记录</Text>
          </View>
        ) : (
          <View className={styles.photoGrid}>
            {filteredPhotos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => handleViewPhoto(photo)}
              />
            ))}
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.btn, styles.btnPrimary)}
          onClick={handleTakePhoto}
        >
          📷 拍照记录问题
        </Button>
      </View>

      {viewingPhoto && (
        <View className={styles.modalOverlay} onClick={() => setViewingPhoto(null)}>
          <View className={styles.modalHeader}>
            <Text className={styles.modalTitle}>照片详情</Text>
            <Button
              className={styles.closeBtn}
              onClick={() => setViewingPhoto(null)}
            >
              ✕
            </Button>
          </View>
          
          <View className={styles.modalBody} onClick={e => e.stopPropagation()}>
            <Image
              className={styles.largeImage}
              src={viewingPhoto.url}
              mode='widthFix'
            />
            {viewingPhoto.marks.map((mark, index) => (
              <View key={mark.id}>
                <View
                  className={styles.markDot}
                  style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                  onClick={() => handleMarkClick(mark.id)}
                />
                {(activeMark === mark.id || viewingPhoto.marks.length <= 3) && (
                  <View
                    className={styles.markTooltip}
                    style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                  >
                    {index + 1}. {mark.text}
                  </View>
                )}
              </View>
            ))}
          </View>

          <View className={styles.modalFooter} onClick={e => e.stopPropagation()}>
            <View className={styles.photoInfo}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>位置</Text>
                <Text className={styles.infoValue}>{getLocationText(viewingPhoto.location)}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>分类</Text>
                <Text className={styles.infoValue}>{viewingPhoto.categoryName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>拍摄时间</Text>
                <Text className={styles.infoValue}>{formatDateTime(viewingPhoto.createTime)}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>描述</Text>
                <Text className={styles.infoValue}>{viewingPhoto.description}</Text>
              </View>
              
              {viewingPhoto.marks.length > 0 && (
                <View className={styles.marksList}>
                  <Text className={styles.marksTitle}>问题标注（{viewingPhoto.marks.length}处）</Text>
                  {viewingPhoto.marks.map((mark, index) => (
                    <View key={mark.id} className={styles.markItem}>
                      <Text className={styles.markIndex}>{index + 1}</Text>
                      <Text className={styles.markText}>{mark.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default PhotosPage
