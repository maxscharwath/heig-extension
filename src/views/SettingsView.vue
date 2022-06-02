<template>
  <v-container fluid>
    <v-card v-if="info" class="mb-3">
      <v-card-header class="d-flex justify-center flex-column">
        <v-avatar size="100">
          <v-img :cover="true" :src="info.pictureUrl" alt="profile"/>
        </v-avatar>
      </v-card-header>
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
    <v-card v-else class="mb-3">
      <v-card-title>
        {{
          $vuetify.locale.getScope()
            .t('$vuetify.settings.gapsCredentials')
        }}
      </v-card-title>
      <v-card-content>
        <v-text-field
          v-model.trim.lazy="settings.credentials.username"
          :label="$vuetify.locale.getScope().t('$vuetify.settings.username')"
          :rules="[v => !!v || 'Username is required']"
        />
        <v-text-field
          v-model.trim.lazy="settings.credentials.password"
          :label="$vuetify.locale.getScope().t('$vuetify.settings.password')"
          :rules="[v => !!v || 'Password is required']"
          type="password"
        />
      </v-card-content>
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
          <v-list-item-avatar start>
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
          <v-list-item-avatar start>
            <v-icon>mdi-translate</v-icon>
          </v-list-item-avatar>
          <v-list-item-header>
            <v-list-item-title>
              {{
                $vuetify.locale.getScope()
                  .t('$vuetify.settings.language.title')
              }}
            </v-list-item-title>
            <v-select v-model.lazy="settings.language" :items="languages"></v-select>
          </v-list-item-header>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>Informations</v-list-subheader>
        <v-list-item>
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

import { UserInfo } from '@/core/Gaps'
import { onUnmounted } from 'vue'
import settings from '@/store/Settings'
import { useStorage } from '@/store/useStorage'
import browser from 'webextension-polyfill'

const getManifest = () => browser.runtime.getManifest()

const languages = ['en', 'fr']

const info = useStorage<UserInfo>({ id: 'info' })
const years = useStorage<number[]>({
  id: 'years',
  defaultState: [],
})

onUnmounted(() => {
  info.unlink()
  years.unlink()
})

async function login() {
  await browser.runtime.sendMessage({
    type: 'login',
    payload: {
      username: settings.value?.credentials.username,
      password: settings.value?.credentials.password,
    },
  })
}

async function logout() {
  await browser.runtime.sendMessage({
    type: 'clear',
  })
}
</script>
