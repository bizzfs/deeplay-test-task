import { Inject } from 'injection-js';
import { Observable } from 'rxjs';

import { PlayerModel, PlayerTableRelationModel, Repository } from '../../persistence';
import { PLAYER_TABLE_RELATIONS_REPOSITORY_TOKEN, PLAYERS_REPOSITORY_TOKEN } from '../../injection-tokens';
import { PlayersService } from './players-service';

export class PlayersServiceImpl implements PlayersService {
  constructor(
    @Inject(PLAYERS_REPOSITORY_TOKEN) private readonly playersRepository: Repository<PlayerModel>,
    @Inject(PLAYER_TABLE_RELATIONS_REPOSITORY_TOKEN)
    private readonly playerTableRelationsRepository: Repository<PlayerTableRelationModel>
  ) {}

  public getById(id: string): Observable<PlayerModel> {
    return this.playersRepository.getById(id);
  }

  public getAll(): Observable<PlayerModel[]> {
    return this.playersRepository.getAll();
  }

  public storeRelation(playerId: string, tableId: string): Observable<PlayerTableRelationModel> {
    const model = new PlayerTableRelationModel();
    model.playerId = playerId;
    model.tableId = tableId;
    return this.playerTableRelationsRepository.updateOrCreate(model);
  }

  clearRelations(): Observable<void> {
    return this.playerTableRelationsRepository.deleteAll();
  }
}
