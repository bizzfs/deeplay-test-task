import { Inject } from 'injection-js';
import { Observable } from 'rxjs';

import { FeedSubscription } from '../types';
import { MessageModel, MessagesRepository } from '../../persistence';
import { MESSAGES_REPOSITORY_TOKEN } from '../../injection-tokens';
import { MessagesService } from './messages-service';

export class MessagesServiceImpl implements MessagesService {
  public readonly feed$ = this.messagesRepository.feed$;

  constructor(@Inject(MESSAGES_REPOSITORY_TOKEN) private readonly messagesRepository: MessagesRepository) {}

  public create(model: MessageModel): Observable<MessageModel> {
    return this.messagesRepository.create(model);
  }

  public getByTableId(tableId: string): Observable<MessageModel[]> {
    return this.messagesRepository.getByTableId(tableId);
  }

  public subscribe(tableId: string): FeedSubscription {
    const unsubscribeFunc = this.messagesRepository.subscribe(tableId);
    return { close: unsubscribeFunc };
  }
}
