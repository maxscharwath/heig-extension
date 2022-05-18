<template>
  <v-locale-provider :locale="settings.language">
  <v-app theme="dark" class="app">
    <v-app-bar>
        <v-tabs
          stacked
          grow
          style="width: 100%"
        >
          <v-tab v-for="route in routes" :key="route.path" :to="route.path">
            <v-icon>{{ route.icon }}</v-icon>
            {{ $vuetify.locale.getScope().t(route.i18n) }}
          </v-tab>
        </v-tabs>
    </v-app-bar>
    <v-main>
        <router-view/>
    </v-main>
  </v-app>
  </v-locale-provider>
</template>

<script lang="ts" setup>
import { routes } from '@/router'
import settings from '@/store/Settings'
</script>

<style scoped>
.app {
  min-height: 575px;
  min-width: 400px;
}
</style>
