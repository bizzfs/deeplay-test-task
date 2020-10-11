import { Inject } from 'injection-js';
import { from, Observable, Subject } from 'rxjs';
import { r, RCursor } from 'rethinkdb-ts';

import { JSON_MAPPER_SERVICE_TOKEN } from '../../../injection-tokens';
import { JsonMapperService } from '../../../services';
import { MessageModel, MessagesFeedValue } from '../..';
import { MessagesRepository } from './messages-repository';
import { RepositoryImpl } from '../repository-impl';

export class MessagesRepositoryImpl extends RepositoryImpl<MessageModel> implements MessagesRepository {
  private readonly feedSubj$ = new Subject<MessagesFeedValue>();
  public readonly feed$ = this.feedSubj$.asObservable();

  constructor(@Inject(JSON_MAPPER_SERVICE_TOKEN) jsonMapperService: JsonMapperService) {
    super(jsonMapperService, MessageModel);
  }

  public subscribe(tableId: string): () => void {
    let cursor: RCursor;

    const unsubscribeFunc = () => {
      if (cursor) {
        cursor.close().catch(() => console.log(`error closing cursor`));
      }
    };

    r.table(this.table)
      .filter(r.row('table_id').eq(tableId))
      .changes()('new_val')
      .run()
      .then((cur: RCursor) => {
        cursor = cur;
        return cur.each((err, res) => this.feedSubj$.next(this.parseFeedValue(res, err)));
      });

    return unsubscribeFunc;
  }

  public getByTableId(tableId: string): Observable<MessageModel[]> {
    return from(r.table(this.table).filter(r.row('table_id').eq(tableId)).run());
  }

  private parseFeedValue<E extends Error>(value: any, err: E | undefined): MessagesFeedValue {
    let message: MessageModel | undefined;
    let error: Error | undefined;

    if (err) {
      error = new Error(err.message);
      return { message, error };
    }

    try {
      message = this.jsonMapperService.deserializeObject(value, this.modelClass);
    } catch (e) {
      error = e;
    }

    return { message, error };
  }
}
