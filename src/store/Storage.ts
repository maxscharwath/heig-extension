import {
  ref, Ref, toRaw, watch,
} from 'vue';
import StorageArea = chrome.storage.StorageArea;

type StorageRef<T> = Ref<T> & {
  unlink: () => void;
}
export default function getStorageRef<T = unknown, U = unknown>(
  key: string,
  {
    defaultValue,
    transformer,
    storageArea,
  }: {
    storageArea?: StorageArea;
    defaultValue?: T;
    transformer?: {
      from: (_value: U) => T,
      to: (_value: T) => U
    };
  } = {},
): StorageRef<T> {
  const storage:StorageArea = storageArea ?? chrome.storage.local;
  const refIntern = ref<T | undefined>(defaultValue) as unknown as StorageRef<T>;
  storage.get(key).then((data) => {
    let v = data[key];
    if (v === undefined) return;
    if (transformer) {
      v = transformer.from(v);
    }
    if (refIntern.value !== v) refIntern.value = v;
  });
  const listener = (changes:{ [p: string]: chrome.storage.StorageChange }) => {
    if (!changes[key]) return;
    let v = changes[key].newValue;
    if (transformer) {
      v = transformer.from(v);
    }
    if (refIntern.value !== v) refIntern.value = v;
  }
  chrome.storage.onChanged.addListener(listener);
  const watcher = watch(refIntern, (v, oldV) => {
    const rawV = toRaw(v);
    const rawOldV = toRaw(oldV);
    console.log('Watch', key, rawV, rawOldV);
    if (rawV === rawOldV) return;
    storage.set({ [key]: transformer ? transformer.to(rawV) : rawV });
  });
  refIntern.unlink = () => {
    chrome.storage.onChanged.removeListener(listener);
    watcher();
  }
  return refIntern;
}
