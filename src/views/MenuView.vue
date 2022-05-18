<template>
  <v-app-bar app dense :extended="showWeek">
    <v-app-bar-title>{{$vuetify.locale.getScope().t('$vuetify.menu.menuOfDay')}}</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="showWeek=!showWeek">
      <v-icon>mdi-calendar-range</v-icon>
    </v-btn>
    <v-btn icon @click="fetchMenuAll">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
    <template v-slot:extension v-if="showWeek">
      <v-tabs center-active align-with-title style="width: 100%" v-model="selectedDay">
        <v-tab>{{$vuetify.locale.getScope().t('$vuetify.weeks.monday')}}</v-tab>
        <v-tab>{{$vuetify.locale.getScope().t('$vuetify.weeks.tuesday')}}</v-tab>
        <v-tab>{{$vuetify.locale.getScope().t('$vuetify.weeks.wednesday')}}</v-tab>
        <v-tab>{{$vuetify.locale.getScope().t('$vuetify.weeks.thursday')}}</v-tab>
        <v-tab>{{$vuetify.locale.getScope().t('$vuetify.weeks.friday')}}</v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
  <v-progress-linear indeterminate="true" v-if="loading"/>
  <v-container fluid v-if="menus">
    <SingleMenu :menu="menu" v-for="(menu,index) in menus.menus" :key="index" @rate="rateMenu"/>
  </v-container>
</template>

<script lang="ts" setup>
import objectHash from 'object-hash'
import {
  computed, onMounted, onUnmounted, ref,
} from 'vue';
import db from '@/core/database'
import getStorageRef from '@/store/Storage';
import { UserInfo } from '@/core/Gaps';
import SingleMenu from '@/components/SingleMenu.vue';
import { TopChefAPI } from '@/core/env';

const info = getStorageRef<UserInfo>('info');
const showWeek = ref(false);

export interface Menu {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
  hash: string;
  rating: {
    value: number;
    count: number;
  };
}

export interface MenuResponse {
  day: string;
  menus: Menu[];
}

interface MenuWeekResponse {
  _id: string;
  week: number;
  year: number;
  monday: string;
  friday: string;
  days: MenuResponse[];
  lastSave: string;
  lastPublish: string;
  lastNotify: string;
}

const menusToday = ref<MenuResponse>();
const menusWeek = ref<MenuResponse[]>([]);
const selectedDay = ref<number>(0);
const loading = ref(false);

const menus = computed(() => {
  if (showWeek.value && menusWeek.value[selectedDay.value]) {
    return menusWeek.value[selectedDay.value];
  }
  return menusToday.value;
})

const ratings = db.get('menu_ratings');

async function rateMenu(hash:string, rating:number) {
  const uuid = info.value.id;
  if (!uuid) return;
  ratings.get(hash).put({ ratings: { [uuid]: rating } });
}

async function fetchWeekMenu() {
  const response = await fetch('https://top-chef-intra-api.blacktree.io/weeks/current', {
    headers: {
      'x-api-key': TopChefAPI,
    },
  });
  const data = (await response.json()) as MenuWeekResponse;
  data.days.forEach((item) => {
    item.menus = item.menus.map((menu) => {
      const m = {
        ...menu,
        hash: objectHash(menu),
        rating: {
          value: 0,
          count: 0,
        },
      }
      ratings.get(m.hash).get('ratings').on(({ _, ...r }) => {
        const rates:number[] = Object.values(r);
        m.rating = {
          value: rates.reduce((a, b) => a + b, 0) / rates.length,
          count: rates.length,
        };
      }, true)
      return m;
    });
  });
  menusWeek.value = data.days;
}

async function fetchMenu(): Promise<MenuResponse> {
  const response = await fetch('https://apix.blacktree.io/top-chef/today');
  const data = (await response.json()) as MenuResponse;
  data.menus = data.menus.map((menu) => {
    const m = {
      ...menu,
      hash: objectHash(menu),
      rating: {
        value: 0,
        count: 0,
      },
    }
    ratings.get(m.hash).get('ratings').on(({ _, ...r }) => {
      const rates:number[] = Object.values(r);
      m.rating = {
        value: rates.reduce((a, b) => a + b, 0) / rates.length,
        count: rates.length,
      };
    }, true)
    return m;
  });
  menusToday.value = data;
  return data;
}

function fetchMenuAll() {
  loading.value = true;
  Promise.allSettled([fetchMenu(), fetchWeekMenu()]).finally(() => {
    loading.value = false;
  });
}
onMounted(() => {
  fetchMenuAll()
})

onUnmounted(() => {
  info.unlink();
});
</script>
