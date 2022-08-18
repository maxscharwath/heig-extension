<template>
  <v-card @click="raw = !raw">
    <pre v-highlightjs v-bind="data.props">
      <code :class="data.class">{{data.code}}</code>
    </pre>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue'
import { ChromeStorage } from '@/store/useStorage'

const raw = ref(false)
const props = defineProps({
  store: {
    type: Object as PropType<ChromeStorage<never>>,
    required: true,
  },
});

const data = computed(() => ((raw.value && props.store.raw.value)
  ? {
    code: props.store.raw.value,
    class: 'text',
    props: {
      class: 'wrap',
    },
  }
  : {
    code: JSON.stringify(props.store.value, null, 2),
    class: 'json',
    props: {},
  }))
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
