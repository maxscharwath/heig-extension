import {
  computed,
  ref, Ref, UnwrapRef, watch, WatchStopHandle, WritableComputedRef,
} from 'vue'
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill'
import objectHash from 'object-hash'
import CryptoJS from 'crypto-js'
import pako from 'pako'
import * as buffer from 'base64-arraybuffer'
import merge from 'merge'

export type Nullable<T> = T | null;
export type CanBePromise<T> = T | Promise<T>;
export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]>; };

// TODO: seams to be a bug in the chained api.

type NodeStorageAddons<T> = {
  // eslint-disable-next-line no-use-before-define
  get: <K extends keyof T>(key:K) => NodeStorage<T[K]>;
  set: (value: UnwrapRef<RecursivePartial<T>> | UnwrapRef<T>) => T;
  on(callback:(value:T)=> void): () => void;
  off(): void;
}
export type NodeStorage<T> = Ref<T> & NodeStorageAddons<T>;

type ChromeStorageAddons<T> = {
  getId: () => string;
  raw: Ref<Nullable<string>>,
  error: Ref<Nullable<string>>;
  set: (value: UnwrapRef<RecursivePartial<T>> | UnwrapRef<T>) => T;
  get: <K extends keyof T>(key: K) => NodeStorage<T[K]>;
  unlink: () => void;
  clear: () => void;
  onChange: (_cb: (_newValue: UnwrapRef<T>) => void) => void;
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

function getNode<T extends Record<string, any>, K extends keyof T>(object: T, key:K): NodeStorage<T[K]> {
  const subscribers = new Set<WatchStopHandle>();
  return Object.assign<WritableComputedRef<T[K]>, NodeStorageAddons<T[K]>>(computed({
    get() {
      return object[key];
    },
    set(value) {
      object[key] = Object.isExtensible(value) ? merge.recursive(false, object[key], value) : value;
    },
  }), {
    get: <U extends keyof T[K]>(subKey: U) => getNode(object[key], subKey),
    set: (value) => object[key] = merge.recursive(false, object[key], value),
    on(callback:(value:T[K])=> void) {
      let hash:string;
      // TODO bug: watch didnt work with when parent node is changed
      const unsubscribe = watch(object, ({ [key]: value }) => {
        const newHash = objectHash(value);
        if (hash !== newHash) {
          hash = newHash;
          callback(value);
        }
      }, { deep: true, immediate: true });
      subscribers.add(unsubscribe);
      return () => {
        subscribers.delete(unsubscribe);
        unsubscribe();
      }
    },
    off() {
      subscribers.forEach((stop) => stop());
      subscribers.clear();
    },
  });
}

/**
 * Store data in chrome storage. The data is stored as compressed string.
 * @param options ChromeStorageOptions
 * - id: the id of the storage
 * - defaultState: the default state of the storage, can be a function or a value
 * - storageArea: the storage area, default is 'local'
 * - onChange: callback when the storage is changed
 * - onLoad: callback when the storage is loaded
 * @returns ChromeStorage
 */
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
    read: (value) => trans.reduceRight(async (acc, { read }) => read(await acc), value as any),
    write: (value) => trans.reduce(async (acc, { write }) => write(await acc), value as any),
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
    state.value = tmpState;
  };
  browser.storage.onChanged.addListener(chromeListener);
  return Object.assign<Ref<UnwrapRef<Value> | null>, ChromeStorageAddons<Value>>(state, {
    error,
    raw,
    getId: () => id,
    set: (value) => state.value = Object.isExtensible(value) ? merge.recursive(false, state.value, value) : value,
    get: (key) => getNode(state.value as Value, key),
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
