import React from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusTagProps {
  type?: 'passed' | 'failed' | 'serious' | 'general' | 'minor' | 'pending' | 'processing' | 'reviewed' | 'closed'
  size?: 'sm' | 'md' | 'lg'
  text: string
  className?: string
}

const StatusTag: React.FC<StatusTagProps> = ({ type = 'passed', size = 'md', text, className }) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[type],
        size === 'lg' && styles.lg,
        size === 'sm' && styles.sm,
        className
      )}
    >
      {text}
    </View>
  )
}

export default StatusTag
