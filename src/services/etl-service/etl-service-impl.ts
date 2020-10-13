import { Inject } from 'injection-js';
import { forkJoin, interval, merge, Observable, Subject } from 'rxjs';
import { map, mergeMap, startWith, takeUntil } from 'rxjs/operators';
import crypto from 'crypto';

import { EtlService } from './etl-service';
import { EventsUnion, EventsChannel, MessageSend } from '../../events';
import { EVENTS_CHANNEL_TOKEN, PLAYERS_SERVICE_TOKEN, TABLES_SERVICE_TOKEN } from '../../injection-tokens';
import { PlayersService, TablesService } from '..';
import { PlayerTakesSeat } from '../../events/eventsUnion';

interface PLayersMap {
  [playerId: string]: { tableId: string; seat: number };
}

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
        mergeMap((pLayersMap) =>
          interval(freq).pipe(
            startWith(-1),
            takeUntil(merge(this.stopSubj$, cancel$)),
            map(() => this.generateMessageSendEvent(pLayersMap))
          )
        )
      )
      .subscribe((event) => this.eventsChannel.dispatch(event));
  }

  public stop(): void {
    this.stopSubj$.next();
  }

  private loadPlayerAndTableIds(): Observable<PLayersMap> {
    return forkJoin([this.playersService.getAll(), this.tablesService.getAll()]).pipe(
      map(([players, tables]) => [
        players.map((player) => player.id as string),
        tables.map((table) => table.id as string),
      ]),
      map(([playerIds, tableIds]) => this.arrangePlayersOnTables(playerIds, tableIds))
    );
  }

  private arrangePlayersOnTables(playerIds: string[], tableIds: string[]): PLayersMap {
    const maxPlayersCount = tableIds.length * 10;
    const tempPlayerIds =
      playerIds.length <= maxPlayersCount ? [...playerIds] : playerIds.slice(0, maxPlayersCount - 1);
    let seatCursor = 0;
    let tableCursor = 0;
    return tempPlayerIds.reduce((map, playerId, i) => {
      map[playerId] = { seat: seatCursor, tableId: tableIds[tableCursor] };
      seatCursor++;
      if (seatCursor === 10) {
        seatCursor = 0;
        tableCursor++;
      }
      this.eventsChannel.dispatch(
        new PlayerTakesSeat({ playerId, seat: seatCursor, tableId: tableIds[tableCursor], timestamp: Date.now() })
      );
      return map;
    }, {} as PLayersMap);
  }

  private generateMessageSendEvent(pLayersMap: PLayersMap): EventsUnion {
    const playerIds = Object.keys(pLayersMap);
    const playerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    return new MessageSend({
      message: crypto.randomBytes(30).toString('hex'),
      playerId,
      tableId: pLayersMap[playerId].tableId,
      timestamp: Date.now(),
    });
  }
}
