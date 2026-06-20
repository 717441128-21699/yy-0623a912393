import React, { useState, useCallback } from 'react'
import { View, Text, Image, Input, Textarea, Button, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useInspection } from '@/store/InspectionContext'
import { PhotoMark, Location } from '@/types'
import { photoCategories, buildingOptions, floorOptions, areaOptions } from '@/data/inspectionItems'
import { generateId, getCurrentDateTime } from '@/utils'
import styles from './index.module.scss'

const PhotoMarkPage: React.FC = () => {
  const router = useRouter()
  const { addPhotoRecord } = useInspection()

  const tempPath = router.params.tempPath || 'https://picsum.photos/id/119/800/600'

  const [marks, setMarks] = useState<PhotoMark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('node')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<Location>({ building: '', floor: '', area: '' })
  const [isAddingMark, setIsAddingMark] = useState(false)
  const [currentMarkText, setCurrentMarkText] = useState('')

  const handleImageClick = useCallback((e: any) => {
    if (!isAddingMark) return

    const rect = e.currentTarget.getBoundingClientRect?.() || { width: 375, height: 500 }
    const x = (e.detail.x / rect.width) * 100
    const y = (e.detail.y / rect.height) * 100

    if (currentMarkText.trim()) {
      const newMark: PhotoMark = {
        id: generateId('mark-'),
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
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

    const categoryInfo = photoCategories.find(c => c.value === selectedCategory)
    
    const photoRecord = {
      id: generateId('photo-'),
      inspectionId: '',
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

  return (
    <View className={styles.page}>
      <View className={styles.imageContainer} onClick={handleImageClick}>
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
      </View>

      <View className={styles.toolbar}>
        <Text className={styles.toolbarTitle}>照片信息</Text>

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
