import { JsonObject, JsonProperty } from 'json2typescript';
import { Model } from '../utils/model-decorator';

@Model({ table: 'players_tables' })
@JsonObject('PlayerTableRelationModel')
export class PlayerTableRelationModel {
  @JsonProperty('id', String, true)
  public id: string | null = null;
  @JsonProperty('player_id', String)
  public playerId: string | null = null;
  @JsonProperty('table_id', String)
  public tableId: string | null = null;
}
