import dotenv from 'dotenv';
import 'reflect-metadata';
import { ReflectiveInjector } from 'injection-js';

import { CHAT_SERVICE_TOKEN, DB_MANAGER_TOKEN, ETL_SERVICE_TOKEN, WS_HUB_TOKEN } from './injection-tokens';
import { ChatService } from './services';
import { providers } from './providers';
import { DbManager } from './persistence';
import { WsHub } from './ws';

dotenv.config();

const injector = ReflectiveInjector.resolveAndCreate(providers);
const cm = injector.get(DB_MANAGER_TOKEN) as DbManager;

cm.init().subscribe(() => {
  const chat = injector.get(CHAT_SERVICE_TOKEN) as ChatService;
  const ws = injector.get(WS_HUB_TOKEN) as WsHub;

  ws.start();
  chat.start();
});
