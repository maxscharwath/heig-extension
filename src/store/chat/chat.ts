import { defineStore } from 'pinia'
import db, { currentUser, user } from '@/core/database'
import { GunDataNode } from 'gun'
import {
  computed, ComputedRef, reactive, ref,
} from 'vue'
import { Nullable } from '@/store/useStorage'
import { nanoid } from 'nanoid'

// because gun type definition is not complete...
type GunState = {
  (): number;
  is: (node: GunDataNode<any>, key: string) => number;
}
type Author = {
  alias: string;
  name: string;
}
type StoredChatMessage = {
  secret: string;
  uuid: string;
}
export type ChatMessageData = {
  uuid: string;
  message: string;
  author: Author;
  postedAt: Date;
  color: string;
  likes: ComputedRef<number>;
  score: ComputedRef<number>;
  hasLiked: ComputedRef<{
    upVote: boolean;
    downVote: boolean;
  }>;
  isMine: ComputedRef<boolean>;
  upVote: () => Promise<void>;
  downVote: () => Promise<void>;
};

/**
 * Get author of a node
 * @param node
 * @returns {Promise<Author>}
 */
async function getAuthor(node: GunDataNode<any>): Promise<Nullable<Author>> {
  const refAuthor = db.user(node);
  const alias = await refAuthor.get('alias').then();
  const name = await refAuthor.get('name').then();
  return alias && name ? { alias, name } : null;
}

/**
 * Get stored chat message
 * @param node
 * @returns {Promise<Nullable<ChatMessageData>>}
 */
async function useChatMessage(node: GunDataNode<StoredChatMessage>):Promise<Nullable<ChatMessageData>> {
  const data = {
    uuid: node.uuid,
    message: await Gun.SEA.decrypt(node.secret, '#foo'),
    author: await getAuthor(node),
    postedAt: new Date((Gun.state as GunState).is(node, 'secret')),
  }

  if ( // check if message is valid
    !data.uuid
    || !data.author
    || !data.message
    || !data.postedAt
  ) {
    return null;
  }

  const dbLikes = db.get('likes')
    .get(data.uuid);

  const rawLikes = ref<Record<string, number>>({});

  async function vote(value: 1 | -1 |null): Promise<void> {
    return dbLikes.put(
      user.get('likes').get(data.uuid).put({ like: value }),
    ).then();
  }

  const likes = computed(
    () => Object.values(rawLikes.value).reduce((a, b) => a + b, 0),
  );
  const score = computed(
    () => Math.round((Math.abs(likes.value) ** 1.5) * (2 * 360000) * Math.sign(likes.value) + data.postedAt.getTime()),
  );
  const color = `hsl(${
    data.author.alias?.split('').reduce((a, b) => (a + b.charCodeAt(0)) % 360, 0)
  }, 75%, 75%)`

  const hasLiked = computed(() => {
    const value = rawLikes.value[`${currentUser.value?.alias}`] ?? 0;
    return {
      upVote: value > 0,
      downVote: value < 0,
    }
  })

  dbLikes.on(async (n) => {
    const alias = await db.user(n).get('alias').then();
    if (!alias) return;
    if (!n || !n.like) {
      delete rawLikes.value[alias];
    } else {
      rawLikes.value[alias] = n.like;
    }
  });

  return {
    ...data,
    color,
    likes,
    score,
    hasLiked,
    isMine: computed(() => currentUser.value && data.author?.alias === currentUser.value?.alias),
    upVote: () => vote(hasLiked.value.upVote ? null : 1),
    downVote: () => vote(hasLiked.value.downVote ? null : -1),
  } as ChatMessageData
}

export const useChatStore = defineStore('chat', () => {
  const rawMessages = reactive<Record<string, ChatMessageData>>({})
  const refMessages = db.get('messages');
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  refMessages.get({
    '.': { '>': sevenDaysAgo.toISOString(), '-': 1 },
  }).map().on(async (data) => {
    if (!data) return;
    const message = await useChatMessage(data);
    if (message) {
      rawMessages[message.uuid] = message;
    }
  });

  async function sendMessage(text: string) {
    const secret = await Gun.SEA.encrypt(text, '#foo');
    const uuid = nanoid();
    const msg = user.get('messages').set({ secret, uuid } as StoredChatMessage);
    const index = `${new Date().toISOString()}}|${uuid}`;
    return refMessages.get(index).put(msg).then();
  }

  return {
    messages: computed(() => Object.values(rawMessages)
      .sort((a, b) => +a.score - +b.score)
      .reverse()),
    sendMessage,
  }
})
