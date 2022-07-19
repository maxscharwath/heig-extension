import {
  ref, Ref, UnwrapRef, watch,
} from 'vue';
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill'
import objectHash from 'object-hash'
import CryptoJS from 'crypto-js'
import pako from 'pako'
import * as buffer from 'base64-arraybuffer'

export type Nullable<T> = T | null;
export type CanBePromise<T> = T | Promise<T>;

type ChromeStorageAddons<T> = {
  getId: () => string;
  raw: Ref<Nullable<string>>,
  error: Ref<Nullable<string>>;
  set: (value: UnwrapRef<Partial<T>> | UnwrapRef<T>) => void;
  unlink: () => void;
  clear: () => void;
  onChange: (_cb: (_newValue: UnwrapRef<Nullable<T>>) => void) => void;
}
export type ChromeStorage<T> = Ref<UnwrapRef<T> | null> & ChromeStorageAddons<T>;

type Transformer<T=any, U=any> = {
  read: (_value: U) => CanBePromise<T>,
  write: (_value: T) => CanBePromise<U>,
}

export interface ChromeStorageOptions<Id extends string, Value> {
  id: Id;
  defaultState?: Value | (() => Value);
  storageArea?: 'local' | 'sync' | 'managed';
  postTransformers?: Transformer<string> | Transformer<string>[];
  preTransformers?: Transformer<Value> | Transformer[];
  onChange?: (_newValue: UnwrapRef<Nullable<Value>>) => void;
  onLoad?: (_value: UnwrapRef<Nullable<Value>>) => void;
}

const uuid = nanoid();

export function useStorage<Value = unknown, Id extends string = string>(
  {
    id,
    defaultState,
    storageArea = 'local',
    postTransformers = [],
    preTransformers = [],
    onChange,
    onLoad,
  }: ChromeStorageOptions<Id, Value>,
): ChromeStorage<Value> {
  console.log(`[${uuid}] useStorage: ${id}`);
  const trans:Transformer[] = [
    preTransformers,
    {
      read: JSON.parse,
      write: JSON.stringify,
    },
    postTransformers,
    {
      read: (value:string) => pako.inflate(buffer.decode(value), { to: 'string' }),
      write: (value:string) => buffer.encode(pako.deflate(value)),
    },
  ].flat();
  const transformer: Transformer<UnwrapRef<Value>, string> = {
    write: (value) => trans.reduce(async (acc, { write }) => write(await acc), value as any),
    read: (value) => trans.reduceRight(async (acc, { read }) => read(await acc), value as any),
  }
  const loadDefaultState = () => (defaultState instanceof Function ? defaultState() : defaultState ?? null)
  const state = ref<Nullable<Value>>(loadDefaultState());
  let stateHash = objectHash(state.value as Value);
  const error = ref<Nullable<string>>(null);
  const raw = ref<Nullable<string>>(null);
  const events = new EventTarget();

  browser.storage[storageArea].get(id)
    .then(async (items) => {
      if (items[id]?.uuid !== uuid && items[id]?.data) {
        console.log(`[${uuid}] Loading ${id} from ${storageArea}`);
        raw.value = items[id].data;
        state.value = await transformer.read(items[id].data);
        onLoad?.(state.value);
        events.dispatchEvent(new CustomEvent('load', { detail: state.value }));
      }
    })

  const unwatch = watch(state, async (currentState) => {
    const hash = objectHash(currentState as Value);
    if (hash === stateHash) { return }
    stateHash = hash
    onChange?.(currentState);
    events.dispatchEvent(new CustomEvent('change', { detail: currentState }));
    const data = currentState ? await transformer.write(currentState) : null;
    raw.value = data;
    if (data === (await browser.storage[storageArea].get(id))[id]?.data) {
      return;
    }
    console.log(`[${uuid}] Saving ${id} to ${storageArea}`);
    browser.storage[storageArea]
      .set({
        [id]: {
          data,
          uuid,
          updateAt: new Date().toISOString(),
        },
      })
      .then(() => {
        error.value = null;
      })
      .catch((e) => {
        console.error(`[${uuid}] Failed to save ${id} to ${storageArea}`, e);
        error.value = browser.runtime.lastError?.message ?? '';
      });
  }, {
    deep: true,
  });

  const chromeListener = async (changes: { [p: string]: browser.Storage.StorageChange }, area: string) => {
    if (!(area === storageArea && id in changes)) { return; }
    const { newValue } = changes[id];
    if (!newValue?.data) {
      state.value = loadDefaultState() as UnwrapRef<Value>;
      return;
    }

    if (newValue?.uuid === uuid) { return; }
    raw.value = newValue.data;
    const tmpState = await transformer.read(newValue.data);
    if (objectHash(tmpState as any) === objectHash(state.value as any)) { return; }
    console.log(`[${uuid}] Loading ${id} from ${storageArea}`);
    state.value = tmpState;
  };
  browser.storage.onChanged.addListener(chromeListener);
  return Object.assign<Ref<UnwrapRef<Value> | null>, ChromeStorageAddons<Value>>(state, {
    error,
    raw,
    getId: () => id,
    set: (value) => {
      if (state.value instanceof Object && value instanceof Object) {
        state.value = { ...state.value, ...value };
      } else {
        state.value = value as UnwrapRef<Value>;
      }
    },
    unlink: () => {
      browser.storage.onChanged.removeListener(chromeListener);
      unwatch();
    },
    clear: () => {
      state.value = loadDefaultState() as UnwrapRef<Value>;
    },
    onChange: (cb) => {
      const c = (evt: Event) => cb((<CustomEvent>evt).detail);
      events.addEventListener('change', c);
      return () => events.removeEventListener('change', c);
    },
  });
}

export function useStorageEncrypted<Value = unknown, Id extends string = string>(
  options: ChromeStorageOptions<Id, Value> & {
    encryptionKey: string;
  },
): ChromeStorage<Value> {
  return useStorage<Value, Id>({
    ...options,
    postTransformers: [
      ...([options.postTransformers ?? [], {
        read: async (value:string) => CryptoJS.AES.decrypt(value, options.encryptionKey).toString(CryptoJS.enc.Utf8),
        write: async (value:string) => CryptoJS.AES.encrypt(value, options.encryptionKey).toString(),
      }].flat())],
  });
}
