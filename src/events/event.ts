export enum EventTypes {
  MESSAGE_SEND = 'message.send',
}

export class MessageSend {
  public readonly type = EventTypes.MESSAGE_SEND;
  constructor(
    public readonly data: {
      message: string | null;
      timestamp: number | null;
      playerId: string | null;
      tableId: string | null;
    }
  ) {}
}

export type Event = MessageSend;
