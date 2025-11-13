import { ApplicationHealth } from '@/shared/domain/health/ApplicationHealth';

export class HealthStatusResponse {
  readonly status: 'healthy' | 'unhealthy';
  readonly timestamp: string;
  readonly uptime: number;
  readonly version: string;
  readonly dependencies: Record<string, Record<string, string>>;

  constructor(
    status: 'healthy' | 'unhealthy',
    timestamp: string,
    uptime: number,
    version: string,
    dependencies: Record<string, Record<string, string>>,
  ) {
    this.status = status;
    this.timestamp = timestamp;
    this.uptime = uptime;
    this.version = version;
    this.dependencies = dependencies;
  }

  static fromDomain(applicationHealth: ApplicationHealth): HealthStatusResponse {
    const primitives = applicationHealth.toPrimitives();

    return new HealthStatusResponse(
      primitives.status as 'healthy' | 'unhealthy',
      primitives.timestamp as string,
      primitives.uptime as number,
      primitives.version as string,
      primitives.dependencies as Record<string, Record<string, string>>,
    );
  }

  toPrimitives(): Record<string, unknown> {
    return {
      status: this.status,
      timestamp: this.timestamp,
      uptime: this.uptime,
      version: this.version,
      dependencies: this.dependencies,
    };
  }
}
