<!--
 * @Author: huwanfei
 * @Date: 2024-01-11 16:20:08
 * @LastEditTime: 2024-01-17 18:44:38
 * @LastEditors: huwanfei
 * @Description: 地图打点弹框
 * @FilePath: /tdmap-vue3/src/components/mapModal/index.vue
-->
<template>
  <a-modal
    :open="visible"
    centered
    width="100%"
    :bodyStyle="{ height: '800px', 'overflow-y': 'hidden', padding: '50px' }"
    title="地图选择"
    @ok="handleOk"
    @cancel="hideModal"
  >
    <a-row style="margin-bottom: 24px">
      <a-col :span="8"
        >经度: <a-input style="width: 80%" :value="lngLat[0]" placeholder="经度"></a-input
      ></a-col>
      <a-col :span="8"
        >纬度: <a-input style="width: 80%" :value="lngLat[1]" placeholder="纬度"></a-input
      ></a-col>
      <a-col :span="8"
        >地址: <a-input style="width: 80%" :value="address" placeholder="地址"></a-input
      ></a-col>
    </a-row>
    <TdMap
      ref="TdMapRef"
      :tk="tk"
      :lnglat="initLngLat"
      :markerLnglat="lngLat"
      @setPosition="setPosition"
      @setAddress="setAddress"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TdMap from './TdMap.vue'
import axios from 'axios'
import { message } from 'ant-design-vue'

const props = defineProps({
  // 天地图的key值
  tk: {
    type: String,
    default: 'c321e5292aa26e043a12fcc647cce6ee'
  }
})

const $emit = defineEmits(['setCoordinate'])

const TdMapRef = ref()

// 所在城市中心经纬度
const initLngLat = ref<number[]>([])

// marker点位
let lngLat = ref<number[]>([])

const address = ref<string>('')

const visible = ref<boolean>(false)

// 打开弹框
const showModal = async (markerLngLat: number[], cityName: string) => {
  visible.value = true

  // 默认城市经纬度
  const temp = [120.2042180866, 30.24775550791]
  if (cityName) {
    const { data: locationData } = await getLocation(cityName)

    initLngLat.value = locationData.length ? [locationData[0].lnt, locationData[0].lat] : temp
  } else {
    initLngLat.value = temp
  }

  // 回显点位
  if (markerLngLat.length) {
    const [lng, lat] = markerLngLat
    // 根据设置的回显
    lngLat.value = [+lng, +lat]
  }
}

// 通过城市名获取当前经纬度
const getLocation = async (cityName: string) => {
  const { data } = await axios({
    url: 'https://api.tianditu.gov.cn/administrative',
    method: 'get',
    contentType: 'application/json;charset=utf-8',
    params: {
      tk: props.tk,
      postStr: `{"searchWord": "${cityName}","searchType":"1","needSubInfo":"false","needAll":"false","needPolygon":"true","needPre":"true"}`
    }
  })
  return data
}

const handleOk = () => {
  if (lngLat.value.length) {
    $emit('setCoordinate', lngLat.value)
  } else {
    message.warning('鼠标点选或搜索选中地址后再进行确认')
  }
}

const hideModal = () => {
  visible.value = false
  TdMapRef.value.clearAll()

  lngLat.value = []
  address.value = ''
}

const setPosition = (lnglat: number[]) => {
  if (lnglat.length && lnglat.length === 2) {
    lngLat.value = lnglat
  } else {
    message.warning('未定位到经纬度坐标请手动输入')
  }
}

const setAddress = (text: string) => {
  if (text) {
    address.value = text
  } else {
    message.warning('未定位到详细地址请手动输入')
  }
}

defineExpose({
  showModal,
  hideModal
})
</script>

<style lang="less" scoped></style>
