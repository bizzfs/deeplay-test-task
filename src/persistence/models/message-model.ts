import { JsonObject, JsonProperty } from 'json2typescript';

import { Model } from '../utils/model-decorator';
import { PlayerModel } from './player-model';
import { TableModel } from './table-model';

@Model({ table: 'messages' })
@JsonObject('MessageModel')
export class MessageModel {
  @JsonProperty('id', String, true)
  public id: string | null = null;
  @JsonProperty('message', String)
  public message: string | null = null;
  @JsonProperty('timestamp', Number)
  public timestamp: number | null = null;
  @JsonProperty('player_id', String)
  public playerId: string | null = null;
  @JsonProperty('player', PlayerModel, true)
  public player: PlayerModel | null = null;
  @JsonProperty('table_id', String)
  public tableId: string | null = null;
  @JsonProperty('table', TableModel, true)
  public table: TableModel | null = null;
}
