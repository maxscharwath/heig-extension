<template>
  <v-container fluid>
    <gaps-user-info class="mb-3" />
    <gaps-credentials class="mb-3" />
    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>{{
          $vuetify.locale.getScope()
            .t('$vuetify.settings.title')
        }}
        </v-list-subheader>
        <v-list-item prepend-icon="mdi-clock">
          <v-list-item-title>
            {{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.alarm.title')
            }}
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
            {{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.alarm.data', settings.checkResultsInterval)
            }}
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
            {{ storageSize }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item @dblclick="router.push('/debug')" prepend-icon="mdi-information">
          <v-list-item-title>Version</v-list-item-title>
          <v-list-item-subtitle>{{ getManifest().version }}</v-list-item-subtitle>
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
  computed, onMounted, onUnmounted, ref,
} from 'vue'
import browser from 'webextension-polyfill'
import { useRouter } from 'vue-router'
import { settings } from '@/store/store'
import GapsCredentials from '@/components/settings/GapsCredentials.vue'
import GapsUserInfo from '@/components/settings/GapsUserInfo.vue'

const router = useRouter();

const getManifest = () => browser.runtime.getManifest();

const storageSizeBytes = ref(0)

const storageSize = computed(() => {
  const size = storageSizeBytes.value
  if (size < 1024) {
    return `${size} bytes`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
})
const languages = [
  { text: 'English', value: 'en' },
  { text: 'Français', value: 'fr' },
];

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
