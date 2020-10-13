import { from, Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { r, RDatum, WriteResult } from 'rethinkdb-ts';

import { cleanNullProps } from '../../services/utils';
import { JsonMapperService } from '../../services';
import { Repository } from './repository';

export class RepositoryImpl<T extends { id: string | null }> implements Repository<T> {
  protected readonly table: string;

  constructor(protected readonly jsonMapperService: JsonMapperService, protected readonly modelClass: { new (): T }) {
    if (!modelClass.prototype.table) throw new Error('provided invalid model class');
    this.table = modelClass.prototype.table;
  }

  public create(model: T): Observable<T> {
    return from(r.table(this.table).insert(this.jsonMapperService.serializeObject(model)).run()).pipe(
      map((res) => {
        model.id = this.parseGeneratedId(res);
        return model;
      })
    );
  }

  protected parseGeneratedId(res: WriteResult<any>): string {
    if (!res.generated_keys || res.generated_keys.length !== 1) throw new Error('id was not generated');
    return res.generated_keys[0];
  }

  public createMultiple(models: T[]): Observable<T[]> {
    return from(r.table(this.table).insert(this.jsonMapperService.serializeArray(models)).run()).pipe(
      map((res) =>
        this.parseGeneratedIds(res, models.length).reduce((arr, id, i) => {
          models[i].id = id;
          arr[i] = models[i];
          return arr;
        }, [] as T[])
      )
    );
  }

  protected parseGeneratedIds(res: WriteResult<any>, count: number): string[] {
    if (!res.generated_keys || res.generated_keys.length !== count) throw new Error('some ids were not generated');
    return res.generated_keys;
  }

  public update(model: T): Observable<T> {
    if (model.id) throw new Error('no id was provided');
    return from(r.table(this.table).insert(this.jsonMapperService.serializeObject(model)).run()).pipe(
      map((res) => {
        return model;
      })
    );
  }

  public updateMultiple(models: T[]): Observable<T[]> {
    if (models.map((item) => item.id).filter((id) => id).length !== models.length)
      throw new Error('some ids were not provided');
    return from(r.table(this.table).insert(this.jsonMapperService.serializeArray(models)).run()).pipe(
      map((res) => {
        return models;
      })
    );
  }

  public getById(id: string): Observable<T> {
    return from(r.table(this.table).filter(r.row('id').eq(id)).run()).pipe(
      map((res) => this.jsonMapperService.deserializeObject(this.parseObj(res), this.modelClass))
    );
  }

  protected parseObj(res: any[]): any {
    if (res.length !== 1) throw new Error('invalid number of results');
    return res[0];
  }

  public getByIds(ids: string[]): Observable<T[]> {
    return from(
      r
        .table(this.table)
        .filter((doc: RDatum) => r.expr(ids).contains(doc('id')))
        .run()
    ).pipe(map((res) => this.jsonMapperService.deserializeArray(this.parseObjs(res, ids.length), this.modelClass)));
  }

  protected parseObjs(res: any[], count: number): any[] {
    if (res.length !== count) throw new Error('invalid number of results');
    return res;
  }

  public getAll(): Observable<T[]> {
    return from(r.table(this.table).run()).pipe(
      map((res) => this.jsonMapperService.deserializeArray(res, this.modelClass))
    );
  }

  public countAll(): Observable<number> {
    return from(r.table(this.table).count().run());
  }

  public delete(model: T): Observable<void> {
    return from(
      r
        .table(this.table)
        .filter(cleanNullProps(this.jsonMapperService.serializeObject(model)))
        .delete()
        .run()
    ).pipe(map(() => {}));
  }

  public deleteById(id: string): Observable<void> {
    return from(r.table(this.table).filter(r.row('id').eq(id)).delete().run()).pipe(map(() => {}));
  }

  public deleteByIds(ids: string[]): Observable<void> {
    return from(
      r
        .table(this.table)
        .filter((doc: RDatum) => r.expr(ids).contains(doc('id')))
        .delete()
        .run()
    ).pipe(map(() => {}));
  }

  public deleteAll(): Observable<void> {
    return from(r.table(this.table).delete().run()).pipe(map(() => {}));
  }

  public find(model: T): Observable<T> {
    return from(
      r
        .table(this.table)
        .filter(cleanNullProps(this.jsonMapperService.serializeObject(model)))
        .run()
    ).pipe(
      map((res) => {
        if (res.length === 0) throw new Error('not found');
        return this.jsonMapperService.deserializeObject(res[0], this.modelClass);
      })
    );
  }

  public findMany(model: T): Observable<T[]> {
    return from(
      r
        .table(this.table)
        .filter(cleanNullProps(this.jsonMapperService.serializeObject(model)))
        .run()
    ).pipe(map((res) => this.jsonMapperService.deserializeArray(res, this.modelClass)));
  }

  public updateOrCreate(model: T): Observable<T> {
    return this.find(model).pipe(
      mergeMap((found) => {
        Object.assign(found, model);
        return this.update(found);
      }),
      catchError(() => this.create(model))
    );
  }
}
