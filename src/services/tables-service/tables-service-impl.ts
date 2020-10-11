import { Inject } from 'injection-js';
import { Observable } from 'rxjs';

import { Repository, TableModel } from '../../persistence';
import { TABLES_REPOSITORY_TOKEN } from '../../injection-tokens';
import { TablesService } from './tables-service';

export class TablesServiceImpl implements TablesService {
  constructor(@Inject(TABLES_REPOSITORY_TOKEN) private readonly tablesRepository: Repository<TableModel>) {}

  public getById(id: string): Observable<TableModel> {
    return this.tablesRepository.getById(id);
  }

  public getAll(): Observable<TableModel[]> {
    return this.tablesRepository.getAll();
  }
}
