import { Observable } from 'rxjs';

import { MessageModel, MessagesFeedValue } from '../../persistence';
import { UnsubscribeFunc } from '../types';

export interface MessagesService {
  /**
   * Messages feed stream
   */
  feed$: Observable<MessagesFeedValue>;

  /**
   * Create message
   * @param model message model
   * @return Observable<MessageModel>
   */
  create(model: MessageModel): Observable<MessageModel>;

  /**
   * Subscribe to the messages related to the table by a given table id
   * @param tableId table id
   * @return UnsubscribeFunc
   */
  subscribe(tableId: string): UnsubscribeFunc;

  /**
   * Get messages related to the table by a given table id
   * @param tableId
   * @return  Observable<MessageModel[]>
   */
  getByTableId(tableId: string): Observable<MessageModel[]>;
}
