import { Inject } from 'injection-js';
import { forkJoin, merge, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

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
import { EventsUnion, EventsChannel, EventTypes, MessageSend } from '../../events';
import { EtlService, MessagesService, PlayersService, TablesService } from '..';
import { MessageModel, MessagesFeedValue, TableModel } from '../../persistence';

interface TableSubs {
  [tableId: string]: {
    clients: ChatClient[];
    unsubscribeFunc: () => void;
  };
}

export class ChatServiceImpl implements ChatService {
  private readonly stopSubj$ = new Subject<void>();
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
  ) {}

  public start(): void {
    this.StartWithCancel(new Observable<void>());
  }

  public StartWithCancel(cancel$: Observable<void>): void {
    this.stop();

    // listen etl events
    this.etlEventsChannel
      .getStream()
      .pipe(takeUntil(merge(this.stopSubj$, cancel$)))
      .subscribe(this.handleEtlEvent.bind(this));

    this.clientActions$.pipe(takeUntil(merge(this.stopSubj$, cancel$))).subscribe(this.handleClientAction.bind(this));

    this.messagesService.feed$
      .pipe(takeUntil(merge(this.stopSubj$, cancel$)))
      .subscribe(this.handleFeedValue.bind(this));
  }

  public stop(): void {
    this.stopSubj$.next();
  }

  public registerClient(client: ChatClient): void {
    client.setEventDispatcher(this.dispatchActionFunc.bind(this));
    this.clients[this.clients.length] = client;
  }

  // ---------------------------------------clients related-------------------------------------------------------------

  private handleClientAction(action: ChatClientActions.ActionsUnion): void {
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
      default:
        return;
    }
  }

  private handleTablesGetList(action: ChatClientActions.TablesGetList): void {
    this.tablesService
      .getAll()
      .pipe(takeUntil(this.stopSubj$))
      .subscribe((tables) => action.client.sendData(tables, true, []));
  }

  private handleTablesGetOne(action: ChatClientActions.TablesGetOne): void {
    this.getTableWithMessages(action.payload.tableId)
      .pipe(takeUntil(this.stopSubj$))
      .subscribe((table) => action.client.sendData(table, true, []));
  }

  private getTableWithMessages(tableId: string): Observable<TableModel> {
    return forkJoin([this.tablesService.getById(tableId), this.messagesService.getByTableId(tableId)]).pipe(
      map(([table, messages]) => {
        table.messages = messages;
        return table;
      })
    );
  }

  private handleTablesSubscribe(action: ChatClientActions.TablesSubscribe): void {
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
  }

  private handleTablesUnsubscribe(action: ChatClientActions.TablesUnsubscribe): void {
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
        return;
      }
    }

    action.client.sendMessage(`not subscribed to ${tableId}`, false, ['no_available_subscriptions']);
  }

  private handleEtlStart(action: ChatClientActions.EtlStart): void {
    this.etlService.start(action.payload.freq);
    action.client.sendMessage('etl started', true, []);
  }

  private handleEtlStop(action: ChatClientActions.EtlStop): void {
    this.etlService.stop();
    action.client.sendMessage('etl stopped', true, []);
  }

  private handleClientStop(action: ChatClientActions.ClientClose): void {
    Object.keys(this.tableSubsMap).forEach((key) => {
      const index = this.tableSubsMap[key].clients.findIndex((item) => item === action.client);
      if (index > -1) {
        this.tableSubsMap[key].clients.splice(index, 1);
        if (this.tableSubsMap[key].clients.length === 0) {
          this.tableSubsMap[key].unsubscribeFunc();
          delete this.tableSubsMap[key];
        }
      }
    });
  }

  // -------------------------------------------feed related------------------------------------------------------------
  private handleFeedValue(value: MessagesFeedValue): void {
    const tableId = value.message?.tableId as string;
    if (this.tableSubsMap[tableId]) {
      this.tableSubsMap[tableId].clients.forEach((client) =>
        client.sendData(value.message, !value.error, value.error ? [value.error.message] : [])
      );
    }
  }

  // -------------------------------------------etl related-------------------------------------------------------------

  private handleEtlEvent(event: EventsUnion): void {
    switch (event.type) {
      case EventTypes.MESSAGE_SEND:
        return this.handleEtlMessageSendEvent(event);
      default:
        return;
    }
  }

  private handleEtlMessageSendEvent(event: MessageSend): void {
    this.messagesService.create(this.transformEventToMessageModel(event)).subscribe();
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
