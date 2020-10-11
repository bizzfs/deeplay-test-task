import { Observable } from 'rxjs';

export interface DbManager {
  init(): Observable<void>;
}
