import { Observable } from 'rxjs';

import { EventsUnion } from './eventsUnion';

export interface EventsChannel {
  /**
   * Dispatch an event
   * @param event
   */
  dispatch(event: EventsUnion): void;

  /**
   * Get the events stream
   */
  getStream(): Observable<EventsUnion>;



}
