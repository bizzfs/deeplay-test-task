import { ActionDispatchFunc } from './index';

export interface ChatClient {
  setEventDispatcher(actionDispatchFunc: ActionDispatchFunc): void;
  sendData(data: any, ok: boolean, errors: string[]): void;
  sendMessage(message: string, ok: boolean, errors: string[]): void;
}
