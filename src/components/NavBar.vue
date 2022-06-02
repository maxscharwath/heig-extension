<template>
  <v-app-bar>
    <v-tabs center-active centered class="w-100">
      <v-tab v-for="route in routes" :key="route.path" :to="route.path">
        <v-icon>{{ route.icon }}</v-icon>
        {{
          $vuetify.locale.getScope()
            .t(route.i18n)
        }}
      </v-tab>
    </v-tabs>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { routes } from '@/router'</script>
