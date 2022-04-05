import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import GradeView from '@/views/GradeView.vue'

export const routes: Array<RouteRecordRaw&{icon:string}> = [
  {
    path: '/',
    icon: 'mdi-school',
    name: 'grade',
    component: GradeView,
  },
  {
    path: '/menu',
    icon: 'mdi-silverware-variant',
    name: 'menu',
    component: () => import('@/views/MenuView.vue'),
  },
  {
    path: '/settings',
    icon: 'mdi-cog',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
