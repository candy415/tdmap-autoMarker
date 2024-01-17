/*
 * @Author: huwanfei
 * @Date: 2024-01-11 15:40:20
 * @LastEditTime: 2024-01-17 15:42:53
 * @LastEditors: huwanfei
 * @Description:  
 * @FilePath: /tdmap-vue3/src/main.ts
 */
import './assets/main.css'

import { createApp } from 'vue'
import { Button, Modal, Input, Row, Col } from 'ant-design-vue';
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(Button).use(Modal).use(Input).use(Row).use(Col)

app.mount('#app')
