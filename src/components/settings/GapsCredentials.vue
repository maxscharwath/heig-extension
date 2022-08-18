<template>
  <v-card>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-card-title>
            {{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.gapsCredentials.title')
            }}
            <check-gaps-status />
          </v-card-title>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card-text>
            <v-alert :type="credentials.alert?.type" v-if="credentials.alert" class="my-3">
              {{
                $vuetify.locale.getScope()
                  .t(credentials.alert?.message)
              }}
            </v-alert>
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
            <v-spacer />
            <v-btn color="error" @click="logout" :disabled="loading">{{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.logout')
            }}
            </v-btn>
            <v-btn color="primary" @click="login" :loading="loading">{{
              $vuetify.locale.getScope()
                .t('$vuetify.settings.login')
            }}
            </v-btn>
          </v-card-actions>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script lang="ts" setup>
import browser from 'webextension-polyfill'
import { ref } from 'vue'
import CheckGapsStatus from '@/components/CheckGapsStatus.vue'
import { settings } from '@/store/store'

const credentials = ref<{
  alert: null |{
    type: 'error' | 'success' | 'warning' | 'info',
    message: string,
  },
  username: string,
  password: string,
}>({
  alert: null,
  username: settings.value?.credentials.username ?? '',
  password: '',
})

const loading = ref(false)

async function login() {
  if (loading.value) return
  loading.value = true
  try {
    const response = await browser.runtime.sendMessage({
      type: 'login',
      payload: credentials.value,
    });
    credentials.value.alert = response.success ? {
      type: 'success',
      message: '$vuetify.settings.gapsCredentials.alert.success',
    } : {
      type: 'error',
      message: '$vuetify.settings.gapsCredentials.alert.error',
    };
  } finally {
    loading.value = false
  }
}

async function logout() {
  await browser.runtime.sendMessage({
    type: 'clear',
  });
}
</script>
