/*
 * @Author: huwanfei
 * @Date: 2024-01-11 15:40:20
 * @LastEditTime: 2024-01-11 15:44:07
 * @LastEditors: huwanfei
 * @Description: 路由文件配置
 * @FilePath: /tdmap-vue3/src/router/index.ts
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
  ]
})

export default router
