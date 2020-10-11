import { JsonObject, JsonProperty } from 'json2typescript';
import { Model } from '../utils/model-decorator';

@Model({ table: 'players' })
@JsonObject('PlayerModel')
export class PlayerModel {
  @JsonProperty('id', String, true)
  public id: string | null = null;
  @JsonProperty('first_name', String)
  public firstName: string | null = null;
  @JsonProperty('last_name', String)
  public lastName: string | null = null;
  @JsonProperty('display_name', String)
  public displayName: string | null = null;
}
