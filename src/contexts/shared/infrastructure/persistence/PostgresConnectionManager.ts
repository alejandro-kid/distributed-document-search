import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from '@/config';
import { Pool } from 'pg';

export class PostgresConnectionManager {
  private static pool: Pool;

  static getPool(): Pool {
    if (!PostgresConnectionManager.pool) {
      PostgresConnectionManager.pool = new Pool({
        user: DB_USER,
        host: DB_HOST,
        password: DB_PASSWORD,
        port: DB_PORT,
        database: DB_DATABASE,
      });
    }
    return PostgresConnectionManager.pool;
  }

  static async closePool(): Promise<void> {
    if (PostgresConnectionManager.pool) {
      await PostgresConnectionManager.pool.end();
      PostgresConnectionManager.pool = null as unknown as Pool;
    }
  }
}
