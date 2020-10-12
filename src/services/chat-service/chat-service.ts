import { Observable } from 'rxjs';

import { ChatClient } from './chat-client';

export interface ChatService {
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
   * Register client to a service
   * @param client
   */
  registerClient(client: ChatClient): void;
}
