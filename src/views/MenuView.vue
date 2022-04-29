<template>
  <v-app-bar app dense>
    <v-app-bar-title>Menus du Jour</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="fetchMenu">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </v-app-bar>
  <v-progress-linear indeterminate="true" v-if="loading"/>
  <v-container fluid>
    <template v-if="menus">
      <template v-for="(menu,index) in menus.menus" :key="index">
        <v-card
          class="text-center mb-3"
          v-if="!!menu.starter || !!menu.dessert || !!menu.mainCourse.join()"
        >
          <v-card-header class="d-flex justify-center">
            <div>
              <div class="text-overline">{{menu.starter}}</div>
              <v-divider/>
              <div class="text-h6">{{menu.mainCourse[0]}}</div>
              <div class="text-overline">{{menu.mainCourse.slice(1).join('\n')}}</div>
              <v-divider/>
              <div class="text-overline">{{menu.dessert}}</div>
            </div>
          </v-card-header>
          <v-card-actions class="d-flex justify-center">
            {{menu.rating.count}}
            <v-rating
              v-model="menu.rating.value"
              @change="rateMenu(menu.hash,menu.rating.value)"
              empty-icon="mdi-heart-outline"
              full-icon="mdi-heart"
              half-icon="mdi-heart-half-full"
              half-increments
              hover
              length="5"
              density="comfortable"
              color="red"
            ></v-rating>
          </v-card-actions>
        </v-card>
      </template>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
import objectHash from 'object-hash'
import { onUnmounted, ref } from 'vue';
import db from '@/core/database'
import getStorageRef from '@/store/Storage';
import { UserInfo } from '@/core/Gaps';

const info = getStorageRef<UserInfo>('info');

onUnmounted(() => {
  info.unlink();
});

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

const menus = ref<MenuResponse>();
const loading = ref(false);

const ratings = db.get('menu_ratings');

async function rateMenu(hash:string, rating:number) {
  const uuid = info.value.id;
  if (!uuid) return;
  ratings.get(hash).put({ ratings: { [uuid]: rating } });
}

async function fetchMenu(): Promise<MenuResponse> {
  loading.value = true;
  const response = await fetch('https://apix.blacktree.io/top-chef/today').finally(() => {
    loading.value = false;
  });
  const data = (await response.json()) as MenuResponse;
  data.menus = data.menus.map((menu) => ({
    ...menu,
    hash: objectHash(menu),
    rating: {
      value: 0,
      count: 0,
    },
  }));
  menus.value = data;
  menus.value?.menus.forEach((menu) => {
    ratings.get(menu.hash).get('ratings').on(({ _, ...r }) => {
      const rates:number[] = Object.values(r);
      menu.rating = {
        value: rates.reduce((a, b) => a + b, 0) / rates.length,
        count: rates.length,
      };
    }, true)
  });
  return data;
}
fetchMenu();
</script>
