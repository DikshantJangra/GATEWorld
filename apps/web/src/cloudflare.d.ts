declare module "cloudflare:workers" {
  interface D1Result {
    meta: { changes: number };
  }
  interface D1Statement {
    bind(...v: unknown[]): D1Statement;
    first<T>(): Promise<T | null>;
    run(): Promise<D1Result>;
  }
  interface R2Object {
    arrayBuffer(): Promise<ArrayBuffer>;
  }
  export const env: {
    DB: { prepare(sql: string): D1Statement };
    LIBRARY_IMG: {
      put(key: string, value: Uint8Array): Promise<unknown>;
      get(key: string): Promise<R2Object | null>;
      delete(key: string): Promise<void>;
    };
    ADMIN_TOKEN?: string;
  };
}
