<template>
  <v-app theme="dark" class="app">
    <v-app-bar>
        <v-tabs
          stacked
          grow
        >
          <v-tab v-for="route in routes" :key="route.path" :to="route.path">
            <v-icon>{{ route.icon }}</v-icon>
            {{route.name}}
          </v-tab>
        </v-tabs>
    </v-app-bar>
    <v-main>
        <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { routes } from '@/router'
</script>

<style scoped>
.app {
  height: 575px;
  width: 375px;
  overflow: auto;
}

</style>
