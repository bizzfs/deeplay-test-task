import { Observable } from 'rxjs';
import { PlayerModel } from '../../persistence';

export interface PlayersService {
  /**
   * Get player by a given id
   * @param id player id
   * @return PlayerModel
   */
  getById(id: string): Observable<PlayerModel>;

  /**
   * Get all players
   * @return PlayerModel[]
   */
  getAll(): Observable<PlayerModel[]>;
}
