import { Observable } from 'rxjs';

export interface WsHub {
  /**
   * Start the hub
   */
  start(): void;

  /**
   * Start the hub with the possibility to cancel
   * @param cancel$ cancellation observable
   */
  startWithCancel(cancel$: Observable<void>): void;

  /**
   * Stop the hub
   */
  stop(): void;
}
