import { JsonObject, JsonProperty } from 'json2typescript';

import { Model } from '../utils/model-decorator';
import { MessageModel } from './message-model';
import { PlayerModel } from './player-model';

@Model({ table: 'tables' })
@JsonObject('TableModel')
export class TableModel {
  @JsonProperty('id', String, true)
  public id: string | null = null;
  @JsonProperty('name', String)
  public name: string | null = null;
  public messages: MessageModel[] | null = null;
  public players: PlayerModel[] | null = null;
}
