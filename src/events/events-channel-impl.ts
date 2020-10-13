import { Observable, Subject } from 'rxjs';

import { EventsUnion } from './eventsUnion';
import { EventsChannel } from './events-channel';

export class EventsChannelImpl implements EventsChannel {
  private readonly eventsSubj$ = new Subject<EventsUnion>();

  public dispatch(event: EventsUnion): void {
    this.eventsSubj$.next(event);
  }
  public getStream(): Observable<EventsUnion> {
    return this.eventsSubj$.asObservable();
  }
}
