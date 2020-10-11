import { Inject } from 'injection-js';
import { forkJoin, interval, merge, Observable, Subject } from 'rxjs';
import { map, mergeMap, startWith, takeUntil } from 'rxjs/operators';
import crypto from 'crypto';

import { EtlService } from './etl-service';
import { Event, EventsChannel, MessageSend } from '../../events';
import { EVENTS_CHANNEL_TOKEN, PLAYERS_SERVICE_TOKEN, TABLES_SERVICE_TOKEN } from '../../injection-tokens';
import { PlayersService, TablesService } from '..';

export class EtlServiceImpl implements EtlService {
  private readonly stopSubj$ = new Subject<void>();

  constructor(
    @Inject(EVENTS_CHANNEL_TOKEN) private readonly eventsChannel: EventsChannel,
    @Inject(PLAYERS_SERVICE_TOKEN) private readonly playersService: PlayersService,
    @Inject(TABLES_SERVICE_TOKEN) private readonly tablesService: TablesService
  ) {}

  public start(freq: number): void {
    this.startWithCancel(freq, new Observable<void>());
  }

  public startWithCancel(freq: number, cancel$: Observable<void>): void {
    this.stop();

    this.loadPlayerAndTableIds()
      .pipe(
        mergeMap(([pIds, tIds]) =>
          interval(freq).pipe(
            startWith(-1),
            takeUntil(merge(this.stopSubj$, cancel$)),
            map(() => this.generateMessageSendEvent(pIds, tIds))
          )
        )
      )
      .subscribe((event) => this.eventsChannel.dispatch(event));
  }

  public stop(): void {
    this.stopSubj$.next();
  }

  private loadPlayerAndTableIds(): Observable<[string[], string[]]> {
    return forkJoin([this.playersService.getAll(), this.tablesService.getAll()]).pipe(
      map(([players, tables]) => [
        players.map((player) => player.id as string),
        tables.map((table) => table.id as string),
      ])
    );
  }

  private generateMessageSendEvent(playerIds: string[], tableIds: string[]): Event {
    const playerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    const tableId = tableIds[Math.floor(Math.random() * tableIds.length)];
    return new MessageSend({
      message: crypto.randomBytes(30).toString('hex'),
      playerId,
      tableId,
      timestamp: Date.now(),
    });
  }
}
