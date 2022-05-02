<template>
  <v-container fluid>
    <v-card v-if="info" class="mb-3">
      <v-card-header class="d-flex justify-center flex-column">
          <v-avatar size="100">
            <v-img :src="info.pictureUrl" alt="profile" cover="true"/>
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
                  <v-list-item-content>
                    <v-list-item-title>{{$vuetify.locale.getScope().t('$vuetify.settings.email')}}</v-list-item-title>
                    <v-list-item-subtitle>{{ info.email }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{$vuetify.locale.getScope().t('$vuetify.settings.phone')}}</v-list-item-title>
                    <v-list-item-subtitle>{{ info.phoneNumber }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{$vuetify.locale.getScope().t('$vuetify.settings.address')}}</v-list-item-title>
                    <v-list-item-subtitle>{{ info.addressStreet }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ info.addressCity }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{$vuetify.locale.getScope().t('$vuetify.settings.birthday')}}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ new Date(info.birthday).toLocaleDateString() }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-btn color="error" @click="logout">{{$vuetify.locale.getScope().t('$vuetify.settings.logout')}}</v-btn>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
    <v-card v-else class="mb-3">
        <v-card-title>
          {{$vuetify.locale.getScope().t('$vuetify.settings.gapsCredentials')}}
        </v-card-title>
        <v-card-content>
        <v-text-field
          v-model="settings.credentials.username"
          :label="$vuetify.locale.getScope().t('$vuetify.settings.username')"
          :rules="[v => !!v || 'Username is required']"
        />
        <v-text-field
          v-model="settings.credentials.password"
          :label="$vuetify.locale.getScope().t('$vuetify.settings.password')"
          type="password"
          :rules="[v => !!v || 'Password is required']"
        />
      </v-card-content>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="logout">{{$vuetify.locale.getScope().t('$vuetify.settings.logout')}}</v-btn>
        <v-btn color="primary" @click="save">{{$vuetify.locale.getScope().t('$vuetify.settings.login')}}</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>Réglage</v-list-subheader>
        <v-list-item>
          <v-list-item-avatar start><v-icon>mdi-clock</v-icon></v-list-item-avatar>
          <v-list-item-header>
            <v-list-item-title>
              {{$vuetify.locale.getScope().t('$vuetify.settings.alarm.title')}}
            </v-list-item-title>
            <v-slider
            v-model="settings.checkResultsInterval"
            show-ticks="always"
            hide-details
            :min="5"
            :max="60"
            :step="5"
            />
            <v-list-item-subtitle>
              {{
                $vuetify.locale.getScope()
                  .t('$vuetify.settings.alarm.data', settings.checkResultsInterval)
              }}
            </v-list-item-subtitle>
          </v-list-item-header>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn color="primary" @click="save">{{$vuetify.locale.getScope().t('$vuetify.settings.save')}}</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mb-3">
      <v-list>
        <v-list-subheader>Informations</v-list-subheader>
        <v-list-item>
          <v-list-item-avatar><v-icon>mdi-information</v-icon></v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Version</v-list-item-title>
            <v-list-item-subtitle>{{getManifest().version}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list-item href="https://github.com/maxscharwath/heig-extension" link target="_blank">
        <v-list-item-avatar><v-icon>mdi-github</v-icon></v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>Source Code</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>

import getStorageRef from '@/store/Storage';
import { UserInfo } from '@/core/Gaps';
import { onUnmounted, ref } from 'vue'

const settings = ref({
  credentials: {
    username: '',
    password: '',
  },
  checkResultsInterval: 10,
});

const getManifest = () => chrome.runtime.getManifest();

const info = getStorageRef<UserInfo>('info');
const years = getStorageRef<number[]>('years', {
  defaultValue: [],
});

onUnmounted(() => {
  info.unlink();
  years.unlink();
});

async function save() {
  chrome.runtime.sendMessage({
    type: 'saveSettings',
    payload: settings.value,
  })
}

async function logout() {
  chrome.runtime.sendMessage({
    type: 'clear',
  })
}
</script>
