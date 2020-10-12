import { Inject } from 'injection-js';
import { merge, Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import WebSocket, { Server } from 'ws';

import { Env } from '../env';
import { CHAT_SERVICE_TOKEN, ENV_TOKEN } from '../injection-tokens';
import { ChatService } from '../services';
import { WsHub } from './ws-hub';
import { WsClient } from './ws-client';

export class WsHubImpl implements WsHub {
  private readonly stopSubj$ = new Subject<void>();
  private wss: Server | null = null;
  private readonly clients: WebSocket[] = [];

  constructor(
    @Inject(ENV_TOKEN) private readonly env: Env,
    @Inject(CHAT_SERVICE_TOKEN) private readonly chatService: ChatService
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
      this.clients[this.clients.length] = ws;
      this.chatService.registerClient(new WsClient(ws));
    });

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
}
