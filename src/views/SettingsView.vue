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
                    <v-list-item-title>Email</v-list-item-title>
                    <v-list-item-subtitle>{{ info.email }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Phone</v-list-item-title>
                    <v-list-item-subtitle>{{ info.phoneNumber }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Address</v-list-item-title>
                    <v-list-item-subtitle>{{ info.addressStreet }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ info.addressCity }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Birthday</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ new Date(info.birthday).toLocaleDateString() }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
        <v-card-title>
          GAPS Credentials
        </v-card-title>
        <v-card-content>
        <v-text-field
          v-model="settings.credential.username"
          label="Username"
          :rules="[v => !!v || 'Username is required']"
        />
        <v-text-field
          v-model="settings.credential.password"
          label="Password"
          type="password"
          :rules="[v => !!v || 'Password is required']"
        />
      </v-card-content>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="danger" @click="logout">Logout</v-btn>
        <v-btn color="primary" @click="save">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>

import getStorageRef from '@/store/Storage';
import { UserInfo } from '@/core/Gaps';
import { onUnmounted, ref } from 'vue';

const settings = ref({
  credential: {
    username: '',
    password: '',
  },
});

const info = getStorageRef<UserInfo>('info');
const years = getStorageRef<number[]>('years', []);

onUnmounted(() => {
  info.unlink();
  years.unlink();
});

async function save() {
  const { username, password } = settings.value.credential
  chrome.runtime.sendMessage({
    type: 'saveSettings',
    payload: {
      username,
      password,
    },
  })
}

async function logout() {
  chrome.runtime.sendMessage({
    type: 'clear',
  })
}
</script>
