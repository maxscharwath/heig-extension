<template>
  <v-app-bar :extended="showWeek" app dense>
    <v-app-bar-title>{{
        $vuetify.locale.getScope()
          .t('$vuetify.menu.menuOfDay')
      }}
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="showWeek=!showWeek">
      <v-icon>mdi-calendar-range</v-icon>
    </v-btn>
    <v-btn icon @click="fetchMenuAll">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
    <template v-if="showWeek" v-slot:extension>
      <v-tabs v-model="selectedDay" align-with-title center-active style="width: 100%">
        <v-tab>{{
            $vuetify.locale.getScope()
              .t('$vuetify.weeks.monday')
          }}
        </v-tab>
        <v-tab>{{
            $vuetify.locale.getScope()
              .t('$vuetify.weeks.tuesday')
          }}
        </v-tab>
        <v-tab>{{
            $vuetify.locale.getScope()
              .t('$vuetify.weeks.wednesday')
          }}
        </v-tab>
        <v-tab>{{
            $vuetify.locale.getScope()
              .t('$vuetify.weeks.thursday')
          }}
        </v-tab>
        <v-tab>{{
            $vuetify.locale.getScope()
              .t('$vuetify.weeks.friday')
          }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
  <v-progress-linear v-if="loading" indeterminate="true"/>
  <v-container v-if="menus" fluid>
    <SingleMenu v-for="(menu,index) in menus.menus" :key="index" :menu="menu" @rate="rateMenu"/>
  </v-container>
</template>

<script lang="ts" setup>
import objectHash from 'object-hash';
import {
  computed, onMounted, onUnmounted, ref,
} from 'vue';
import db from '@/core/database';
import { UserInfo } from '@/core/Gaps';
import SingleMenu from '@/components/SingleMenu.vue';
import { TopChefAPI } from '@/core/env';
import { useStorage } from '@/store/useStorage';

const info = useStorage<UserInfo>({
  id: 'info',
});
const showWeek = ref(false);

interface MenuBase {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
}

export interface Menu extends MenuBase {
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
});

const ratings = db.get('menu_ratings');

async function rateMenu(hash: string, rating: number) {
  const uuid = info.value?.id;
  if (!uuid) return;
  const data = { ratings: { [objectHash(uuid)]: rating } };
  ratings.get(hash).put(data);
  console.log(data);
}

function registerRating(menu: Menu):Menu {
  ratings.get(menu.hash)
    .get('ratings')
    .on(({ _, ...r }) => {
      const rates: number[] = Object.values(r);
      menu.rating = {
        value: rates.reduce((a, b) => a + b, 0) / rates.length,
        count: rates.length,
      };
      console.log(`Menu ${menu.hash} rated ${menu.rating.value} with ${menu.rating.count} votes`);
    }, true);
  return menu;
}

async function fetchWeekMenu() {
  const response = await fetch('https://top-chef-intra-api.blacktree.io/weeks/current', {
    headers: {
      'x-api-key': TopChefAPI,
    },
  });
  const data = (await response.json()) as MenuWeekResponse;
  menusWeek.value = data.days.map((day) => ({
    ...day,
    menus: day.menus.map((menu) => ({
      ...menu,
      hash: objectHash(menu),
      rating: {
        value: 0,
        count: 0,
      },
    })),
  }));
  menusWeek.value.forEach((day) => day.menus.forEach(registerRating));
}

async function fetchMenu() {
  const response = await fetch('https://apix.blacktree.io/top-chef/today');
  const data = (await response.json()) as MenuResponse;
  menusToday.value = {
    ...data,
    menus: data.menus.map((menu) => ({
      ...menu,
      hash: objectHash(menu),
      rating: {
        value: 0,
        count: 0,
      },
    })),
  };
  menusToday.value.menus.forEach(registerRating);
}

function fetchMenuAll() {
  loading.value = true;
  Promise.allSettled([fetchMenu(), fetchWeekMenu()])
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  fetchMenuAll();
});

onUnmounted(() => {
  info.unlink();
  ratings.off();
});
</script>
