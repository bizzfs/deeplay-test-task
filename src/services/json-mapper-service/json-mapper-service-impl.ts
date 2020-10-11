import { JsonConvert, ValueCheckingMode } from 'json2typescript';
import { JsonMapperService } from './json-mapper-service';

export class JsonMapperServiceImpl implements JsonMapperService {
  private readonly jsonConvert: JsonConvert;
  constructor() {
    this.jsonConvert = new JsonConvert();
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL;
  }

  public deserializeObject<T>(
    json: any,
    classReference: {
      new (): T;
    }
  ): T {
    try {
      return this.jsonConvert.deserializeObject(json, classReference);
    } catch (e) {
      console.error(e);
      return new classReference();
    }
  }

  public deserializeArray<T>(
    json: any[],
    classReference: {
      new (): T;
    }
  ): T[] {
    try {
      return this.jsonConvert.deserializeArray(json, classReference);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public serializeObject<T>(data: T): any {
    try {
      return this.jsonConvert.serializeObject(data);
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  public serializeArray<T>(data: T[]): any[] {
    try {
      return this.jsonConvert.serializeArray(data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
