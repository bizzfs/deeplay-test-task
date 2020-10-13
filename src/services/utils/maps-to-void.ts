import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function mapsToVoid<T>(obs$: Observable<T>): Observable<void> {
  return obs$.pipe(map(() => {}));
}
