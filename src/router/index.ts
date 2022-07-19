import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import GradeView from '@/views/GradeView.vue';

export const routes: Array<RouteRecordRaw & { icon: string, i18n: string, debug?:boolean } > = [
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
  {
    path: '/debug',
    icon: 'mdi-bug',
    name: 'debug',
    i18n: '$vuetify.routes.debug',
    debug: true,
    component: () => import('@/views/DebugView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
