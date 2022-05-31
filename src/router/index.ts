import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import GradeView from '@/views/GradeView.vue';

export const routes: Array<RouteRecordRaw & { icon: string, i18n: string }> = [
  {
    path: '/',
    icon: 'mdi-school',
    name: 'grade',
    i18n: '$vuetify.routes.grade',
    component: GradeView,
  },
  {
    path: '/menu',
    icon: 'mdi-silverware-variant',
    name: 'menu',
    i18n: '$vuetify.routes.menu',
    component: () => import('@/views/MenuView.vue'),
  },
  {
    path: '/settings',
    icon: 'mdi-cog',
    name: 'settings',
    i18n: '$vuetify.routes.settings',
    component: () => import('@/views/SettingsView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
