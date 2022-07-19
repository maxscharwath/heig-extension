<template>
  <v-container fluid>
    <v-card v-for="([name, store], index) in storesList" :key="index" class="mb-3">
      <v-card-title>
        {{ name }}
      </v-card-title>
      <v-card-text>
        <CodeBlock :store="store" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script lang="ts" setup>

import * as stores from '@/store/store'
import CodeBlock from '@/components/CodeBlock.vue'

const storesList = Object.entries(stores);

</script>
