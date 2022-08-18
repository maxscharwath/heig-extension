<template>
  <v-app-bar height="72">
      <v-tabs center-active centered stacked class="w-100">
        <v-tab v-for="route in filtredRoutes" :key="route.path" :to="route.path">
          <v-icon size="small">{{ route.icon }}</v-icon>
          {{
            $vuetify.locale.getScope()
              .t(route.i18n)
          }}
        </v-tab>
      </v-tabs>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { routes } from '@/router';
import { computed } from 'vue';

const filtredRoutes = computed(() => routes.filter((route) => !route.debug));

</script>
