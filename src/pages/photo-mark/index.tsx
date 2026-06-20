import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Image, Input, Textarea, Button, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { PhotoMark, Location, RectificationItem } from '@/types'
import { photoCategories, buildingOptions, floorOptions, areaOptions } from '@/data/inspectionItems'
import { generateId, getCurrentDateTime, getLocationText } from '@/utils'
import styles from './index.module.scss'

const PhotoMarkPage: React.FC = () => {
  const router = useRouter()
  const {
    addPhotoRecord,
    inspectionRecords,
    rectificationItems,
    currentLocation,
    getCurrentInspectionId,
    updateRectificationItem
  } = useInspection()

  const tempPath = router.params.tempPath || ''
  const fromInspectionId = router.params.inspectionId || ''
  const fromRectificationId = router.params.rectificationId || ''

  const [marks, setMarks] = useState<PhotoMark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('node')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<Location>({ building: '', floor: '', area: '' })
  const [isAddingMark, setIsAddingMark] = useState(false)
  const [currentMarkText, setCurrentMarkText] = useState('')
  const [linkInspectionId, setLinkInspectionId] = useState<string>('')
  const [linkRectificationId, setLinkRectificationId] = useState<string>('')

  useEffect(() => {
    if (currentLocation.building || currentLocation.floor || currentLocation.area) {
      setLocation({ ...currentLocation })
    }
    if (fromInspectionId) {
      setLinkInspectionId(fromInspectionId)
    } else if (getCurrentInspectionId()) {
      setLinkInspectionId(getCurrentInspectionId()!)
    }
    if (fromRectificationId) {
      setLinkRectificationId(fromRectificationId)
      const rect = rectificationItems.find(r => r.id === fromRectificationId)
      if (rect) {
        setLocation({ ...rect.location })
      }
    }
  }, [currentLocation, fromInspectionId, fromRectificationId, getCurrentInspectionId, rectificationItems])

  const linkedInspectionInfo = useMemo(() => {
    if (!linkInspectionId) return null
    const rec = inspectionRecords.find(r => r.id === linkInspectionId)
    return rec ? {
      id: rec.id,
      location: getLocationText(rec.location),
      time: rec.inspectTime
    } : null
  }, [linkInspectionId, inspectionRecords])

  const linkedRectInfo = useMemo(() => {
    if (!linkRectificationId) return null
    const rect = rectificationItems.find(r => r.id === linkRectificationId)
    return rect ? {
      id: rect.id,
      itemName: rect.itemName,
      location: getLocationText(rect.location)
    } : null
  }, [linkRectificationId, rectificationItems])

  const availableRectifications = useMemo(() => {
    if (!linkInspectionId) return rectificationItems.filter(r => r.status === 'pending' || r.status === 'processing')
    return rectificationItems.filter(r => r.inspectionId === linkInspectionId)
  }, [linkInspectionId, rectificationItems])

  const handleImageClick = useCallback((e: any) => {
    if (!isAddingMark) return

    const rect = e.currentTarget.getBoundingClientRect?.() || { width: 375, height: 500 }
    const detailX = e.detail?.x ?? (e.touches?.[0]?.clientX ?? 0)
    const detailY = e.detail?.y ?? (e.touches?.[0]?.clientY ?? 0)
    const x = Math.max(5, Math.min(95, (detailX / rect.width) * 100))
    const y = Math.max(5, Math.min(95, (detailY / rect.height) * 100))

    if (currentMarkText.trim()) {
      const newMark: PhotoMark = {
        id: generateId('mark-'),
        x,
        y,
        text: currentMarkText.trim()
      }
      setMarks(prev => [...prev, newMark])
      setCurrentMarkText('')
      setIsAddingMark(false)
      Taro.showToast({ title: '标注已添加', icon: 'success' })
    } else {
      Taro.showToast({ title: '请先输入标注内容', icon: 'none' })
    }
  }, [isAddingMark, currentMarkText])

  const handleDeleteMark = (markId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个标注吗？',
      success: (res) => {
        if (res.confirm) {
          setMarks(prev => prev.filter(m => m.id !== markId))
        }
      }
    })
  }

  const handleSave = () => {
    if (!location.building || !location.floor || !location.area) {
      Taro.showToast({ title: '请选择拍摄位置', icon: 'none' })
      return
    }

    if (!tempPath) {
      Taro.showToast({ title: '照片路径无效', icon: 'none' })
      return
    }

    const categoryInfo = photoCategories.find(c => c.value === selectedCategory)
    
    const photoRecord = {
      id: generateId('photo-'),
      inspectionId: linkInspectionId,
      rectificationId: linkRectificationId,
      url: tempPath,
      thumbnail: tempPath,
      category: selectedCategory as any,
      categoryName: categoryInfo?.label || '其他',
      marks,
      description,
      createTime: getCurrentDateTime(),
      location: { ...location }
    }

    addPhotoRecord(photoRecord)

    if (linkRectificationId) {
      const rectItem = rectificationItems.find(r => r.id === linkRectificationId)
      if (rectItem) {
        const updated: RectificationItem = {
          ...rectItem,
          photos: [...(rectItem.photos || []), photoRecord.id]
        }
        updateRectificationItem(updated)
      }
    }
    
    Taro.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  const buildingIndex = buildingOptions.findIndex(opt => opt.value === location.building)
  const floorIndex = floorOptions.findIndex(opt => opt.value === location.floor)
  const areaIndex = areaOptions.findIndex(opt => opt.value === location.area)

  const canSave = location.building && location.floor && location.area

  const rectificationOptions = availableRectifications.map(r => ({
    value: r.id,
    label: `${getLocationText(r.location)} - ${r.itemName}`
  }))

  const rectificationIndex = rectificationOptions.findIndex(opt => opt.value === linkRectificationId)

  return (
    <View className={styles.page}>
      <View className={styles.imageContainer}>
        <Image
          className={styles.image}
          src={tempPath}
          mode='widthFix'
        />
        {marks.map((mark, index) => (
          <View key={mark.id}>
            <View
              className={styles.markDot}
              style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
            />
            <View
              className={styles.markTooltip}
              style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
            >
              {index + 1}. {mark.text}
              <Text
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteMark(mark.id)
                }}
              >
                删除
              </Text>
            </View>
          </View>
        ))}
        {isAddingMark && (
          <Text className={styles.hint}>点击图片添加标注点</Text>
        )}
        {!tempPath && (
          <View className={styles.noPhoto}>
            <Text className={styles.noPhotoIcon}>📷</Text>
            <Text className={styles.noPhotoText}>暂无照片，请从拍照记录页进入</Text>
          </View>
        )}
      </View>

      <View className={styles.toolbar}>
        <Text className={styles.toolbarTitle}>照片信息</Text>

        <View className={styles.linkSection}>
          <Text className={styles.inputLabel}>关联信息</Text>
          {linkedInspectionInfo && (
            <View className={styles.linkedItem}>
              <Text className={styles.linkedIcon}>📋</Text>
              <View className={styles.linkedInfo}>
                <Text className={styles.linkedTitle}>已关联检查记录</Text>
                <Text className={styles.linkedSubtitle}>
                  {linkedInspectionInfo.location} · {linkedInspectionInfo.time}
                </Text>
              </View>
            </View>
          )}
          {linkedRectInfo && (
            <View className={styles.linkedItem}>
              <Text className={styles.linkedIcon}>⚠️</Text>
              <View className={styles.linkedInfo}>
                <Text className={styles.linkedTitle}>已关联整改项</Text>
                <Text className={styles.linkedSubtitle}>
                  {linkedRectInfo.itemName} · {linkedRectInfo.location}
                </Text>
              </View>
            </View>
          )}
          {!linkedInspectionInfo && !linkedRectInfo && (
            <View className={styles.linkedItemEmpty}>
              <Text className={styles.linkedHint}>💡 照片将根据位置自动关联检查记录和整改项</Text>
            </View>
          )}
        </View>

        {availableRectifications.length > 0 && !linkedRectInfo && (
          <View className={styles.inputSection}>
            <Text className={styles.inputLabel}>关联整改项（可选）</Text>
            <Picker
              mode='selector'
              range={['不关联', ...rectificationOptions.map(o => o.label)]}
              value={rectificationIndex >= 0 ? rectificationIndex + 1 : 0}
              onChange={(e) => {
                const pickIdx = parseInt(e.detail.value)
                if (pickIdx === 0) {
                  setLinkRectificationId('')
                } else {
                  setLinkRectificationId(rectificationOptions[pickIdx - 1].value)
                  const pickedRect = availableRectifications[pickIdx - 1]
                  if (pickedRect) {
                    setLocation({ ...pickedRect.location })
                  }
                }
              }}
            >
              <View className={styles.pickerField}>
                <Text className={rectificationIndex >= 0 ? styles.pickerText : styles.pickerPlaceholder}>
                  {rectificationIndex >= 0
                    ? rectificationOptions[rectificationIndex].label
                    : '选择整改项...'}
                </Text>
              </View>
            </Picker>
          </View>
        )}

        <View className={styles.locationSelector}>
          <Text className={styles.inputLabel}>拍摄位置</Text>
          <View className={styles.locationRow}>
            <Picker
              mode='selector'
              range={buildingOptions.map(opt => opt.label)}
              value={buildingIndex >= 0 ? buildingIndex : 0}
              onChange={(e) => {
                const index = parseInt(e.detail.value)
                setLocation(prev => ({ ...prev, building: buildingOptions[index].value }))
              }}
            >
              <View className={styles.locationPicker}>
                <Text className={buildingIndex >= 0 ? styles.locationPickerText : styles.locationPickerPlaceholder}>
                  {buildingIndex >= 0 ? buildingOptions[buildingIndex].label : '楼栋'}
                </Text>
              </View>
            </Picker>
            <Picker
              mode='selector'
              range={floorOptions.map(opt => opt.label)}
              value={floorIndex >= 0 ? floorIndex : 0}
              onChange={(e) => {
                const index = parseInt(e.detail.value)
                setLocation(prev => ({ ...prev, floor: floorOptions[index].value }))
              }}
              disabled={!location.building}
            >
              <View className={styles.locationPicker} style={{ opacity: location.building ? 1 : 0.5 }}>
                <Text className={floorIndex >= 0 ? styles.locationPickerText : styles.locationPickerPlaceholder}>
                  {floorIndex >= 0 ? floorOptions[floorIndex].label : '楼层'}
                </Text>
              </View>
            </Picker>
            <Picker
              mode='selector'
              range={areaOptions.map(opt => opt.label)}
              value={areaIndex >= 0 ? areaIndex : 0}
              onChange={(e) => {
                const index = parseInt(e.detail.value)
                setLocation(prev => ({ ...prev, area: areaOptions[index].value }))
              }}
              disabled={!location.building || !location.floor}
            >
              <View className={styles.locationPicker} style={{ opacity: location.building && location.floor ? 1 : 0.5 }}>
                <Text className={areaIndex >= 0 ? styles.locationPickerText : styles.locationPickerPlaceholder}>
                  {areaIndex >= 0 ? areaOptions[areaIndex].label : '区域'}
                </Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>问题分类</Text>
          <View className={styles.categoryOptions}>
            {photoCategories.map(cat => (
              <Button
                key={cat.value}
                className={classnames(
                  styles.categoryOption,
                  selectedCategory === cat.value && styles.active
                )}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </View>
        </View>

        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>添加标注</Text>
          <Input
            className={styles.input}
            placeholder='输入标注内容，然后点击图片'
            value={currentMarkText}
            onInput={(e) => setCurrentMarkText(e.detail.value)}
            maxlength={50}
          />
          <Button
            className={classnames(
              styles.btn,
              isAddingMark ? styles.btnSecondary : styles.btnPrimary
            )}
            style={{ marginTop: '16rpx', height: '64rpx' }}
            onClick={() => setIsAddingMark(!isAddingMark)}
          >
            {isAddingMark ? '取消标注' : '开始标注'}
          </Button>
        </View>

        {marks.length > 0 && (
          <View className={styles.marksList}>
            <Text className={styles.inputLabel}>已添加标注（{marks.length}处）</Text>
            {marks.map((mark, index) => (
              <View key={mark.id} className={styles.markListItem}>
                <Text className={styles.markListText}>{index + 1}. {mark.text}</Text>
                <Button
                  className={styles.deleteMarkBtn}
                  onClick={() => handleDeleteMark(mark.id)}
                >
                  删除
                </Button>
              </View>
            ))}
          </View>
        )}

        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>问题描述</Text>
          <Textarea
            className={styles.textarea}
            placeholder='详细描述发现的问题...'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={300}
          />
        </View>

        <View className={styles.btnRow}>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={handleCancel}
          >
            取消
          </Button>
          <Button
            className={classnames(
              styles.btn,
              styles.btnPrimary,
              !canSave && styles.btnDisabled
            )}
            onClick={handleSave}
          >
            保存
          </Button>
        </View>
      </View>
    </View>
  )
}

export default PhotoMarkPage
