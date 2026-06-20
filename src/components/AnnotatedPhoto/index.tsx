import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { PhotoRecord } from '@/types'
import styles from './index.module.scss'

interface AnnotatedPhotoProps {
  photo: PhotoRecord
  mode?: 'thumb' | 'full'
  showMarks?: boolean
  showMeta?: boolean
  onClick?: () => void
}

const AnnotatedPhoto: React.FC<AnnotatedPhotoProps> = ({
  photo,
  mode = 'thumb',
  showMarks = true,
  showMeta = true,
  onClick
}) => {
  const marks = photo.marks || []

  if (mode === 'full') {
    return (
      <View className={styles.fullContainer} onClick={onClick}>
        <View className={styles.fullImageWrapper}>
          <Image
            className={styles.fullImage}
            src={photo.url}
            mode='widthFix'
          />
          {showMarks && marks.map((mark, index) => (
            <View key={mark.id}>
              <View
                className={styles.markDot}
                style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              >
                <Text className={styles.markIndex}>{index + 1}</Text>
              </View>
              <View
                className={styles.markLabel}
                style={{
                  left: `${mark.x}%`,
                  top: `${mark.y}%`,
                  transform: mark.x > 60 ? 'translate(-100%, -150%)' : 'translate(10%, -150%)'
                }}
              >
                <Text className={styles.markLabelText}>{index + 1}. {mark.text}</Text>
              </View>
            </View>
          ))}
        </View>
        {showMeta && marks.length > 0 && (
          <View className={styles.marksDetail}>
            <Text className={styles.marksDetailTitle}>标注位置（{marks.length}处）</Text>
            {marks.map((mark, index) => (
              <View key={mark.id} className={styles.markDetailItem}>
                <View className={styles.markDetailDot}>
                  <Text className={styles.markDetailDotText}>{index + 1}</Text>
                </View>
                <Text className={styles.markDetailText}>{mark.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <View className={styles.thumbContainer} onClick={onClick}>
      <View className={styles.thumbImageWrapper}>
        <View className={styles.thumbImageInner}>
          <Image
            className={styles.thumbImage}
            src={photo.thumbnail || photo.url}
            mode='widthFix'
          />
          {showMarks && marks.length > 0 && (
            <>
              {marks.map((mark, index) => (
                <View
                  key={mark.id}
                  className={styles.thumbDot}
                  style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                >
                  <Text className={styles.thumbDotText}>{index + 1}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        {showMarks && marks.length > 0 && (
          <View className={styles.marksBadge}>
            <Text className={styles.marksBadgeText}>{marks.length}</Text>
          </View>
        )}
      </View>
      {showMeta && (
        <View className={styles.thumbMeta}>
          <Text className={styles.thumbCategory}>{photo.categoryName}</Text>
          {marks.length > 0 && (
            <Text className={styles.thumbMarksCount}>{marks.length}处标注</Text>
          )}
        </View>
      )}
    </View>
  )
}

export default AnnotatedPhoto
