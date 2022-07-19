<template>
  <v-container fluid>
    <v-card v-if="info" class="mb-3">
      <v-card-title class="d-flex justify-center">
        <v-avatar size="100">
          <v-img :cover="true" :src="info.pictureUrl" alt="profile"/>
        </v-avatar>
      </v-card-title>
      <v-card-text>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-card-title>{{ info.firstName }} {{ info.lastName }}</v-card-title>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list>
                <v-list-item>
                  <v-list-item-header>
                    <v-list-item-title>{{
                        $vuetify.locale.getScope()
                          .t('$vuetify.settings.email')
                      }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ info.email }}</v-list-item-subtitle>
                  </v-list-item-header>
                </v-list-item>
                <v-list-item>
                  <v-list-item-header>
                    <v-list-item-title>{{
                        $vuetify.locale.getScope()
                          .t('$vuetify.settings.phone')
                      }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ info.phoneNumber }}</v-list-item-subtitle>
                  </v-list-item-header>
                </v-list-item>
                <v-list-item>
                  <v-list-item-header>
                    <v-list-item-title>{{
                        $vuetify.locale.getScope()
                          .t('$vuetify.settings.address')
                      }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ info.addressStreet }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ info.addressCity }}</v-list-item-subtitle>
                  </v-list-item-header>
                </v-list-item>
                <v-list-item>
                  <v-list-item-header>
                    <v-list-item-title>
                      {{
                        $vuetify.locale.getScope()
                          .t('$vuetify.settings.birthday')
                      }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ new Date(info.birthday).toLocaleDateString() }}
                    </v-list-item-subtitle>
                  </v-list-item-header>
                </v-list-item>
                <v-list-item>
                  <v-btn color="error" @click="logout">{{
                      $vuetify.locale.getScope()
                        .t('$vuetify.settings.logout')
                    }}
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
      <v-card-title>
        {{
          $vuetify.locale.getScope()
            .t('$vuetify.settings.gapsCredentials')
        }}
      </v-card-title>
      <v-card-text>
        <v-alert :type="credentials.alert?.type" v-if="credentials.alert" class="my-3">{{credentials.alert?.message}}</v-alert>
        <v-text-field
          variant="outlined"
          v-model.trim.lazy="credentials.username"
          :label="$vuetify.locale.getScope().t('$vuetify.settings.username')"
          :rules="[v => !!v || 'Username is required']"
        />
        <v-text-field
          variant="outlined"
          v-model.trim.lazy="credentials.password"
          :label="$vuetify.locale.getScope().t('$vuetify.settings.password')"
          :rules="[v => !!v || 'Password is required']"
          type="password"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="logout">{{
            $vuetify.locale.getScope()
              .t('$vuetify.settings.logout')
          }}
        </v-btn>
        <v-btn color="primary" @click="login">{{
            $vuetify.locale.getScope()
              .t('$vuetify.settings.login')
          }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>{{
            $vuetify.locale.getScope()
              .t('$vuetify.settings.title')
          }}
        </v-list-subheader>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-clock</v-icon>
          </v-list-item-avatar>
          <v-list-item-header>
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
          </v-list-item-header>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-translate</v-icon>
          </v-list-item-avatar>
          <v-list-item-header>
            <v-select
              variant="outlined"
              hide-details
              :label=" $vuetify.locale.getScope()
                  .t('$vuetify.settings.language.title')"
              v-model="settings.language"
              :items="languages"
              item-title="text"
              item-value="value"
            >
            </v-select>
          </v-list-item-header>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>Informations</v-list-subheader>
        <v-list-item @click="browser.runtime.reload()">
          <v-list-item-avatar>
            <v-icon>mdi-refresh</v-icon>
          </v-list-item-avatar>
          <v-list-item-header>
            <v-list-item-title>
              {{
                $vuetify.locale.getScope()
                  .t('$vuetify.settings.reload')
              }}
            </v-list-item-title>
          </v-list-item-header>
        </v-list-item>
        <v-list-item @click="clearCache">
          <v-list-item-avatar>
            <v-icon>mdi-delete</v-icon>
          </v-list-item-avatar>
          <v-list-item-header>
            <v-list-item-title>
              {{
                $vuetify.locale.getScope()
                  .t('$vuetify.settings.clearCache.title')
              }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ storageSize }}
            </v-list-item-subtitle>
          </v-list-item-header>
        </v-list-item>
        <v-list-item @dblclick="router.push('/debug')">
          <v-list-item-avatar>
            <v-icon>mdi-information</v-icon>
          </v-list-item-avatar>
          <v-list-item-header>
            <v-list-item-title>Version</v-list-item-title>
            <v-list-item-subtitle>{{ getManifest().version }}</v-list-item-subtitle>
          </v-list-item-header>
        </v-list-item>
      </v-list>
      <v-list-item href="https://github.com/maxscharwath/heig-extension" link target="_blank">
        <v-list-item-avatar>
          <v-icon>mdi-github</v-icon>
        </v-list-item-avatar>
        <v-list-item-header>
          <v-list-item-title>Source Code</v-list-item-title>
        </v-list-item-header>
      </v-list-item>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>

import {
  computed, onMounted, onUnmounted, ref,
} from 'vue'
import browser from 'webextension-polyfill';
import { settings, info } from '@/store/store'
import { useRouter } from 'vue-router'

const router = useRouter();

const credentials = ref<{
  alert: null |{
    type: 'error' | 'success' | 'warning' | 'info',
    message: string,
  },
  username: string,
  password: string,
}>({
  alert: null,
  username: '',
  password: '',
})

const getManifest = () => browser.runtime.getManifest();

const storageSizeBytes = ref(0)

const storageSize = computed(() => {
  const size = storageSizeBytes.value
  if (size < 1024) {
    return `${size} bytes`
  } if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
})
const languages = [
  { text: 'English', value: 'en' },
  { text: 'Français', value: 'fr' },
];

async function login() {
  const response = await browser.runtime.sendMessage({
    type: 'login',
    payload: credentials.value,
  });
  credentials.value.alert = response.success ? {
    type: 'success',
    message: 'Login successful',
  } : {
    type: 'error',
    message: 'Login failed',
  };
}

async function logout() {
  await browser.runtime.sendMessage({
    type: 'clear',
  });
}

async function clearCache() {
  await browser.storage.local.clear();
}

async function getStorageSize() {
  storageSizeBytes.value = JSON.stringify(await browser.storage.local.get()).length;
}

onMounted(async () => {
  await getStorageSize();
  browser.storage.local.onChanged.addListener(getStorageSize);
});

onUnmounted(() => {
  browser.storage.local.onChanged.removeListener(getStorageSize);
});
</script>
