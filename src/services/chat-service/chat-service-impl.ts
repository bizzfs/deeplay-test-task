import { Inject } from 'injection-js';
import { forkJoin, merge, Observable, of, Subject, throwError } from 'rxjs';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { ChatClient } from './chat-client';
import { ChatClientActions } from './index';
import { ChatService } from './chat-service';
import {
  ETL_SERVICE_TOKEN,
  EVENTS_CHANNEL_TOKEN,
  MESSAGES_SERVICE_TOKEN,
  PLAYERS_SERVICE_TOKEN,
  TABLES_SERVICE_TOKEN,
} from '../../injection-tokens';
import { EventsChannel, EventsUnion, EventTypes, MessageSend } from '../../events';
import { EtlService, MessagesService, PlayersService, TablesService } from '..';
import { MessageModel, MessagesFeedValue, TableModel } from '../../persistence';
import { mapsToVoid, withErrorHandling } from '../utils';

interface TableSubs {
  [tableId: string]: {
    clients: ChatClient[];
    unsubscribeFunc: () => void;
  };
}

export class ChatServiceImpl implements ChatService {
  private readonly stopSubj$ = new Subject<void>();
  private readonly main$: Observable<void>;
  private readonly clients: ChatClient[] = [];
  private readonly tableSubsMap: TableSubs = {};
  private readonly clientActionsSubj$ = new Subject<ChatClientActions.ActionsUnion>();
  private readonly clientActions$ = this.clientActionsSubj$.asObservable();
  private readonly dispatchActionFunc = (action: ChatClientActions.ActionsUnion) =>
    this.clientActionsSubj$.next(action);

  constructor(
    @Inject(ETL_SERVICE_TOKEN) private readonly etlService: EtlService,
    @Inject(EVENTS_CHANNEL_TOKEN) private readonly etlEventsChannel: EventsChannel,
    @Inject(MESSAGES_SERVICE_TOKEN) private readonly messagesService: MessagesService,
    @Inject(PLAYERS_SERVICE_TOKEN) private readonly playersService: PlayersService,
    @Inject(TABLES_SERVICE_TOKEN) private readonly tablesService: TablesService
  ) {
    this.main$ = merge(
      this.etlEventsChannel.getStream().pipe(mergeMap((event) => withErrorHandling(this.handleEtlEvent(event)))),
      this.clientActions$.pipe(mergeMap((action) => withErrorHandling(this.handleClientAction(action)))),
      this.messagesService.feed$.pipe(mergeMap((message) => withErrorHandling(this.handleFeedValue(message))))
    );
  }

  public start(): void {
    this.StartWithCancel(new Observable<void>());
  }

  public StartWithCancel(cancel$: Observable<void>): void {
    this.stop();

    this.main$.pipe(takeUntil(merge(this.stopSubj$, cancel$))).subscribe(
      () => {},
      (err) => console.log(err.message)
    );
  }

  public stop(): void {
    this.stopSubj$.next();
  }

  public registerClient(client: ChatClient): void {
    client.setEventDispatcher(this.dispatchActionFunc.bind(this));
    this.clients[this.clients.length] = client;
  }

  // ---------------------------------------clients related-------------------------------------------------------------

  private handleClientAction(action: ChatClientActions.ActionsUnion): Observable<void> {
    switch (action.type) {
      case ChatClientActions.ActionTypes.TABLES_GET_LIST:
        return this.handleTablesGetList(action);
      case ChatClientActions.ActionTypes.TABLES_GET_ONE:
        return this.handleTablesGetOne(action);
      case ChatClientActions.ActionTypes.TABLES_SUBSCRIBE:
        return this.handleTablesSubscribe(action);
      case ChatClientActions.ActionTypes.TABLES_UNSUBSCRIBE:
        return this.handleTablesUnsubscribe(action);
      case ChatClientActions.ActionTypes.ETL_START:
        return this.handleEtlStart(action);
      case ChatClientActions.ActionTypes.ETL_STOP:
        return this.handleEtlStop(action);
      case ChatClientActions.ActionTypes.CLIENT_CLOSE:
        return this.handleClientStop(action);
    }
  }

  private handleTablesGetList(action: ChatClientActions.TablesGetList): Observable<void> {
    return mapsToVoid(
      this.tablesService.getAll().pipe(
        takeUntil(this.stopSubj$),
        tap((tables) => action.client.sendData(tables, true, []))
      )
    );
  }

  private handleTablesGetOne(action: ChatClientActions.TablesGetOne): Observable<void> {
    return mapsToVoid(
      this.getTableWithMessages(action.payload.tableId).pipe(
        takeUntil(this.stopSubj$),
        tap((table) => action.client.sendData(table, true, []))
      )
    );
  }

  private getTableWithMessages(tableId: string): Observable<TableModel> {
    return forkJoin([this.tablesService.getById(tableId), this.messagesService.getByTableId(tableId)]).pipe(
      map(([table, messages]) => {
        table.messages = messages;
        return table;
      })
    );
  }

  private handleTablesSubscribe(action: ChatClientActions.TablesSubscribe): Observable<void> {
    const {
      client,
      payload: { tableId },
    } = action;

    let obj = this.tableSubsMap[tableId];

    if (!obj) {
      this.tableSubsMap[tableId] = {
        clients: [],
        unsubscribeFunc: this.messagesService.subscribe(tableId),
      };
      obj = this.tableSubsMap[tableId];
    }

    obj.clients[obj.clients.length] = client;
    action.client.sendMessage(`subscribed to ${tableId}`, true, []);
    return of();
  }

  private handleTablesUnsubscribe(action: ChatClientActions.TablesUnsubscribe): Observable<void> {
    const {
      client,
      payload: { tableId },
    } = action;

    if (this.tableSubsMap[tableId]) {
      const { clients, unsubscribeFunc } = this.tableSubsMap[tableId];
      const index = clients.findIndex((item) => item === client);
      if (index > -1) {
        clients.splice(index, 1);
        if (clients.length === 0) {
          unsubscribeFunc();
          delete this.tableSubsMap[tableId];
        }
        action.client.sendMessage(`unsubscribed from ${tableId}`, true, []);
        return of();
      }
    }

    action.client.sendMessage(`not subscribed to ${tableId}`, false, ['no_available_subscriptions']);
    return of();
  }

  private handleEtlStart(action: ChatClientActions.EtlStart): Observable<void> {
    this.etlService.start(action.payload.freq);
    action.client.sendMessage('etl started', true, []);
    return of();
  }

  private handleEtlStop(action: ChatClientActions.EtlStop): Observable<void> {
    this.etlService.stop();
    action.client.sendMessage('etl stopped', true, []);
    return of();
  }

  private handleClientStop(action: ChatClientActions.ClientClose): Observable<void> {
    Object.keys(this.tableSubsMap).forEach((key) => {
      const index = this.tableSubsMap[key].clients.findIndex((item) => item === action.client);
      if (index > -1) {
        this.tableSubsMap[key].clients.splice(index, 1);
        if (this.tableSubsMap[key].clients.length === 0) {
          this.tableSubsMap[key].unsubscribeFunc();
          delete this.tableSubsMap[key];
        }
        return of();
      }
    });
    return of();
  }

  // -------------------------------------------feed related------------------------------------------------------------
  private handleFeedValue(value: MessagesFeedValue): Observable<void> {
    if (!value.message || !value.message.tableId) throw new Error(`invalid feed value: ${JSON.stringify(value)}`);
    if (this.tableSubsMap[value.message.tableId]) {
      this.tableSubsMap[value.message.tableId].clients.forEach((client) =>
        client.sendData(value.message, !value.error, value.error ? [value.error.message] : [])
      );
    }
    return of();
  }

  // -------------------------------------------etl related-------------------------------------------------------------

  private handleEtlEvent(event: EventsUnion): Observable<void> {
    switch (event.type) {
      case EventTypes.MESSAGE_SEND:
        return this.handleEtlMessageSendEvent(event);
      case EventTypes.PLAYER_TAKES_SEAT:
        return of();
      default:
        throw new Error('not handled event type');
    }
  }

  private handleEtlMessageSendEvent(event: MessageSend): Observable<void> {
    return mapsToVoid(this.messagesService.create(this.transformEventToMessageModel(event)).pipe());
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
