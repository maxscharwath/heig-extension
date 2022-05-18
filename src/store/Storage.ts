import {
  ref, Ref, toRaw, watch,
} from 'vue';
import StorageArea = chrome.storage.StorageArea;

type StorageRef<T> = Ref<T> & {
  unlink: () => void;
  onChange: (_cb: (_newValue: T) => void) => void;
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
  const events = new EventTarget();
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
    refIntern.value = v;
  }
  chrome.storage.onChanged.addListener(listener);
  const watcher = watch(refIntern, async (v) => {
    const rawV = toRaw(v);
    await storage.set({ [key]: transformer ? transformer.to(rawV) : rawV })
    events.dispatchEvent(new CustomEvent('change', { detail: rawV }));
  }, {
    deep: true,
  });
  refIntern.unlink = () => {
    chrome.storage.onChanged.removeListener(listener);
    watcher();
  }
  refIntern.onChange = (cb) => {
    const c = (evt:Event) => cb((<CustomEvent>evt).detail);
    events.addEventListener('change', c);
    return () => events.removeEventListener('change', c);
  }
  return refIntern;
}
