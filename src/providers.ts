import { Provider } from 'injection-js';

import {
  CHAT_SERVICE_TOKEN,
  DB_MANAGER_TOKEN,
  ENV_TOKEN,
  ETL_SERVICE_TOKEN,
  EVENTS_CHANNEL_TOKEN,
  JSON_MAPPER_SERVICE_TOKEN,
  MESSAGES_REPOSITORY_TOKEN,
  MESSAGES_SERVICE_TOKEN,
  PLAYERS_REPOSITORY_TOKEN,
  PLAYERS_SERVICE_TOKEN,
  TABLES_REPOSITORY_TOKEN,
  TABLES_SERVICE_TOKEN,
  WS_HUB_TOKEN,
} from './injection-tokens';
import { envFactory } from './env';
import {
  ChatServiceImpl,
  EtlServiceImpl,
  JsonMapperServiceImpl,
  MessagesServiceImpl,
  PlayersServiceImpl,
  TablesServiceImpl,
} from './services';

import { DbManagerImpl, MessagesRepositoryImpl, PlayersRepository, TablesRepository } from './persistence';
import { EventsChannelImpl } from './events';
import { WsHubImpl } from './ws';

export const providers: Provider[] = [
  { provide: ENV_TOKEN, useFactory: envFactory },
  { provide: JSON_MAPPER_SERVICE_TOKEN, useClass: JsonMapperServiceImpl },
  { provide: DB_MANAGER_TOKEN, useClass: DbManagerImpl },
  { provide: MESSAGES_REPOSITORY_TOKEN, useClass: MessagesRepositoryImpl },
  { provide: TABLES_REPOSITORY_TOKEN, useClass: TablesRepository },
  { provide: PLAYERS_REPOSITORY_TOKEN, useClass: PlayersRepository },
  { provide: EVENTS_CHANNEL_TOKEN, useClass: EventsChannelImpl },
  { provide: MESSAGES_SERVICE_TOKEN, useClass: MessagesServiceImpl },
  { provide: PLAYERS_SERVICE_TOKEN, useClass: PlayersServiceImpl },
  { provide: TABLES_SERVICE_TOKEN, useClass: TablesServiceImpl },
  { provide: ETL_SERVICE_TOKEN, useClass: EtlServiceImpl },
  { provide: CHAT_SERVICE_TOKEN, useClass: ChatServiceImpl },
  { provide: WS_HUB_TOKEN, useClass: WsHubImpl },
];
