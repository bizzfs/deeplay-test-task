import { r } from 'rethinkdb-ts';
import { Inject } from 'injection-js';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DbManager } from './db-manager';
import { Env } from '../../env';
import { ENV_TOKEN } from '../../injection-tokens';

export class DbManagerImpl implements DbManager {
  constructor(@Inject(ENV_TOKEN) private readonly env: Env) {}

  public init(): Observable<void> {
    return from(r.connectPool(this.env.db)).pipe(map(() => {}));
  }
}
