// eslint-disable-next-line import/prefer-default-export
export function fileSize(size: number): string {
  let s = size;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = 0;
  while (s >= 1024) {
    s /= 1024;
    i += 1;
  }
  return `${s.toFixed(1)} ${units[i]}`;
}
