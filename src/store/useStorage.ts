import {
  ref, Ref, UnwrapNestedRefs, UnwrapRef, watch,
} from 'vue';
import { nanoid } from 'nanoid';

export type Nullable<T> = T | null;

type ChromeStorageAddons<T> = {
  error: Ref<Nullable<string>>;
  unlink: () => void;
  onChange: (_cb: (_newValue: UnwrapNestedRefs<T>) => void) => void;
}
export type ChromeStorage<T> = Ref<UnwrapRef<T> | null> & ChromeStorageAddons<T>;

export interface ChromeStorageOptions<Id extends string, Value, U> {
  id: Id;
  defaultState?: Value;
  storageArea?: chrome.storage.AreaName;
  transformer?: {
    from: (_value: U) => UnwrapRef<Nullable<Value>>,
    to: (_value: UnwrapRef<Value>) => U,
  };
}

const uuid = nanoid();

export function useStorage<Value = unknown, U = unknown, Id extends string = string>(
  {
    id,
    defaultState,
    storageArea = 'local',
    transformer,
  }: ChromeStorageOptions<Id, Value, U>,
): ChromeStorage<Value> {
  const state = ref<Nullable<Value>>(defaultState ?? null);
  const error = ref<Nullable<string>>(null);
  const events = new EventTarget();
  const unwatch = watch(state, async (currentState) => {
    events.dispatchEvent(new CustomEvent('change', { detail: currentState }));
    const data = currentState ? transformer?.to(currentState) ?? currentState : null;
    if (JSON.stringify(data) === JSON.stringify((await chrome.storage[storageArea].get(id))[id]?.data)) {
      return;
    }
    chrome.storage[storageArea]
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
      .catch(() => {
        error.value = chrome.runtime.lastError?.message ?? '';
      });
  }, {
    deep: true,
  });

  const chromeListener = (changes: { [p: string]: chrome.storage.StorageChange }, area: string) => {
    if (!(area === storageArea && id in changes)) { return; }
    const { newValue } = changes[id];
    if (newValue?.uuid === uuid) { return; }
    const tmpState = transformer?.from(newValue.data) ?? newValue.data;
    if (JSON.stringify(tmpState) === JSON.stringify(state.value)) { return; }
    console.log('Loaded', uuid, newValue);
    state.value = tmpState;
  };
  chrome.storage.onChanged.addListener(chromeListener);

  // Initial data retrieval
  chrome.storage[storageArea].get(id, (items) => {
    if (items[id]?.uuid !== uuid && items[id]?.data) {
      console.log('Retrieved', items[id].data);
      state.value = transformer?.from(items[id].data) ?? items[id].data;
    }
  });
  return Object.assign<Ref<UnwrapRef<Value> | null>, ChromeStorageAddons<Value>>(state, {
    error,
    unlink: () => {
      chrome.storage.onChanged.removeListener(chromeListener);
      unwatch();
    },
    onChange: (cb) => {
      const c = (evt: Event) => cb((<CustomEvent>evt).detail);
      events.addEventListener('change', c);
      return () => events.removeEventListener('change', c);
    },
  });
}
