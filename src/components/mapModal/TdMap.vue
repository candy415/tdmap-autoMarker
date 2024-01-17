<!--
 * @Author: huwanfei
 * @Date: 2024-01-11 15:51:23
 * @LastEditTime: 2024-01-17 19:01:20
 * @LastEditors: huwanfei
 * @Description: 天地图打点组件
 * @FilePath: /tdmap-vue3/src/components/mapModal/TdMap.vue
-->
<template>
  <div class="tdmap-conatiner">
    <div id="mapDiv"></div>
    <div class="tdmap-search">
      <a-input
        v-model:value="searchText"
        placeholder="请输入关键词搜索"
        class="address-search"
        size="large"
        @input="searchWithName"
      />
      <div class="address-list" v-show="addressList && addressList.length">
        <div
          v-for="(item, index) in addressList"
          :key="index"
          @click="selectOneAddr(item.address + item.name)"
        >
          <div>{{ item.address }}</div>
          <div>{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import axios from 'axios'
import { message } from 'ant-design-vue'

const T = window.T

const props = defineProps({
  // 天地图的key值
  tk: {
    type: String,
    default: 'c321e5292aa26e043a12fcc647cce6ee'
  },
  // 地图渲染中心点位
  lnglat: {
    type: Array,
    default: () => [120.2042180866, 30.24775550791]
  },
  // 点位经纬度
  markerLnglat: {
    type: Array,
    default: () => []
  }
})

const $emit = defineEmits(['setAddress', 'setPosition'])

let map = ref() // 地图对象
let marker = ref() // 点位对象
let label = ref() // 点位标签对象
let lng = ref() // 点位经度
let lat = ref() // 点位纬度
let address = ref('') // 点位地址
const searchText = ref('') // 搜索框值
const addressList = ref<any[]>([]) // 搜索出来的数据列表

onMounted(() => {
  // 初始化地图
  initMap()
})

watch(
  () => props.lnglat,
  () => {
    nextTick(() => {
      initMap()
    })
  }
)

watch(searchText, (val) => {
  if (!val) {
    addressList.value = []
    // 用来清空删除太快时候出现列表的bug
    setTimeout(() => {
      addressList.value = []
    }, 500)
  }
})

// 初始化地图
const initMap = () => {
  const zoom = 15
  const [lng, lat] = props.lnglat
  
  map.value = new T.Map('mapDiv', {
    projection: 'EPSG:4326',
    center: new T.LngLat(lng, lat),
    zoom: zoom
  })

  // 鼠标点击---设置点位和标签
  const cp = new T.CoordinatePickup(map.value, {
    callback: (lnglat: any) => {
      setMapLabel(lnglat)
      setMapMarker(lnglat)
    }
  })
  cp.addEvent()

  // 点位回显
  if (props.markerLnglat.length) {
    const [lng, lat] = props.markerLnglat || []

    setMapLabel({ lng, lat })
    setMapMarker({ lng, lat })
  }
}

// 设置点位
const setMapMarker = (lnglat: any) => {

  // 获取经纬度失败
  const { lng: lng2, lat: lat2 } = lnglat || {}
  if (Number.isNaN(lng2) || Number.isNaN(lat2)) {
    return
  }

  if (marker.value) {
    map.value.removeOverLay(marker.value)
  }

  lng.value = +lng2
  lat.value = +lat2
  $emit('setPosition', [lng.value, lat.value])

  marker.value = new T.Marker(new T.LngLat(lng.value, lat.value))
  map.value.addOverLay(marker.value)
}

// 设置详细地址标注 （根据经纬度获取地址后设置标注）
const setMapLabel = async (lnglat: any) => {
  const { lng: lng2, lat: lat2 } = lnglat || {}
  if (Number.isNaN(lng2) || Number.isNaN(lat2)) {
    return
  }

  const res = await getDetailLocation(lnglat)
  address.value = res
  $emit('setAddress', address.value)

  if (label.value) {
    map.value.removeOverLay(label.value)
  }

  label.value = new T.Label({
    text: address.value,
    position: lnglat,
    offset: new T.Point(10, -20)
  })
  map.value.addOverLay(label.value)
}

// 通过经纬度获取详细地址
const getDetailLocation = async (lnglat: any) => {
  const { lng, lat } = lnglat || {}
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return
  }

  try {
    const res = await axios({
      url: 'https://api.tianditu.gov.cn/geocoder',
      method: 'get',
      contentType: 'application/json;charset=utf-8',
      params: {
        tk: props.tk,
        type: 'geocode',
        postStr: `{'lon':${lng},'lat':${lat},'ver':1}`
      }
    })

    return res.data.result.formatted_address
  } catch (error) {
    address.value = '获取位置失败'
  }
}

// 搜索 天地图LocalSearch
const searchWithName = debounce(() => {
  
  if (searchText.value) {
    const config = {
      pageCapacity: 10, // 每页显示的数量
      onSearchComplete: localSearchResult // 接收数据的回调函数
    }
    // 创建搜索对象
    const localsearch = new T.LocalSearch(map.value, config)
    localsearch.search(searchText.value, 7)
  }
}, 300)

const localSearchResult = (result: any) => {
  const { pois } = result
  if (pois && pois.length) {
    // 建议词提示，如果搜索类型为公交规划建议词或公交站搜索时，返回结果为公交信息的建议词。
    addressList.value = pois
  }
}

// 根据搜索的地名标记点和标注
const selectOneAddr = (addr: string) => {
  // 清空地图标志物
  map.value.clearOverLays()

  // 创建对象
  const geocoder = new T.Geocoder()
  geocoder.getPoint(addr, searchResult)

  function searchResult(result: {
    getStatus: () => number
    getLocationPoint: () => { (): any; new (): any; lng: any; lat: any }
  }) {
    if (result.getStatus() === 0) {
      map.value.panTo(result.getLocationPoint(), 16)
      
      // 创建标注对象
      marker.value = new T.Marker(result.getLocationPoint())
      // 向地图上添加标注
      label.value = new T.Label({
        text: addr,
        position: result.getLocationPoint(),
        offset: new T.Point(10, -20)
      })

      map.value.addOverLay(label.value)
      map.value.addOverLay(marker.value)

      address.value = addr
      $emit('setAddress', addr)

      lng.value = result.getLocationPoint().lng
      lat.value = result.getLocationPoint().lat

      $emit('setPosition', [lng.value, lat.value])
    } else {
      message.warning('定位出错请重新选择')
    }
  }
}

// 清空地图及搜索列表
const clearAll = () => {
  map.value && map.value.clearOverLays()

  searchText.value = ''
}

defineExpose({
  clearAll
})
</script>

<style lang="less" scoped>
.tdmap-conatiner {
  position: relative;
  width: 100%;
  .cur {
    cursor: pointer;
  }

  #mapDiv {
    height: 650px;
    width: 100%;
  }

  .tdmap-search {
    position: absolute;
    left: 20px;
    top: 20px;
    display: flex;
    flex-direction: column;
  }

  .address-search {
    width: 30vw;
    z-index: 10000;
    margin-bottom: 20px;
  }

  .address-list {
    display: flex;
    flex-direction: column;
    z-index: 10000;
    background-color: #fff;
    padding: 10px;
    min-width: 18vw;
    border: 1px solid #dcdfe6;

    > div {
      display: flex;
      align-items: center;
      height: 30px;
      cursor: pointer;
      color: #409eff;

      &:hover {
        background-color: #eee;
      }
    }
  }
}
</style>
