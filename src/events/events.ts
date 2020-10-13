export enum EventTypes {
  MESSAGE_SEND = 'message.send',
  PLAYER_TAKES_SEAT = 'player.take_seat',
  RESET = 'reset',
}

export class MessageSend {
  public readonly type = EventTypes.MESSAGE_SEND;
  constructor(
    public readonly data: {
      message: string;
      playerId: string;
      tableId: string;
      timestamp: number;
    }
  ) {}
}

export class PlayerTakesSeat {
  public readonly type = EventTypes.PLAYER_TAKES_SEAT;
  constructor(
    public readonly data: {
      seat: number;
      playerId: string;
      tableId: string;
      timestamp: number;
    }
  ) {}
}

export class Reset {
  public readonly type = EventTypes.RESET;
}

export type Events = MessageSend | PlayerTakesSeat | Reset;
