export interface Message {
  ok: boolean;
  data: any;
  errors: string[];
}

export function newHelpMessage(): string {
  const dto: Message = {
    ok: true,
    data: {
      commands: [
        'etl.start.{freq}',
        'etl.stop',
        'tables.get_list',
        'tables.get.{id}',
        'tables.subscribe.{id}',
        'tables.unsubscribe.{id}',
      ],
    },
    errors: [],
  };
  return JSON.stringify(dto);
}

export function newMessage(ok: boolean, errors: string[], data: any): string {
  const dto: Message = { ok, data, errors };
  return JSON.stringify(dto);
}
