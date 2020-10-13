import { Observable } from 'rxjs';
import { PlayerTableRelationModel, TableModel } from '../../persistence';

export interface TablesService {
  /**
   * Get table by a given id
   * @param id table id
``   * @return Observable<TableModel>
   */
  getByIdWithPlayers(id: string): Observable<TableModel>;

  /**
   * Get all tables
   * @return Observable<TableModel[]
   */
  getAll(): Observable<TableModel[]>;

  /**
   * Store relation
   * @param tableId table id
   * @param playerId player id
   * @return Observable<void>;
   */
  storeRelation(tableId: string, playerId: string): Observable<PlayerTableRelationModel>;

  /**
   * Clear relations
   */
  clearRelations(): Observable<void>;
}
