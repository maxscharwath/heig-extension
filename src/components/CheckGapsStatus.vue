<template>
  <v-tooltip>
    <template v-slot:activator="{ props }">
      <v-icon
        :icon="currentStatus.icon"
        size="small"
        :color="currentStatus.color"
        v-bind="props"
        @click="check"
      />
    </template>
    {{
      $vuetify.locale.getScope()
        .t(currentStatus.text)
    }}
  </v-tooltip>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
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
  pending: {
    icon: 'mdi-clock',
    color: 'orange',
    text: '$vuetify.settings.gapsCredentials.status.pending',
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
const currentStatus = ref(status.unknown);

async function check() {
  currentStatus.value = status.pending;
  const response = await browser.runtime.sendMessage({
    type: 'checkConnexion',
  });
  console.log(response);
  if (response.success) {
    currentStatus.value = response.data.credentials
      ? status.connectedCredentials
      : status.connectedToken;
  } else {
    currentStatus.value = status.notConnected;
  }
}
const credentials = settings.get('credentials');
onMounted(() => {
  check();
  credentials.on(() => {
    check();
  });
});
onUnmounted(() => {
  credentials.off();
});
</script>
