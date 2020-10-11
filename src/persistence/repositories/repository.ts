import { Observable } from 'rxjs';

export interface Repository<T extends { id: string | null }> {
  /**
   * Insert single entities
   * @param model
   * @return Observable<T>
   */
  create(model: T): Observable<T>;

  /**
   * Insert multiple entities
   * @param models
   * @return Observable<T[]>
   */
  createMultiple(models: T[]): Observable<T[]>;

  /**
   * Get entities by id
   * @param id
   * @return Observable<T>
   */
  getById(id: string): Observable<T>;

  /**
   * Get multiple entities by a given list of ids
   * @param ids
   * @return Observable<T>
   */
  getByIds(ids: string[]): Observable<T[]>;

  /**
   * Get all entities
   * @return Observable<T[]>
   */
  getAll(): Observable<T[]>;

  /**
   * Count all entities
   * @return number
   */
  countAll(): Observable<number>;

  /**
   * Delete entity by a given id
   * @param id
   * @return Observable<void>
   */
  deleteById(id: string): Observable<void>;

  /**
   * Delete multiple entities by a given list of ids
   * @param ids
   * @return Observable<void>
   */
  deleteByIds(ids: string[]): Observable<void>;

  /**
   * Delete all entities
   * @return Observable<void>
   */
  deleteAll(): Observable<void>;
}
