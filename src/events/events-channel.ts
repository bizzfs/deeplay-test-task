import { Observable } from 'rxjs';

import { Event } from './event';

export interface EventsChannel {
  /**
   * Dispatch an event
   * @param event
   */
  dispatch(event: Event): void;

  /**
   * Get the events stream
   */
  getStream(): Observable<Event>;



}
