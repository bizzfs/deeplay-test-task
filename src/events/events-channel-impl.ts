import { Observable, Subject } from 'rxjs';

import { Event } from './event';
import { EventsChannel } from './events-channel';

export class EventsChannelImpl implements EventsChannel {
  private readonly eventsSubj$ = new Subject<Event>();

  public dispatch(event: Event): void {
    this.eventsSubj$.next(event);
  }
  public getStream(): Observable<Event> {
    return this.eventsSubj$.asObservable();
  }
}
