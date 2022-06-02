<template>
  <v-app class="app" theme="dark">
    <v-locale-provider :locale="settings.language">
      <NavBar/>
      <v-main>
        <router-view/>
      </v-main>
    </v-locale-provider>
  </v-app>
</template>

<script lang="ts" setup>
import settings from '@/store/Settings'
import NavBar from '@/components/NavBar.vue'</script>
