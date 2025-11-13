import { DependencyHealth } from '@/shared/domain/health/DependencyHealth';
import { Pool } from 'pg';

export class PostgreSQLHealthChecker {
  constructor(private readonly pool: Pool) {}

  async check(): Promise<DependencyHealth> {
    try {
      // Test the connection with a simple query
      await this.pool.query('SELECT 1');
      return DependencyHealth.up('postgresql', 'Database connection successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return DependencyHealth.down('postgresql', `Database connection failed: ${message}`);
    }
  }
}
