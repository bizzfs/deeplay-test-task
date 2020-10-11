import { Observable } from 'rxjs';

export interface EtlService {
  /**
   * Start the service and specify the frequency of the generated messages
   * @param freq frequency
   */
  start(freq: number): void;

  /**
   * Start the service and specify the frequency of the generated messages with the possibility to cancel
   * @param freq frequency
   * @param cancel$ cancellation observable
   */
  startWithCancel(freq: number, cancel$: Observable<void>): void;

  /**
   * Stop the service
   */
  stop(): void;
}
