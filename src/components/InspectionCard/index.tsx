import React, { useState, useCallback } from 'react'
import { View, Text, Image, Input, Textarea } from '@tarojs/components'
import classnames from 'classnames'
import { InspectionItemStandard, InspectionResult } from '@/types'
import styles from './index.module.scss'

interface InspectionCardProps {
  standard: InspectionItemStandard
  result?: InspectionResult
  onChange: (result: InspectionResult) => void
  showDetail?: boolean
}

const InspectionCard: React.FC<InspectionCardProps> = ({ standard, result, onChange, showDetail = true }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [inputValue, setInputValue] = useState(result?.measuredValue?.toString() || '')

  const handleInputChange = useCallback((e: any) => {
    const value = e.detail.value
    setInputValue(value)
    const numValue = parseFloat(value)
    
    if (!isNaN(numValue)) {
      const isQualified = numValue >= standard.minValue && numValue <= standard.maxValue
      onChange({
        itemId: standard.id,
        itemName: standard.name,
        measuredValue: numValue,
        unit: standard.unit,
        isQualified,
        remark: result?.remark || ''
      })
    }
  }, [standard, result?.remark, onChange])

  const handleRemarkChange = useCallback((e: any) => {
    const remark = e.detail.value
    const numValue = parseFloat(inputValue)
    const isQualified = !isNaN(numValue) && numValue >= standard.minValue && numValue <= standard.maxValue
    
    onChange({
      itemId: standard.id,
      itemName: standard.name,
      measuredValue: isNaN(numValue) ? 0 : numValue,
      unit: standard.unit,
      isQualified,
      remark
    })
  }, [standard, inputValue, onChange])

  const hasValue = inputValue !== ''
  const numValue = parseFloat(inputValue)
  const isQualified = hasValue && !isNaN(numValue) && numValue >= standard.minValue && numValue <= standard.maxValue

  const getInputStatus = () => {
    if (!hasValue) return ''
    if (isFocused) return 'focused'
    return isQualified ? 'success' : 'error'
  }

  return (
    <View className={styles.card}>
      <View className={styles.cardHeader}>
        <View className={styles.itemTitle}>
          <Text className={styles.itemName}>{standard.name}</Text>
          <View className={styles.qualifiedRange}>
            <Text className={styles.standardText}>合格范围：{standard.qualifiedRange} {standard.unit}</Text>
          </View>
        </View>
        
        {hasValue && (
          <View className={classnames(styles.statusIndicator, isQualified ? styles.success : styles.error)}>
            <Text className={styles.statusIcon}>{isQualified ? '✓' : '✗'}</Text>
            <Text>{isQualified ? '合格' : '不合格'}</Text>
          </View>
        )}
      </View>

      {expanded && showDetail && (
        <>
          <View className={styles.diagramSection}>
            <Text className={styles.diagramTitle}>现场示意图</Text>
            <Image
              className={styles.diagramImage}
              src={standard.diagramUrl}
              mode='aspectFill'
            />
          </View>

          <Text className={styles.description}>{standard.description}</Text>

          <View className={styles.keyPoints}>
            <Text className={styles.keyPointsTitle}>检查要点</Text>
            {standard.keyPoints.map((point, index) => (
              <Text key={index} className={styles.keyPointItem}>{point}</Text>
            ))}
          </View>
        </>
      )}

      <View className={styles.inputSection}>
        <Text className={styles.inputLabel}>实测值</Text>
        <View className={styles.inputRow}>
          <View className={classnames(styles.inputWrap, styles[getInputStatus()])}>
            <Input
              className={styles.input}
              type='digit'
              placeholder='请输入实测值'
              value={inputValue}
              onInput={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Text className={styles.unitText}>{standard.unit}</Text>
          </View>
        </View>
      </View>

      {!expanded && showDetail && (
        <View className={styles.collapsedContent}>
          <View className={styles.collapsedValue}>
            <Text>{hasValue ? `${inputValue} ${standard.unit}` : '未填写'}</Text>
            {hasValue && (
              <Text className={isQualified ? styles.success : styles.error}>
                {isQualified ? '✓ 合格' : '✗ 不合格'}
              </Text>
            )}
          </View>
          <Text className={styles.expandBtn} onClick={() => setExpanded(true)}>展开详情</Text>
        </View>
      )}

      {showDetail && (
        <>
          <Textarea
            className={styles.remarkInput}
            placeholder='备注（可选）'
            value={result?.remark || ''}
            onInput={handleRemarkChange}
            maxlength={200}
          />
          
          {expanded && (
            <Text className={styles.expandBtn} onClick={() => setExpanded(false)}>收起详情</Text>
          )}
        </>
      )}
    </View>
  )
}

export default InspectionCard
