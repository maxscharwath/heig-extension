<template>
  <v-app-bar :extended="showWeek" app>
    <v-app-bar-title>{{
      $vuetify.locale.getScope()
        .t('$vuetify.menu.menuOfDay')
    }}
    </v-app-bar-title>
    <v-spacer />
    <v-btn icon size="small" @click="showWeek = !showWeek">
      <v-icon>mdi-calendar-range</v-icon>
    </v-btn>
    <v-btn icon size="small" @click="fetchMenuAll">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
    <template v-if="showWeek" v-slot:extension>
      <v-card>
        <v-tabs v-model="selectedDay" center-active show-arrows>
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
      </v-card>
    </template>
  </v-app-bar>
  <v-app-bar height=5 rounded v-if="loading"><v-progress-linear :indeterminate="true" /></v-app-bar>
  <v-container fluid>
    <template v-if="menusComputed">
      <SingleMenu v-for="(menu, index) in menusComputed.menus" :key="index" :menu="menu" @rate="rateMenu" />
    </template>
    <template v-else>
      <v-card>
        <v-container>
          <div class="d-flex justify-center my-1">
            <v-img :src="require('/src/assets/burger.svg')" class="burger" max-width="50%" />
          </div>
          <h2 class="text-center">
            {{
              $vuetify.locale.getScope()
                .t('$vuetify.menu.noMenu')
            }}
          </h2>
        </v-container>
      </v-card>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
import objectHash from 'object-hash';
import {
  computed, onMounted, onUnmounted, ref,
} from 'vue';
import db from '@/core/database';
import SingleMenu from '@/components/SingleMenu.vue';
import { TopChefAPI } from '@/core/env';
import { info, menus } from '@/store/store'
import { Menu, MenuResponse, MenuWeekResponse } from '@/store/Menu'

const showWeek = ref(false);
const selectedDay = ref<number>(0);

const loading = ref(false);

const menusComputed = computed(() => {
  if (showWeek.value && menus.value.week[selectedDay.value]) {
    return menus.value.week[selectedDay.value];
  }
  return menus.value.today;
});

const ratings = db.get('menu_ratings');

async function rateMenu(hash: string, rating: number) {
  const uuid = info.value?.id;
  if (!uuid) return;
  const data = { ratings: { [objectHash(uuid)]: rating } };
  ratings.get(hash)
    .put(data);
}

function registerRating(menu: Menu): Menu {
  ratings.get(menu.hash)
    .get('ratings')
    .on(({ _, ...r }) => {
      const rates: number[] = Object.values(r);
      menu.rating = {
        value: rates.reduce((a, b) => a + b, 0) / rates.length,
        count: rates.length,
      };
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
  menus.value.week = data.days.map((day) => ({
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
}

async function fetchMenu() {
  const response = await fetch('https://apix.blacktree.io/top-chef/today');
  const data = (await response.json()) as MenuResponse;
  menus.value.today = {
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
}

function registryRatingAll() {
  menus.value.today?.menus.forEach(registerRating);
  menus.value.week.forEach((day) => day.menus.forEach(registerRating));
}

function fetchMenuAll() {
  loading.value = true;
  Promise.allSettled([fetchMenu(), fetchWeekMenu()])
    .finally(() => {
      registryRatingAll();
      menus.value.loadedAt = Date.now();
      loading.value = false;
    });
}

onMounted(async () => {
  if (Date.now() - menus.value.loadedAt >= 1000 * 60 * 5) {
    await fetchMenuAll()
  } else {
    registryRatingAll()
  }
});

onUnmounted(() => {
  ratings.off();
});
</script>

<style scoped>
.burger{
  animation-name: floating;
  animation-duration: 2.5s;
  animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes floating {
  0% { transform: translateY(7px); }
  100%   { transform: translateY(-7px); }
}
</style>
