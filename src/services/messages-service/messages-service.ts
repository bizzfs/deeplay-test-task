import { Observable } from 'rxjs';

import { MessageModel, MessagesFeedValue } from '../../persistence';
import { FeedSubscription } from '../types';

export interface MessagesService {
  /**
   * Messages feed stream
   */
  feed$: Observable<MessagesFeedValue>;

  /**
   * Create message
   * @param model message model
   * @return MessageModel
   */
  create(model: MessageModel): Observable<MessageModel>;

  /**
   * Subscribe to the messages related to the table by a given table id
   * @param tableId table id
   * @return FeedSubscription
   */
  subscribe(tableId: string): FeedSubscription;

  /**
   * Get messages related to the table by a given table id
   * @param tableId
   * @return Observable<MessageModel[]
   */
  getByTableId(tableId: string): Observable<MessageModel[]>;
}
