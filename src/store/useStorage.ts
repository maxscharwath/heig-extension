import {
  ref, Ref, UnwrapRef, watch,
} from 'vue';
import deepcopy from 'deepcopy';
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill'
import objectHash from 'object-hash'

export type Nullable<T> = T | null;

type ChromeStorageAddons<T> = {
  error: Ref<Nullable<string>>;
  unlink: () => void;
  clear: () => void;
  onChange: (_cb: (_newValue: UnwrapRef<Nullable<T>>) => void) => void;
}
export type ChromeStorage<T> = Ref<UnwrapRef<T> | null> & ChromeStorageAddons<T>;

export interface ChromeStorageOptions<Id extends string, Value, U> {
  id: Id;
  defaultState?: Value | (() => Value);
  storageArea?: 'local' | 'sync' | 'managed';
  transformer?: {
    from: (_value: U) => UnwrapRef<Nullable<Value>>,
    to: (_value: UnwrapRef<Value>) => U,
  };
  onChange?: (_newValue: UnwrapRef<Nullable<Value>>) => void;
}

const uuid = nanoid();

export function useStorage<Value = unknown, U = unknown, Id extends string = string>(
  {
    id,
    defaultState,
    storageArea = 'local',
    transformer,
    onChange,
  }: ChromeStorageOptions<Id, Value, U>,
): ChromeStorage<Value> {
  console.log(`[${uuid}] useStorage: ${id}`);
  const loadDefaultState = () => (defaultState instanceof Function ? defaultState() : defaultState ?? null)
  const state = ref<Nullable<Value>>(loadDefaultState());
  let stateHash = objectHash(state.value as Value);
  const error = ref<Nullable<string>>(null);
  const events = new EventTarget();
  const unwatch = watch(state, async (currentState) => {
    const hash = objectHash(currentState as Value);
    if (hash === stateHash) { return }
    stateHash = hash
    onChange?.(currentState);
    events.dispatchEvent(new CustomEvent('change', { detail: currentState }));
    const data = currentState ? transformer?.to(currentState) ?? currentState : null;
    if (JSON.stringify(data) === JSON.stringify((await browser.storage[storageArea].get(id))[id]?.data)) {
      return;
    }
    console.log(`[${uuid}] Saving ${id} to ${storageArea}`);
    browser.storage[storageArea]
      .set({
        [id]: {
          data: deepcopy(data),
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

  const chromeListener = (changes: { [p: string]: browser.Storage.StorageChange }, area: string) => {
    if (!(area === storageArea && id in changes)) { return; }
    const { newValue } = changes[id];
    if (!newValue?.data) {
      state.value = loadDefaultState() as UnwrapRef<Value>;
      return;
    }

    if (newValue?.uuid === uuid) { return; }
    const tmpState = transformer?.from(newValue.data) ?? newValue.data;
    if (JSON.stringify(tmpState) === JSON.stringify(state.value)) { return; }
    console.log(`[${uuid}] Loading ${id} from ${storageArea}`);
    state.value = tmpState;
  };
  browser.storage.onChanged.addListener(chromeListener);

  // Initial data retrieval
  browser.storage[storageArea].get(id)
    .then((items) => {
      if (items[id]?.uuid !== uuid && items[id]?.data) {
        console.log(`[${uuid}] Loading ${id} from ${storageArea}`);
        state.value = transformer?.from(items[id].data) ?? items[id].data;
      }
    });
  return Object.assign<Ref<UnwrapRef<Value> | null>, ChromeStorageAddons<Value>>(state, {
    error,
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
