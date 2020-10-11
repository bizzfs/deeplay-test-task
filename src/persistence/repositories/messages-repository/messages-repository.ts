import { Observable } from 'rxjs';
import { MessageModel, MessagesFeedValue } from '../..';
import { Repository } from '../repository';

export interface MessagesRepository extends Repository<MessageModel> {
  /**
   * Messages feed stream
   */
  feed$: Observable<MessagesFeedValue>;

  /**
   * Get messages related to the table by a given table id
   * @param tableId
   * @return Observable<MessageModel[]
   */
  getByTableId(tableId: string): Observable<MessageModel[]>

  /**
   * Subscribe to the a messages feed by a given table id
   * @param tableId table id
   */
  subscribe(tableId: string): () => void;
}
