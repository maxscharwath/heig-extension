<template>
  <v-container>
    <v-progress-linear indeterminate v-if="loading"/>
    <v-btn @click="fetchMenu">refresh menu</v-btn>
    <template v-if="menus">
      <template v-for="(menu,index) in menus.menus" :key="index">
        <v-card
          class="text-center mb-3"
          dark
          v-if="!!menu.starter || !!menu.dessert || !!menu.mainCourse.join()"
        >
          <v-card-header>
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
            <v-rating
              v-model="menu.rating"
              @change="rateMenu(menu.hash,menu.rating)"
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
import { ref } from 'vue'
import { db } from '@/core/database'

export interface Menu {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
  hash: string;
  rating: number;
}

export interface MenuResponse {
  day: string;
  menus: Menu[];
}

const menus = ref<MenuResponse>();
const loading = ref(false);

const ratings = db.get('menu_ratings');

async function rateMenu(hash:string, rating:number) {
  const d = await ratings.get(hash).then();
  const nbVotes = d?.nbVotes ?? 0;
  const currentRating = d?.rating ?? 0;
  ratings.get(hash).put({
    nbVotes: nbVotes + 1,
    rating: (currentRating * nbVotes + rating) / (nbVotes + 1),
  });
}
ratings.map().on((data, key) => {
  console.log(key, data);
  const menu = menus.value?.menus.find((m) => m.hash === key);
  if (menu) {
    menu.rating = data.rating;
  }
})

async function fetchMenu(): Promise<MenuResponse> {
  loading.value = true;
  const response = await fetch('https://apix.blacktree.io/top-chef/today').finally(() => {
    loading.value = false;
  });
  const data = (await response.json()) as MenuResponse;
  data.menus = data.menus.map((menu) => ({
    ...menu,
    hash: objectHash(menu),
    rating: 0,
  }));
  menus.value = data;
  // eslint-disable-next-line no-restricted-syntax
  for (const menu of menus.value.menus) {
    ratings.get(menu.hash).then().then(({ rating }) => {
      menu.rating = rating ?? 0;
    });
  }
  return data;
}
fetchMenu();
</script>
