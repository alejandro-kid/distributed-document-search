import { HealthCheckService } from '@/shared/domain/health/HealthCheckService';
import { ApplicationHealth } from '@/shared/domain/health/ApplicationHealth';
import { PostgreSQLHealthChecker } from './PostgreSQLHealthChecker';
import { PackageVersion } from '@/shared/infrastructure/persistence/PackageVersion';

export class HealthCheckServiceImpl implements HealthCheckService {
  private startTime: number;

  constructor(
    private readonly postgresqlHealthChecker: PostgreSQLHealthChecker,
    private readonly packageVersion: PackageVersion,
  ) {
    this.startTime = Date.now();
  }

  async checkHealth(): Promise<ApplicationHealth> {
    const timestamp = new Date();
    const uptime = Date.now() - this.startTime;

    // Check all dependencies in parallel
    const [postgresqlHealth] = await Promise.all([this.postgresqlHealthChecker.check()]);

    // Build dependencies map
    const dependencies = new Map();
    dependencies.set('postgresql', postgresqlHealth);

    return new ApplicationHealth(timestamp, uptime, this.packageVersion.get(), dependencies);
  }
}
