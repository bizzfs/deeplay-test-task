import { Inject } from 'injection-js';

import { JSON_MAPPER_SERVICE_TOKEN } from '../../../injection-tokens';
import { JsonMapperService } from '../../../services';
import { RepositoryImpl } from '../repository-impl';
import { Repository } from '../repository';
import { TableModel } from '../..';

export class TablesRepository extends RepositoryImpl<TableModel> implements Repository<TableModel> {
  constructor(@Inject(JSON_MAPPER_SERVICE_TOKEN) jsonMapperService: JsonMapperService) {
    super(jsonMapperService, TableModel);
  }
}
