import { Observable } from 'rxjs';
import { TableModel } from '../../persistence';

export interface TablesService {
  /**
   * Get table by a given id
   * @param id table id
   * @return TableModel
   */
  getById(id: string): Observable<TableModel>;

  /**
   * Get all tables
   * @return TableModel[] tables
   */
  getAll(): Observable<TableModel[]>;
}
