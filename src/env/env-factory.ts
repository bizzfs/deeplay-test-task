import { Env } from './env';

export function envFactory(): Env {
  return {
    env: process.env.PRODUCTION ? 'prod' : 'dev',
    port: process.env.APP_PORT && !Number.isNaN(+process.env.APP_PORT) ? +process.env.APP_PORT : 3000,
    db: {
      host: process.env.DB_HOST || '',
      port: process.env.DB_PORT && !Number.isNaN(process.env.DB_PORT) ? +process.env.DB_PORT : 0,
      db: process.env.DB_NAME || 'test',
    },
  };
}
