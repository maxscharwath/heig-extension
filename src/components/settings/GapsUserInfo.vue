<template>
  <v-card v-if="info" class="mb-3">
    <v-card-title class="d-flex justify-center">
      <v-avatar size="100">
        <v-img :cover="true" :src="info.pictureUrl" alt="profile" />
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
                <v-list-item-title>{{
                  $vuetify.locale.getScope()
                    .t('$vuetify.settings.email')
                }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ info.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{
                  $vuetify.locale.getScope()
                    .t('$vuetify.settings.phone')
                }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ info.phoneNumber }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{
                  $vuetify.locale.getScope()
                    .t('$vuetify.settings.address')
                }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ info.addressStreet }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ info.addressCity }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  {{
                    $vuetify.locale.getScope()
                      .t('$vuetify.settings.birthday')
                  }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ new Date(info.birthday).toLocaleDateString() }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
<script lang="ts" setup>
import { info } from '@/store/store'
</script>
