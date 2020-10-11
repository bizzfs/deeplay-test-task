import { Inject } from 'injection-js';

import { JSON_MAPPER_SERVICE_TOKEN } from '../../../injection-tokens';
import { JsonMapperService } from '../../../services';
import { RepositoryImpl } from '../repository-impl';
import { Repository } from '../repository';
import { PlayerModel } from '../..';

export class PlayersRepository extends RepositoryImpl<PlayerModel> implements Repository<PlayerModel> {
  constructor(@Inject(JSON_MAPPER_SERVICE_TOKEN) jsonMapperService: JsonMapperService) {
    super(jsonMapperService, PlayerModel);
  }
}
