import { ref, Ref } from 'vue';

type StorageRef<T> = Ref<T> & {
  unlink: () => void;
}
export default function getStorageRef<T = any>(
  key: string,
  defaultValue?:T,
  map?: (value: any|undefined) => T,
): StorageRef<T> {
  const reff = ref<T | undefined>(defaultValue) as unknown as StorageRef<T>;
  chrome.storage.local.get(key).then((data) => {
    let v = data[key];
    if (map) v = map(v);
    reff.value = v;
  });
  const listener = (changes:{ [p: string]: chrome.storage.StorageChange }) => {
    let v = changes[key]?.newValue;
    if (map) v = map(v);
    reff.value = v;
  }
  chrome.storage.onChanged.addListener(listener);
  reff.unlink = () => {
    chrome.storage.onChanged.removeListener(listener);
  }
  return reff;
}
