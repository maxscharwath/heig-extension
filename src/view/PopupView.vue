<template>
  <v-app theme="dark" style="min-height: 561px;min-width: 350px;">
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
      <v-container fluid>
        <router-view/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { routes } from '@/router'
</script>

<style>

</style>
