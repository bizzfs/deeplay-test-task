import { Observable, Subject } from 'rxjs';

import { Events } from './events';
import { EventsChannel } from './events-channel';

export class EventsChannelImpl implements EventsChannel {
  private readonly eventsSubj$ = new Subject<Events>();

  public dispatch(event: Events): void {
    this.eventsSubj$.next(event);
  }
  public getStream(): Observable<Events> {
    return this.eventsSubj$.asObservable();
  }
}
