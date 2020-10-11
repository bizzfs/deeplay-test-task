import { Inject } from 'injection-js';
import { merge, Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import WebSocket, { Server } from 'ws';

import { Env } from '../env';
import { CHAT_SERVICE_TOKEN, ENV_TOKEN, ETL_SERVICE_TOKEN } from '../injection-tokens';
import { ChatService, EtlService } from '../services';
import { MessagesFeedValue } from '../persistence';
import { newHelpMessage, newMessage } from './messages';
import { WsHub } from './ws-hub';

export class WsHubImpl implements WsHub {
  private readonly stopSubj$ = new Subject<void>();
  private wss: Server | null = null;
  private readonly feedSubsClientsMap: { [tableId: string]: WebSocket[] } = {};
  private readonly unsubFuncsMap: { [index: number]: { [tableId: string]: () => void } } = {};

  private readonly newCloseEventHandler = (ws: WebSocket) => () => {
    ws.removeAllListeners();
    this.cleanSubscriptions(ws);
  };

  constructor(
    @Inject(ENV_TOKEN) private readonly env: Env,
    @Inject(CHAT_SERVICE_TOKEN) private readonly chatService: ChatService,
    @Inject(ETL_SERVICE_TOKEN) private readonly etlService: EtlService
  ) {}

  public start(): void {
    this.startWithCancel(new Observable<void>());
  }

  public startWithCancel(cancel$: Observable<void>): void {
    // stop possible previous run
    this.stop();

    // create server and add listeners
    this.wss = this.newWsServer();
    this.wss.on('connection', (ws) => {
      ws.on('message', this.newMessageEventHandler(ws).bind(this));
      ws.on('close', this.newCloseEventHandler(ws).bind(this));
    });

    // listen and process feed values coming from ChatService
    this.chatService.messagesFeed$
      .pipe(takeUntil(merge(this.stopSubj$, cancel$)))
      .subscribe((val) => this.handleMessageFeedValue(val));

    // handle stop and cancellation
    merge(this.stopSubj$, cancel$)
      .pipe(first())
      .subscribe(() => {
        this.wss?.close();
        this.wss = null;
      });
  }

  public stop(): void {
    this.stopSubj$.next();
  }

  private newWsServer(): WebSocket.Server {
    return new WebSocket.Server({ host: '0.0.0.0', port: this.env.port });
  }

  // -----------------------------------------inbound ws message handlers-----------------------------------------------

  private newMessageEventHandler(ws: WebSocket): (command: string) => void {
    return (command: string) => {
      if (command === 'help') {
        ws.send(newHelpMessage());
      } else if (command === 'tables.get_list') {
        this.handleGetTablesList(ws);
      } else if (command.startsWith('tables.get.')) {
        this.handleGetOneTable(ws, command);
      } else if (command.startsWith('tables.subscribe.')) {
        this.handleSubscribeToTable(ws, command);
      } else if (command.startsWith('tables.unsubscribe')) {
        this.handleUnsubscribeFromTable(ws, command);
      } else if (command.startsWith('etl.start.')) {
        this.handleEtlStart(ws, command);
      } else if (command === 'etl.stop') {
        this.handleEtlStop(ws);
      } else {
        this.handleDefault(ws);
      }
    };
  }

  // tables.get_list handler
  private handleGetTablesList(ws: WebSocket): void {
    this.chatService.getAllTables().subscribe((tables) => ws.send(newMessage(true, [], tables)));
  }

  // tables.get_one.{id} handler
  private handleGetOneTable(ws: WebSocket, command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3) {
      ws.send(newMessage(false, ['invalid_command'], { message: 'for help type "help" command' }));
    }
    this.chatService.geTabletByIdWithMessages(parts[2]).subscribe((table) => ws.send(newMessage(true, [], table)));
  }

  // tables.subscribe.{id} handler
  private handleSubscribeToTable(ws: WebSocket, command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3) {
      ws.send(newMessage(false, ['invalid_command'], { message: 'for help type "help" command' }));
    }
    this.subscribe(ws, parts[2]);
    ws.send(newMessage(true, [], { message: 'subscribed' }));
  }

  // tables.unsubscribe.{id} handler
  private handleUnsubscribeFromTable(ws: WebSocket, command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3) {
      ws.send(newMessage(false, ['invalid_command'], { message: 'for help type "help" command' }));
    }
    this.unsubscribe(ws, parts[2]);
    ws.send(newMessage(true, [], { message: 'unsubscribed' }));
  }

  private handleEtlStart(ws: WebSocket, command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3 || Number.isNaN(+parts[2])) {
      ws.send(newMessage(false, ['invalid_command'], { message: 'freq must be a number' }));
    }
    this.etlService.start(+parts[2]);
    ws.send(newMessage(true, [], { message: `etl started with frequency ${parts[2]}` }));
  }

  private handleEtlStop(ws: WebSocket): void {
    this.etlService.stop();
    ws.send(newMessage(true, [], { message: 'etl stopped' }));
  }

  // fallback handler
  private handleDefault(ws: WebSocket): void {
    ws.send(newMessage(false, ['unknown_command'], { message: 'for help type "help" command' }));
  }

  // ---------------------------methods related to feed subscription commands-------------------------------------------

  private subscribe(ws: WebSocket, tableId: string): void {
    this.addWsClientToSubsList(ws, tableId);
    const index = this.getClientIndex(ws);
    if (!this.unsubFuncsMap[index]) this.unsubFuncsMap[index] = {};

    const { close } = this.chatService.subscribeToTableMessages(tableId);
    this.unsubFuncsMap[index][tableId] = close;
  }

  private unsubscribe(ws: WebSocket, tableId: string): void {
    this.removeWsClientFromSubsList(ws, tableId);
    const index = this.getClientIndex(ws);
    if (this.unsubFuncsMap[index] && this.unsubFuncsMap[index][tableId]) {
      this.unsubFuncsMap[index][tableId]();
      delete this.unsubFuncsMap[index][tableId];
    }
  }

  private cleanSubscriptions(ws: WebSocket): void {
    Object.keys(this.feedSubsClientsMap).forEach((key) => {
      const index = this.feedSubsClientsMap[key].findIndex((client) => client === ws);
      if (index > -1) {
        this.feedSubsClientsMap[key].splice(index, 1);
      }
    });

    const index = this.getClientIndex(ws);
    if (this.unsubFuncsMap[index]) {
      Object.keys(this.unsubFuncsMap[index]).forEach((key) => {
        this.unsubFuncsMap[index][key]();
      });
    }
  }

  private addWsClientToSubsList(ws: WebSocket, tableId: string): void {
    const arr = this.feedSubsClientsMap[tableId];
    if (!arr) {
      this.feedSubsClientsMap[tableId] = [ws];
    } else {
      arr[arr.length] = ws;
    }
  }

  private removeWsClientFromSubsList(ws: WebSocket, tableId: string): void {
    const arr = this.feedSubsClientsMap[tableId];
    if (arr) {
      const index = arr.findIndex((item) => item === ws);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  }

  // since ws for node doesn't provide a convenient method to identify a client by say id
  // we hane the only option to iterate through the wss clients every time
  private getClientIndex(ws: WebSocket): number {
    if (!this.wss) return -1;

    let i = 0;
    let result = -1;
    try {
      this.wss.clients.forEach((client) => {
        if (client === ws) {
          result = i;
          throw new Error('break');
        }
        i++;
      });
    } catch (e) {}

    return result;
  }

  // ----------------------------------------------feed messages handler------------------------------------------------

  // process feed values coming from ChatService
  private handleMessageFeedValue(val: MessagesFeedValue): void {
    if (val.message && val.message.tableId) {
      const arr = this.feedSubsClientsMap[val.message.tableId];
      if (arr) {
        arr.forEach((ws) => ws.send(newMessage(!val.error, val.error ? [val.error.name] : [], val.message)));
      }
    }
  }
}
