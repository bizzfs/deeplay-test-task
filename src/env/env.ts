export interface Env {
  env: string;
  port: number;
  db: { host: string; port: number; db: string };
}
