export enum EventTypes {
  MESSAGE_SEND = 'message.send',
  PLAYER_ONLINE = 'player.online',
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

// Not used at the moment
export class PlayerOnline {
  public readonly type = EventTypes.PLAYER_ONLINE;
  constructor(
    public readonly data: {
      timestamp: number | null;
      playerId: string | null;
      tableId: string | null;
    }
  ) {}
}

export type Event = MessageSend | PlayerOnline;
