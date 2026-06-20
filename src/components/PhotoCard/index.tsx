import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { PhotoRecord } from '@/types'
import { formatDateTime, getLocationText } from '@/utils'
import styles from './index.module.scss'

interface PhotoCardProps {
  photo: PhotoRecord
  onClick?: () => void
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={photo.thumbnail}
          mode='aspectFill'
        />
        {photo.marks.length > 0 && (
          <Text className={styles.marksIndicator}>{photo.marks.length}处标注</Text>
        )}
        <Text className={styles.categoryTag}>{photo.categoryName}</Text>
      </View>
      
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.location}>{getLocationText(photo.location)}</Text>
          <Text className={styles.time}>{formatDateTime(photo.createTime)}</Text>
        </View>
        
        <Text className={styles.description}>{photo.description}</Text>
        
        {photo.marks.length > 0 && (
          <View className={styles.marksList}>
            {photo.marks.slice(0, 2).map(mark => (
              <Text key={mark.id} className={styles.markItem}>{mark.text}</Text>
            ))}
            {photo.marks.length > 2 && (
              <Text className={styles.markItem}>...还有{photo.marks.length - 2}处问题</Text>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default PhotoCard
