<!--
 * @Author: huwanfei
 * @Date: 2024-01-11 15:40:20
 * @LastEditTime: 2024-01-17 16:27:10
 * @LastEditors: huwanfei
 * @Description:  
 * @FilePath: /tdmap-vue3/src/views/index.vue
-->
<template>
  <main>
    <div class="demo">
      <span>经纬度：</span>
      <a-input v-model:value="lnglatStr"></a-input>

      <a-button style="margin-left:10px" type="primary" @click="openModal">手动打点</a-button>
    </div>
    
    <mapModal ref="mapModalRef" @setCoordinate="setCoordinate" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import mapModal from '../components/mapModal/index.vue'

const lnglat = ref({})
const mapModalRef = ref()
let lnglatStr = ref('')

const cityName = ref('杭州市')

const openModal = () => {
  mapModalRef.value.showModal(lnglat.value, cityName.value)
}

const setCoordinate = (coordinate: any) => {
  const [lng, lat] = coordinate || []

  lnglat.value = coordinate

  lnglatStr.value = `${lng},${lat}`

  mapModalRef.value.hideModal()
}
</script>

<style lang="less" scoped>
.demo {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    width: 120px;
  }
}

</style>