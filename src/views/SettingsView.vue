<template>
  <v-container>
    <gaps-user-info class="mb-3" />
    <gaps-credentials class="mb-3" />
    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>
          {{ $vuetify.locale.getScope().t('$vuetify.settings.title') }}
        </v-list-subheader>
        <v-list-item prepend-icon="mdi-clock">
          <v-list-item-title>
            {{ $vuetify.locale.getScope().t('$vuetify.settings.alarm.title') }}
          </v-list-item-title>
          <v-slider
            v-model.lazy="settings.checkResultsInterval"
            :max="60"
            :min="5"
            :step="5"
            hide-details
            show-ticks="always"
          />
          <v-list-item-subtitle>
            {{ $vuetify.locale.getScope().t('$vuetify.settings.alarm.data', settings.checkResultsInterval) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-translate">
          <v-select
            class="my-1"
            variant="outlined"
            hide-details
            :label=" $vuetify.locale.getScope()
              .t('$vuetify.settings.language.title')"
            v-model="settings.language"
            :items="languages"
            item-title="text"
            item-value="value"
          />
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>
          {{$vuetify.locale.getScope().t('$vuetify.settings.enableFunctionality.title') }}
        </v-list-subheader>
        <v-list-item
          v-for="functionality in enableFunctionalities"
          :prepend-icon="functionality.icon"
          :key="functionality"
        >
          <v-list-item-title>
            {{ $vuetify.locale.getScope().t(functionality.i18n) }}
            <v-chip v-if="functionality.beta">BETA</v-chip>
          </v-list-item-title>
          <template v-slot:append>
            <v-switch inset hide-details v-model="functionality.value" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>Informations</v-list-subheader>
        <v-list-item @click="browser.runtime.reload()" prepend-icon="mdi-refresh">
          <v-list-item-title>
            {{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.reload')
            }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="clearCache" prepend-icon="mdi-delete">
          <v-list-item-title>
            {{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.clearCache.title')
            }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ fileSize(storageSizeBytes) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item @dblclick="router.push('/debug')" prepend-icon="mdi-information">
          <v-list-item-title>Version</v-list-item-title>
          <v-list-item-subtitle>{{ getManifest().version_name }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item
          href="https://github.com/maxscharwath/heig-extension"
          link
          target="_blank"
          rel="noopener noreferrer"
          prepend-icon="mdi-github"
        >
          <v-list-item-title>Source Code</v-list-item-title>
          <v-list-item-subtitle>
            github.com/maxscharwath/heig-extension
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>

import {
  onMounted, onUnmounted, ref,
} from 'vue'
import browser from 'webextension-polyfill'
import { useRouter } from 'vue-router'
import { settings } from '@/store/store'
import GapsCredentials from '@/components/settings/GapsCredentials.vue'
import GapsUserInfo from '@/components/settings/GapsUserInfo.vue'
import { fileSize } from '@/core/utils'

const router = useRouter();

const getManifest = () => browser.runtime.getManifest();

const storageSizeBytes = ref(0)

const languages = [
  { text: 'English', value: 'en' },
  { text: 'Français', value: 'fr' },
];
const enableFunctionalities = ref([
  {
    i18n: '$vuetify.settings.enableFunctionality.functionalities.enableChat',
    icon: 'mdi-chat',
    beta: true,
    value: settings.get('enableFunctionality').get('enableChat'),
  },
]);

async function clearCache() {
  await browser.storage.local.clear();
}

async function getStorageSize() {
  storageSizeBytes.value = Object.values(await browser.storage.local.get())
    .reduce((acc, val) => acc + (JSON.stringify(val)).length, 0)
}

onMounted(async () => {
  await getStorageSize();
  browser.storage.local.onChanged.addListener(getStorageSize);
});

onUnmounted(() => {
  browser.storage.local.onChanged.removeListener(getStorageSize);
});
</script>
