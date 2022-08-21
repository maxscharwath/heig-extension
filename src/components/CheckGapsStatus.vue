<template>
  <v-tooltip v-if="!isLoading">
    <template v-slot:activator="{ props }">
      <v-icon
        :icon="currentStatus.icon"
        size="small"
        :color="currentStatus.color"
        v-bind="props"
        @click="check(true)"
      />
    </template>
    {{
      $vuetify.locale.getScope()
        .t(currentStatus.text)
    }}
  </v-tooltip>
  <v-progress-circular
    :indeterminate="true"
    :size="24"
    class="ml-2"
    color="primary"
    v-else />
</template>

<script lang="ts" setup>
import {
  computed, onMounted, onUnmounted, ref,
} from 'vue'
import browser from 'webextension-polyfill'
import { settings } from '@/store/store'

const status = {
  connectedToken: {
    icon: 'mdi-cookie',
    color: 'green',
    text: '$vuetify.settings.gapsCredentials.status.connectedToken',
  },
  connectedCredentials: {
    icon: 'mdi-check-circle',
    color: 'green',
    text: '$vuetify.settings.gapsCredentials.status.connectedCredentials',
  },
  notConnected: {
    icon: 'mdi-alert-circle',
    color: 'red',
    text: '$vuetify.settings.gapsCredentials.status.notConnected',
  },
  unknown: {
    icon: 'mdi-help-circle',
    color: 'grey',
    text: '$vuetify.settings.gapsCredentials.status.unknown',
  },
}

const isLoading = ref(false);

const currentStatus = computed(() => {
  if (!settings.value) return status.unknown
  if (settings.value.checkCredentials.status.connected) {
    return settings.value.checkCredentials.status.credentials
      ? status.connectedCredentials
      : status.connectedToken;
  }
  return status.notConnected;
})

async function check(force = false) {
  if (!force
    && (new Date(settings.value?.checkCredentials.lastCheckAt ?? 0).getTime()) > Date.now() + 1000 * 60 * 5) return
  isLoading.value = true;
  await browser.runtime.sendMessage({
    type: 'checkConnexion',
  }).finally(() => isLoading.value = false);
}
const credentialsRef = settings.get('credentials');
onMounted(() => {
  credentialsRef.on(() => check());
});
onUnmounted(() => {
  credentialsRef.off();
});
</script>
