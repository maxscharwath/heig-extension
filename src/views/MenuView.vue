<template>
  <v-container>
    <v-progress-linear indeterminate v-if="loading"/>
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
          <v-card-content>
            <v-rating
              empty-icon="mdi-heart-outline"
              full-icon="mdi-heart"
              half-icon="mdi-heart-half-full"
              half-increments
              hover
              length="5"
              density="comfortable"
              color="red"
            ></v-rating>
          </v-card-content>
        </v-card>
      </template>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

export interface Menu {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
}

export interface MenuResponse {
  day: string;
  menus: Menu[];
}
const menus = ref<MenuResponse>();
const loading = ref(false);
async function fetchMenu(): Promise<MenuResponse> {
  loading.value = true;
  const response = await fetch('https://apix.blacktree.io/top-chef/today').finally(() => {
    loading.value = false;
  });
  const data = (await response.json()) as MenuResponse;
  menus.value = data;
  return data;
}
fetchMenu();
</script>
