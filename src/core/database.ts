import GUN from 'gun';
import 'gun/lib/then';
import 'gun/sea';

import { GunHost } from '@/core/env';
import { ref } from 'vue'
import { Nullable } from '@/store/useStorage'
import { info, settings } from '@/store/store'
import objectHash from 'object-hash'

const db = GUN({
  peers: GunHost,
});
export default db;
export const user = db.user();

export const currentUser = ref<Nullable<{
  alias: string;
  name: string;
}>>();

user.get('alias').on(async () => {
  const alias = await user.get('alias').then();
  const name = await user.get('name').then();
  currentUser.value = { alias, name }
});

db.on('auth', async () => {
  const alias = await user.get('alias').then();
  const name = await user.get('name').then();
  currentUser.value = { alias, name }
});

settings.get('credentials').on(async (credentials) => {
  if (!credentials.username || !credentials.password) { return }
  const alias = objectHash(credentials.username);
  const signup = () => new Promise((resolve, reject) => {
    user.create(alias, credentials.password, (result) => ('err' in result ? reject(result.err) : resolve(result)))
  })
  const login = () => new Promise((resolve, reject) => {
    user.auth(alias, credentials.password, (result) => ('err' in result ? reject(result.err) : resolve(result)))
  });

  try {
    await login();
  } catch (error) {
    await signup();
    await login();
  }
  const name = `${info.get('firstName').value} ${info.get('lastName').value.slice(0, 1)}.`;
  user.get('name').put(name);
});
