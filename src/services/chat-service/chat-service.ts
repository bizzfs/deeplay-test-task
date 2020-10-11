import { Observable } from 'rxjs';
import { MessagesFeedValue, TableModel } from '../../persistence';
import { FeedSubscription } from '../types';

export interface ChatService {
  /**
   * Messages feed stream
   */
  messagesFeed$: Observable<MessagesFeedValue>;

  /**
   * Start the service
   */
  start(): void;

  /**
   * Start the service with the possibility to cancel
   * @param cancel$ cancellation observable
   */
  StartWithCancel(cancel$: Observable<void>): void;

  /**
   * Stop the service
   */
  stop(): void;

  /**
   * Get table by a given id with the related messages
   * @param tableId table id
   * @return Observable<TableModel>
   */
  geTabletByIdWithMessages(tableId: string): Observable<TableModel>;

  /**
   * Get all tables
   * @return Observable<TableModel[]>
   */
  getAllTables(): Observable<TableModel[]>;

  /**
   * Subscribe to a messages feed by a given table id
   * @param tableId table id
   * @return FeedSubscription
   */
  subscribeToTableMessages(tableId: string): FeedSubscription;
}
