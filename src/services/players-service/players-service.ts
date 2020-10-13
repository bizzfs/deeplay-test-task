import { Observable } from 'rxjs';
import { PlayerModel, PlayerTableRelationModel } from '../../persistence';

export interface PlayersService {
  /**
   * Get player by a given id
   * @param id player id
   * @return Observable<PlayerModel>
   */
  getById(id: string): Observable<PlayerModel>;

  /**
   * Get all players
   * @return Observable<PlayerModel[]>
   */
  getAll(): Observable<PlayerModel[]>;

  /**
   * Store relation
   * @param playerId player id
   * @param tableId table id
   * @return Observable<void>;
   */
  storeRelation(playerId: string, tableId: string): Observable<PlayerTableRelationModel>;

  /**
   * CLear relations
   */
  clearRelations(): Observable<void>
}
