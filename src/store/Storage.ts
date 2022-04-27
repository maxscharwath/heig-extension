import {
  ref, Ref, toRaw, watch,
} from 'vue';

type StorageRef<T> = Ref<T> & {
  unlink: () => void;
}
export default function getStorageRef<T = any>(
  key: string,
  defaultValue?:T,
  transformer?: {
    from: (value: any) => T,
    to: (value: T) => any
  },
): StorageRef<T> {
  const reff = ref<T | undefined>(defaultValue) as unknown as StorageRef<T>;
  chrome.storage.local.get(key).then((data) => {
    let v = data[key];
    if (v === undefined) return;
    if (transformer) {
      v = transformer.from(v);
    }
    if (reff.value !== v) reff.value = v;
  });
  const listener = (changes:{ [p: string]: chrome.storage.StorageChange }) => {
    if (!changes[key]) return;
    let v = changes[key].newValue;
    if (transformer) {
      v = transformer.from(v);
    }
    if (reff.value !== v) reff.value = v;
  }
  chrome.storage.onChanged.addListener(listener);
  const watcher = watch(reff, (v, oldV) => {
    let rawV = toRaw(v);
    const rawOldV = toRaw(oldV);
    console.log('Watch', key, rawV, rawOldV);
    if (rawV === rawOldV) return;
    if (transformer) {
      rawV = transformer.to(rawV);
    }
    chrome.storage.local.set({ [key]: rawV });
  });
  reff.unlink = () => {
    chrome.storage.onChanged.removeListener(listener);
    watcher();
  }
  return reff;
}
