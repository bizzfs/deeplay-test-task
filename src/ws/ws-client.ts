import WebSocket from 'ws';

import { ActionsUnion } from '../services/chat-service/chat-client-actions';
import { ChatClient } from '../services/chat-service/chat-client';
import { ChatClientActions } from '../services/chat-service';
import { cleanNullProps } from '../services/utils';

export class WsClient implements ChatClient {
  private dispatchFunc = (action: ActionsUnion) => {};

  private get isOpen(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }

  constructor(private readonly ws: WebSocket) {
    this.init();
  }

  private init(): void {
    this.ws.on('message', this.handleWsMessage.bind(this));
    this.ws.on('close', this.close.bind(this));
  }

  public sendData(data: any, ok: boolean, errors: string[]): void {
    if (this.isOpen) {
      this.ws.send(JSON.stringify({ ok, data, errors }));
    }
  }

  public sendMessage(message: string, ok: boolean, errors: string[]): void {
    if (this.isOpen) {
      this.ws.send(JSON.stringify({ ok, data: { message }, errors }));
    }
  }

  public setEventDispatcher(actionDispatchFunc: (action: ActionsUnion) => void): void {
    this.dispatchFunc = actionDispatchFunc;
  }

  public close(): void {
    this.dispatchFunc(new ChatClientActions.ClientClose(this));
    this.ws.removeAllListeners();
    if (this.isOpen) {
      this.ws.close();
    }
  }

  private handleWsMessage(message: string): void {
    if (message === 'help') {
      this.handleHelp();
    } else if (message === 'tables.get_list') {
      this.handleTablesGetList();
    } else if (message.startsWith('tables.get.')) {
      this.handleTablesGetOne(message);
    } else if (message.startsWith('tables.subscribe.')) {
      this.handleTablesSubscribe(message);
    } else if (message.startsWith('tables.unsubscribe')) {
      this.handleTablesUnsubscribe(message);
    } else if (message.startsWith('etl.start.')) {
      this.handleEtlStart(message);
    } else if (message === 'etl.stop') {
      this.handleEtlStop();
    } else {
      this.handleDefault();
    }
  }

  // -----------------------------------------inbound ws message handlers-----------------------------------------------
  // help handler
  private handleHelp(): void {
    this.sendData(
      {
        commands: [
          'etl.start.{freq}',
          'etl.stop',
          'tables.get_list',
          'tables.get.{id}',
          'tables.subscribe.{id}',
          'tables.unsubscribe.{id}',
        ],
      },
      true,
      []
    );
  }

  // tables.get_list handler
  private handleTablesGetList(): void {
    this.dispatchFunc(new ChatClientActions.TablesGetList(this));
  }

  // tables.get_one.{id} handler
  private handleTablesGetOne(command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3) {
      this.sendMessage('for help type "help" command', false, ['invalid_command']);
    }
    this.dispatchFunc(new ChatClientActions.TablesGetOne(this, { tableId: parts[2] }));
  }

  // tables.subscribe.{id} handler
  private handleTablesSubscribe(command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3) {
      this.sendMessage('for help type "help" command', false, ['invalid_command']);
    }
    this.dispatchFunc(new ChatClientActions.TablesSubscribe(this, { tableId: parts[2] }));
  }

  // tables.unsubscribe.{id} handler
  private handleTablesUnsubscribe(command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3) {
      this.sendMessage('for help type "help" command', false, ['invalid_command']);
    }
    this.dispatchFunc(new ChatClientActions.TablesUnsubscribe(this, { tableId: parts[2] }));
  }

  // etl.start.{freq} handler
  private handleEtlStart(command: string): void {
    const parts = command.split('.');
    if (parts.length !== 3 || Number.isNaN(+parts[2])) {
      this.sendMessage('freq must be a number', false, ['invalid_command']);
    }
    this.dispatchFunc(new ChatClientActions.EtlStart(this, { freq: +parts[2] }));
  }

  // etl.stop handler
  private handleEtlStop(): void {
    this.dispatchFunc(new ChatClientActions.EtlStop(this));
  }

  // fallback handler
  private handleDefault(): void {
    this.sendMessage('for help type "help" command', true, ['unknown_command']);
  }
}
