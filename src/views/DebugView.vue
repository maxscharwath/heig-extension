<template>
  <v-container>
    <v-list lines="three">
      <v-list-item v-for="log in logs" :key="log">
        <template v-slot:prepend>
          <v-chip class="ma-1">{{ log.response.status.code}}</v-chip>
        </template>
        <v-list-item-title>{{log.request.url}}</v-list-item-title>
        <v-list-item-subtitle>
          <div>
            <v-chip class="ma-1">{{ log.request.method}}</v-chip>
            <v-chip class="ma-1">{{ log.response.duration }}ms</v-chip>
            <v-chip class="ma-1">{{ new Date(log.date).toLocaleString() }}</v-chip>
            <v-chip class="ma-1">{{ log.response.body.length }}</v-chip>
          </div>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
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
import { logs } from '@/store/store'

const storesList = Object.entries(stores);

</script>
