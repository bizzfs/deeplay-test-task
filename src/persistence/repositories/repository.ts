import { Observable } from 'rxjs';

export interface Repository<T extends { id: string | null }> {
  /**
   * Save single entity
   * @param model
   * @return Observable<T>
   */
  create(model: T): Observable<T>;

  /**
   * Save multiple entities
   * @param models
   * @return Observable<T[]>
   */
  createMultiple(models: T[]): Observable<T[]>;

  /**
   * Update single entity
   * @param model
   * @return Observable<T>
   */
  update(model: T): Observable<T>;

  /**
   * Update multiple entities
   * @param models
   * @return Observable<T[]>
   */
  updateMultiple(models: T[]): Observable<T[]>

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
   * Delete by nonnull fields
   * @param model
   */
  delete(model: T): Observable<void>;

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

  /**
   * Find single entity by a non null fields
   * @param model
   */
  find(model: T): Observable<T>;

  /**
   * Find entities by a non null fields
   * @param model
   */
  findMany(model: T): Observable<T[]>;

  /**
   * Update or create entity
   * @param model
   */
  updateOrCreate(model: T): Observable<T>;
}
