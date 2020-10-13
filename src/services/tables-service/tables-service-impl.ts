import { Inject } from 'injection-js';
import { forkJoin, Observable } from 'rxjs';

import { PlayerModel, PlayerTableRelationModel, Repository, TableModel } from '../../persistence';
import {
  PLAYER_TABLE_RELATIONS_REPOSITORY_TOKEN,
  PLAYERS_REPOSITORY_TOKEN,
  TABLES_REPOSITORY_TOKEN,
} from '../../injection-tokens';
import { TablesService } from './tables-service';
import { map, mergeMap } from 'rxjs/operators';

export class TablesServiceImpl implements TablesService {
  constructor(
    @Inject(TABLES_REPOSITORY_TOKEN) private readonly tablesRepository: Repository<TableModel>,
    @Inject(PLAYER_TABLE_RELATIONS_REPOSITORY_TOKEN)
    private readonly playerTableRelationsRepository: Repository<PlayerTableRelationModel>,
    @Inject(PLAYERS_REPOSITORY_TOKEN)
    private readonly playersRepository: Repository<PlayerModel>
  ) {}

  public getByIdWithPlayers(id: string): Observable<TableModel> {
    const relation = new PlayerTableRelationModel();
    relation.tableId = id;
    return forkJoin([
      this.tablesRepository.getById(id),
      this.playerTableRelationsRepository
        .findMany(relation)
        .pipe(mergeMap((relations) => this.playersRepository.getByIds(relations.map((rel) => rel.playerId as string)))),
    ]).pipe(
      map(([table, players]) => {
        table.players = players;
        return table;
      })
    );
  }

  public getAll(): Observable<TableModel[]> {
    return this.tablesRepository.getAll();
  }

  public storeRelation(tableId: string, playerId: string): Observable<PlayerTableRelationModel> {
    const model = new PlayerTableRelationModel();
    model.playerId = playerId;
    model.tableId = tableId;
    return this.playerTableRelationsRepository.updateOrCreate(model);
  }

  public clearRelations(): Observable<void> {
    return this.playerTableRelationsRepository.deleteAll();
  }
}
