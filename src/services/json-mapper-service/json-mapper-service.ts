export interface JsonMapperService {
  /**
   * Deserialize a single object
   * @param json
   * @param classReference
   * @return T
   */
  deserializeObject<T>(
    json: any,
    classReference: {
      new (): T;
    }
  ): T;

  /**
   * Deserialize an array of objects
   * @param json
   * @param classReference
   * @return T[]
   */
  deserializeArray<T>(
    json: any[],
    classReference: {
      new (): T;
    }
  ): T[];

  /**
   * Serialize a single object
   * @param data
   * @return any
   */
  serializeObject<T>(data: T): any;

  /**
   * Serialize an array of objects
   * @param data
   * @return any[]
   */
  serializeArray<T>(data: T[]): any[];
}
