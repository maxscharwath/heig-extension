<template>
  <v-card @click="raw = !raw">
    <pre v-highlightjs class="wrap" v-if="raw && store.raw">
      <code class="text">{{store.raw.value}}</code>
    </pre>
    <pre v-highlightjs v-else>
      <code class="json">{{JSON.stringify(store.value, null, 2)}}</code>
    </pre>
  </v-card>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue'
import { ChromeStorage } from '@/store/useStorage'

const raw = ref(false)
defineProps({
  store: {
    type: Object as PropType<ChromeStorage<never>>,
    required: true,
  },
});
</script>

<style scoped>
 pre{
   display: grid;
   font-size: 0.7rem;
 }
 .wrap{
   white-space: normal;
 }
 .wrap code{
   word-break: break-all;
 }
</style>
