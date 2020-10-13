import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function withErrorHandling<T>(obs$: Observable<T>): Observable<T> {
  return obs$.pipe(
    catchError((err) => {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log(err);
      }
      return EMPTY;
    })
  );
}
