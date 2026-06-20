import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { RectificationItem } from '@/types'
import StatusTag from '@/components/StatusTag'
import { formatDateTime, getLocationText } from '@/utils'
import styles from './index.module.scss'

interface RectificationCardProps {
  item: RectificationItem
  onClick?: () => void
}

const RectificationCard: React.FC<RectificationCardProps> = ({ item, onClick }) => {
  const getDeadlineStatus = () => {
    const now = new Date().getTime()
    const deadline = new Date(item.deadline).getTime()
    const diff = deadline - now
    const hoursDiff = diff / (1000 * 60 * 60)
    
    if (hoursDiff < 0) return 'overdue'
    if (hoursDiff < 24) return 'urgent'
    return 'normal'
  }

  const deadlineStatus = getDeadlineStatus()

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.itemInfo}>
          <Text className={styles.itemName}>{item.itemName}</Text>
          <View className={styles.tagsRow}>
            <StatusTag type={item.severity} text={item.severityName} size='sm' />
            <StatusTag type={item.status} text={item.statusName} size='sm' />
          </View>
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

      <View className={styles.locationRow}>
        <Text className={styles.locationIcon}>📍</Text>
        <Text className={styles.locationText}>{getLocationText(item.location)}</Text>
      </View>

      <Text className={styles.description}>{item.description}</Text>

      {item.photos.length > 0 && (
        <View className={styles.photoPreview}>
          {item.photos.slice(0, 4).map((photoId, index) => {
            const photoUrl = `https://picsum.photos/id/${100 + index}/120/120`
            return (
              <Image
                key={index}
                className={styles.photoThumb}
                src={photoUrl}
                mode='aspectFill'
              />
            )
          })}
        </View>
      )}

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>责任人</Text>
          <Text className={styles.metaValue}>{item.handler}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>创建时间</Text>
          <Text className={styles.metaValue}>{formatDateTime(item.createTime)}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>截止时间</Text>
          <Text className={`${styles.deadline} ${styles[deadlineStatus]}`}>
            {formatDateTime(item.deadline)}
          </Text>
        </View>
        {item.reviewRecords.length > 0 && (
          <View className={styles.reviewCount}>
            <Text>📝 {item.reviewRecords.length}次复查</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default RectificationCard
