<template>
  <v-app-bar v-if="!currentUser">
    <v-alert type="error">{{ $vuetify.locale.getScope().t('$vuetify.chat.alert.needToBeConnected') }}</v-alert>
  </v-app-bar>
  <v-container>
    <transition-group name="list" tag="div">
      <chat-message v-for="msg in store.messages" :msg="msg" :key="msg.uuid" class="mb-2" />
    </transition-group>
  </v-container>
  <v-app-bar location="bottom" class="pa-2">
    <v-form @submit.prevent="sendMessage" class="d-flex w-100 align-center">
      <v-text-field
        v-model="messageToSend"
        hide-details
        variant="outlined"
        autofocus="true"
        :placeholder="$vuetify.locale.getScope().t('$vuetify.chat.sendMessage')"
      />
      <v-btn type="submit" icon="mdi-send" class="ml-2" />
    </v-form>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { useChatStore } from '@/store/chat/chat'
import { currentUser } from '@/core/database'

const store = useChatStore();
const messageToSend = ref<string>('');
async function sendMessage() {
  await store.sendMessage(messageToSend.value);
  messageToSend.value = '';
}

</script>

<style scoped>
.list-enter, .list-leave-to {
  opacity: 0;
}
.list-enter-active, .list-leave-active {
  transition: opacity 0.5s ease;
}
.list-move {
  transition: transform 0.5s ease-out;
}
</style>
