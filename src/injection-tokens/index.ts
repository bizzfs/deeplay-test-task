import { InjectionToken } from 'injection-js';

import { Env } from '../env';
import { DbManager, MessagesRepository, PlayerModel, Repository, TableModel } from '../persistence';
import { EtlService, JsonMapperService, MessagesService, PlayersService, TablesService } from '../services';
import { EventsChannel } from '../events';
import { WsHub } from '../ws';

export const ENV_TOKEN = new InjectionToken<Env>('EnvToken');
export const DB_MANAGER_TOKEN = new InjectionToken<DbManager>('ConnectionManagerToken');
export const MESSAGES_REPOSITORY_TOKEN = new InjectionToken<MessagesRepository>('MessagesRepositoryToken');
export const PLAYERS_REPOSITORY_TOKEN = new InjectionToken<Repository<PlayerModel>>('PlayersRepositoryToken');
export const TABLES_REPOSITORY_TOKEN = new InjectionToken<Repository<TableModel>>('TablesRepositoryToken');
export const EVENTS_CHANNEL_TOKEN = new InjectionToken<EventsChannel>('EventsChannelToken');
export const JSON_MAPPER_SERVICE_TOKEN = new InjectionToken<JsonMapperService>('JsonMapperServiceInjectionToken');
export const MESSAGES_SERVICE_TOKEN = new InjectionToken<MessagesService>('MessagesServiceToken');
export const PLAYERS_SERVICE_TOKEN = new InjectionToken<PlayersService>('PlayersServiceToken');
export const TABLES_SERVICE_TOKEN = new InjectionToken<TablesService>('TablesServiceToken');
export const ETL_SERVICE_TOKEN = new InjectionToken<EtlService>('EtlServiceToken');
export const CHAT_SERVICE_TOKEN = new InjectionToken<EtlService>('ChatServiceToken');
export const WS_HUB_TOKEN = new InjectionToken<WsHub>('WsHubToken');
