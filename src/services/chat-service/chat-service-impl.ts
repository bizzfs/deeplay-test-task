import { Inject } from 'injection-js';
import { forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { concatMap, map, mergeMap, takeUntil } from 'rxjs/operators';

import { ChatService } from './chat-service';
import {
  EVENTS_CHANNEL_TOKEN,
  MESSAGES_SERVICE_TOKEN,
  PLAYERS_SERVICE_TOKEN,
  TABLES_SERVICE_TOKEN,
} from '../../injection-tokens';
import { Event, EventsChannel, EventTypes, MessageSend } from '../../events';
import { FeedSubscription, MessagesService, PlayersService, TablesService } from '..';
import { MessageModel, TableModel } from '../../persistence';

export class ChatServiceImpl implements ChatService {
  private readonly stopSubj$ = new Subject<void>();
  public readonly messagesFeed$ = this.messagesService.feed$;

  constructor(
    @Inject(EVENTS_CHANNEL_TOKEN) private readonly eventsChannel: EventsChannel,
    @Inject(MESSAGES_SERVICE_TOKEN) private readonly messagesService: MessagesService,
    @Inject(PLAYERS_SERVICE_TOKEN) private readonly playersService: PlayersService,
    @Inject(TABLES_SERVICE_TOKEN) private readonly tablesService: TablesService
  ) {}

  public start(): void {
    this.StartWithCancel(new Observable<void>());
  }

  public StartWithCancel(cancel$: Observable<void>): void {
    this.stop();

    this.eventsChannel
      .getStream()
      .pipe(
        mergeMap((event) => this.handleEvent(event)),
        takeUntil(merge(this.stopSubj$, cancel$))
      )
      .subscribe();
  }

  public stop(): void {
    this.stopSubj$.next();
  }

  public geTabletByIdWithMessages(tableId: string): Observable<TableModel> {
    return forkJoin([this.tablesService.getById(tableId), this.messagesService.getByTableId(tableId)]).pipe(
      map(([table, messages]) => {
        table.messages = messages;
        return table;
      })
    );
  }

  public getAllTables(): Observable<TableModel[]> {
    return this.tablesService.getAll();
  }

  public subscribeToTableMessages(tableId: string): FeedSubscription {
    return this.messagesService.subscribe(tableId);
  }

  private handleEvent(event: Event): Observable<void> {
    switch (event.type) {
      case EventTypes.MESSAGE_SEND:
        return this.handleMessageSendEvent(event);
      case EventTypes.PLAYER_ONLINE:
        return of();
      default:
        return of();
    }
  }

  private handleMessageSendEvent(event: MessageSend): Observable<void> {
    return this.messagesService.create(this.transformEventToMessageModel(event)).pipe(
      concatMap((message) =>
        forkJoin([
          this.playersService.getById(message.playerId as string),
          this.tablesService.getById(message.tableId as string),
        ]).pipe(
          map(([player, table]) => {
            message.player = player;
            message.table = table;
            return message;
          }),
          map(() => {})
        )
      )
    );
  }

  private transformEventToMessageModel(event: MessageSend): MessageModel {
    const model = new MessageModel();
    const { message, playerId, tableId, timestamp } = event.data;
    model.message = message;
    model.playerId = playerId;
    model.tableId = tableId;
    model.timestamp = timestamp;
    return model;
  }
}
