import { MessageModel } from './index';

export type MessagesFeedValue = { message: MessageModel | undefined; error: Error | undefined };
