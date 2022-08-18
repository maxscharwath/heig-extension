<template>
    <v-card density="compact" class="chat-card" color="transparent" :class="{mine:msg.isMine}">
        <v-card-text class="d-flex position-relative">
          <div class="w-100 d-flex flex-column justify-space-between">
            <div>
              <div class="chat-user">{{msg.author.name}}</div>
              <div class="chat-content">{{ msg.message }}</div>
            </div>
            <div class="chat-date">
              {{ msg.postedAt.toLocaleString() }}
            </div>
          </div>
            <div class="d-flex flex-column align-center justify-center ml-3">
              <v-btn icon="mdi-chevron-up" size="x-small" @click="msg.upVote" :active="msg.hasLiked.upVote"/>
              <span class="chat-like">{{msg.likes}}</span>
              <v-btn icon="mdi-chevron-down" size="x-small" @click="msg.downVote" :active="msg.hasLiked.downVote"/>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import { PropType, UnwrapRef } from 'vue'
import { ChatMessageData } from '@/store/chat/chat'

defineProps({
  msg: {
    type: Object as PropType<UnwrapRef<ChatMessageData>>,
    required: true,
  },
});

</script>

<style scoped>
.chat-card {
  backdrop-filter: blur(5px) brightness(0.5);
}

.chat-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: v-bind(msg.color);
  opacity: 0.2;
}
.chat-user {
  font-weight: bold;
  font-size: 0.8rem;
  color: v-bind(msg.color);
}
.chat-content {
  font-size: 0.95rem;
}
.chat-date {
  font-size: 0.6rem;
  color: #999;
  text-align: right;
}
.chat-like {
  font-weight: bold;
  padding: 0.2rem 0.5rem;
}
</style>
