import { Observable } from 'rxjs';

import { Events } from './events';

export interface EventsChannel {
  /**
   * Dispatch an event
   * @param event
   */
  dispatch(event: Events): void;

  /**
   * Get the events stream
   */
  getStream(): Observable<Events>;



}
