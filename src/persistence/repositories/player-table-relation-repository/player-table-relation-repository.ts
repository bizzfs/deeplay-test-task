import { Inject } from 'injection-js';

import { JSON_MAPPER_SERVICE_TOKEN } from '../../../injection-tokens';
import { JsonMapperService } from '../../../services';
import { RepositoryImpl } from '../repository-impl';
import { PlayerTableRelationModel, Repository } from '../..';

export class PlayerTableRelationsRepository
  extends RepositoryImpl<PlayerTableRelationModel>
  implements Repository<PlayerTableRelationModel> {
  constructor(@Inject(JSON_MAPPER_SERVICE_TOKEN) jsonMapperService: JsonMapperService) {
    super(jsonMapperService, PlayerTableRelationModel);
  }
}
