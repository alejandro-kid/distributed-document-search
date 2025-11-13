import { DependencyHealth } from './DependencyHealth';

export class ApplicationHealth {
  readonly timestamp: Date;
  readonly uptime: number; // milliseconds since start
  readonly version: string;
  readonly dependencies: Map<string, DependencyHealth>;

  constructor(timestamp: Date, uptime: number, version: string, dependencies: Map<string, DependencyHealth>) {
    this.timestamp = timestamp;
    this.uptime = uptime;
    this.version = version;
    this.dependencies = dependencies;
  }

  get status(): 'healthy' | 'unhealthy' {
    // Health is unhealthy if any critical dependency is down
    for (const dep of this.dependencies.values()) {
      if (dep.status.isDown()) {
        return 'unhealthy';
      }
    }
    return 'healthy';
  }

  getHttpStatusCode(): number {
    return this.status === 'healthy' ? 200 : 503;
  }

  toPrimitives(): Record<string, unknown> {
    const deps: Record<string, Record<string, string>> = {};

    for (const [name, dep] of this.dependencies.entries()) {
      deps[name] = dep.toPrimitives();
    }

    return {
      status: this.status,
      timestamp: this.timestamp.toISOString(),
      uptime: Math.floor(this.uptime / 1000), // Convert to seconds
      version: this.version,
      dependencies: deps,
    };
  }

  static fromPrimitives(data: Record<string, unknown>): ApplicationHealth {
    const deps = new Map<string, DependencyHealth>();

    if (data.dependencies && typeof data.dependencies === 'object') {
      for (const [name, depData] of Object.entries(data.dependencies)) {
        deps.set(name, DependencyHealth.fromPrimitives(name, depData as Record<string, string>));
      }
    }

    return new ApplicationHealth(
      new Date(data.timestamp as string),
      (data.uptime as number) * 1000, // Convert from seconds to milliseconds
      data.version as string,
      deps,
    );
  }
}
