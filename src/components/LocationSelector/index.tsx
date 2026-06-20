import React, { useState } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import classnames from 'classnames'
import { Location } from '@/types'
import { buildingOptions, floorOptions, areaOptions } from '@/data/inspectionItems'
import styles from './index.module.scss'

interface LocationSelectorProps {
  value: Location
  onChange: (location: Location) => void
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange }) => {
  const buildingIndex = buildingOptions.findIndex(opt => opt.value === value.building)
  const floorIndex = floorOptions.findIndex(opt => opt.value === value.floor)
  const areaIndex = areaOptions.findIndex(opt => opt.value === value.area)

  const handleBuildingChange = (e: any) => {
    const index = parseInt(e.detail.value)
    const building = buildingOptions[index]?.value || ''
    onChange({ ...value, building })
  }

  const handleFloorChange = (e: any) => {
    const index = parseInt(e.detail.value)
    const floor = floorOptions[index]?.value || ''
    onChange({ ...value, floor })
  }

  const handleAreaChange = (e: any) => {
    const index = parseInt(e.detail.value)
    const area = areaOptions[index]?.value || ''
    onChange({ ...value, area })
  }

  const getLocationText = () => {
    const building = buildingOptions.find(opt => opt.value === value.building)?.label || ''
    const floor = floorOptions.find(opt => opt.value === value.floor)?.label || ''
    const area = areaOptions.find(opt => opt.value === value.area)?.label || ''
    return [building, floor, area].filter(Boolean).join(' · ')
  }

  const isComplete = value.building && value.floor && value.area

  return (
    <View className={styles.container}>
      <Text className={styles.title}>选择检查位置</Text>
      
      <View className={styles.selectorRow}>
        <View className={styles.selectorItem}>
          <Text className={styles.label}>楼栋</Text>
          <Picker
            mode='selector'
            range={buildingOptions.map(opt => opt.label)}
            value={buildingIndex >= 0 ? buildingIndex : 0}
            onChange={handleBuildingChange}
          >
            <View className={styles.pickerWrap}>
              <View className={styles.pickerDisplay}>
                <Text className={buildingIndex >= 0 ? styles.pickerValue : styles.pickerPlaceholder}>
                  {buildingIndex >= 0 ? buildingOptions[buildingIndex].label : '请选择楼栋'}
                </Text>
                <View className={classnames(styles.pickerArrow, buildingIndex >= 0 && styles.active)} />
              </View>
            </View>
          </Picker>
        </View>

        <View className={styles.selectorItem}>
          <Text className={styles.label}>楼层</Text>
          <Picker
            mode='selector'
            range={floorOptions.map(opt => opt.label)}
            value={floorIndex >= 0 ? floorIndex : 0}
            onChange={handleFloorChange}
            disabled={!value.building}
          >
            <View className={styles.pickerWrap}>
              <View className={styles.pickerDisplay} style={{ opacity: value.building ? 1 : 0.5 }}>
                <Text className={floorIndex >= 0 ? styles.pickerValue : styles.pickerPlaceholder}>
                  {floorIndex >= 0 ? floorOptions[floorIndex].label : '请选择楼层'}
                </Text>
                <View className={classnames(styles.pickerArrow, floorIndex >= 0 && styles.active)} />
              </View>
            </View>
          </Picker>
        </View>

        <View className={styles.selectorItem}>
          <Text className={styles.label}>构件区域</Text>
          <Picker
            mode='selector'
            range={areaOptions.map(opt => opt.label)}
            value={areaIndex >= 0 ? areaIndex : 0}
            onChange={handleAreaChange}
            disabled={!value.building || !value.floor}
          >
            <View className={styles.pickerWrap}>
              <View className={styles.pickerDisplay} style={{ opacity: value.building && value.floor ? 1 : 0.5 }}>
                <Text className={areaIndex >= 0 ? styles.pickerValue : styles.pickerPlaceholder}>
                  {areaIndex >= 0 ? areaOptions[areaIndex].label : '请选择区域'}
                </Text>
                <View className={classnames(styles.pickerArrow, areaIndex >= 0 && styles.active)} />
              </View>
            </View>
          </Picker>
        </View>
      </View>

      {isComplete && (
        <View className={styles.selectedLocation}>
          <Text className={styles.locationIcon}>📍</Text>
          <Text className={styles.locationText}>{getLocationText()}</Text>
        </View>
      )}
    </View>
  )
}

export default LocationSelector
