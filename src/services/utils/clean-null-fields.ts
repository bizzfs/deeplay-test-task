import { clone } from 'rambda';

export function cleanNullProps(obj: any): any {
  if (typeof obj !== 'object') return obj;

  const tmp = clone(obj);
  Object.keys(tmp).forEach(
    (k) =>
      (tmp[k] && typeof tmp[k] === 'object' && cleanNullProps(tmp[k])) ||
      (!tmp[k] && tmp[k] !== undefined && delete tmp[k])
  );
  return tmp;
}
