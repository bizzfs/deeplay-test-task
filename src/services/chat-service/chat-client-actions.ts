import { ChatClient } from './chat-client';

export interface Action {
  type: string;
  client: ChatClient;
}

export enum ActionTypes {
  TABLES_GET_LIST = 'tables.get_list',
  TABLES_GET_ONE = 'tables.get',
  TABLES_SUBSCRIBE = 'tables.subscribe',
  TABLES_UNSUBSCRIBE = 'tables.unsubscribe',
  ETL_START = 'etl.start',
  ETL_STOP = 'etl.stop',
  CLIENT_CLOSE = 'client.close',
}

export class TablesGetList implements Action {
  public readonly type = ActionTypes.TABLES_GET_LIST;
  constructor(public readonly client: ChatClient) {}
}

export class TablesGetOne implements Action {
  public readonly type = ActionTypes.TABLES_GET_ONE;
  constructor(public readonly client: ChatClient, public readonly payload: { tableId: string }) {}
}

export class TablesSubscribe implements Action {
  public readonly type = ActionTypes.TABLES_SUBSCRIBE;
  constructor(public readonly client: ChatClient, public readonly payload: { tableId: string }) {}
}

export class TablesUnsubscribe implements Action {
  public readonly type = ActionTypes.TABLES_UNSUBSCRIBE;
  constructor(public readonly client: ChatClient, public readonly payload: { tableId: string }) {}
}

export class EtlStart implements Action {
  public readonly type = ActionTypes.ETL_START;
  constructor(public readonly client: ChatClient, public readonly payload: { freq: number }) {}
}

export class EtlStop implements Action {
  public readonly type = ActionTypes.ETL_STOP;
  constructor(public readonly client: ChatClient) {}
}

export class ClientClose implements Action {
  public readonly type = ActionTypes.CLIENT_CLOSE;
  constructor(public readonly client: ChatClient) {}
}

export type ActionsUnion =
  | TablesGetList
  | TablesGetOne
  | TablesSubscribe
  | TablesUnsubscribe
  | EtlStart
  | EtlStop
  | ClientClose;
