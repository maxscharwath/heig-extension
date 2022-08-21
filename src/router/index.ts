import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { computed, Ref } from 'vue'
import GradeView from '@/views/GradeView.vue';
import { settings } from '@/store/store'

export const routes: Array<RouteRecordRaw & { icon: string, i18n: string, enable:Ref<boolean>|boolean } > = [
  {
    path: '/',
    icon: 'mdi-school',
    name: 'grade',
    i18n: '$vuetify.routes.grade',
    component: GradeView,
    enable: true,
  },
  {
    path: '/menu',
    icon: 'mdi-silverware-variant',
    name: 'menu',
    i18n: '$vuetify.routes.menu',
    component: () => import('@/views/MenuView.vue'),
    enable: true,
  },
  {
    path: '/debug',
    icon: 'mdi-bug',
    name: 'debug',
    i18n: '$vuetify.routes.debug',
    component: () => import('@/views/DebugView.vue'),
    enable: false,
  },
  {
    path: '/chat',
    icon: 'mdi-chat',
    name: 'chat',
    i18n: '$vuetify.routes.chat',
    component: () => import('@/views/ChatView.vue'),
    enable: computed(() => settings.value?.enableFunctionality.enableChat ?? false),
  },
  {
    path: '/settings',
    icon: 'mdi-cog',
    name: 'settings',
    i18n: '$vuetify.routes.settings',
    component: () => import('@/views/SettingsView.vue'),
    enable: true,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
