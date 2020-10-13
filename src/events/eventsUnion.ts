export enum EventTypes {
  MESSAGE_SEND = 'message.send',
  PLAYER_TAKES_SEAT = 'player.take_seat',
}

export class MessageSend {
  public readonly type = EventTypes.MESSAGE_SEND;
  constructor(
    public readonly data: {
      message: string | null;
      playerId: string | null;
      tableId: string | null;
      timestamp: number | null;
    }
  ) {}
}

export class PlayerTakesSeat {
  public readonly type = EventTypes.PLAYER_TAKES_SEAT;
  constructor(
    public readonly data: {
      seat: number;
      playerId: string | null;
      tableId: string | null;
      timestamp: number | null;
    }
  ) {}
}

export type EventsUnion = MessageSend | PlayerTakesSeat;
