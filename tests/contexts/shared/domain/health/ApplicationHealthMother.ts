import { ApplicationHealth } from '@/shared/domain/health/ApplicationHealth';
import { DependencyHealthMother } from './DependencyHealthMother';

export class ApplicationHealthMother {
  static create(timestamp: Date = new Date(), uptime: number = 60000, version: string = '1.0.0'): ApplicationHealth {
    const dependencies = new Map();
    dependencies.set('postgresql', DependencyHealthMother.postgresqlUp());

    return new ApplicationHealth(timestamp, uptime, version, dependencies);
  }

  static healthy(): ApplicationHealth {
    return this.create();
  }

  static unhealthy(): ApplicationHealth {
    const dependencies = new Map();
    dependencies.set('postgresql', DependencyHealthMother.postgresqlDown());

    return new ApplicationHealth(new Date(), 60000, '1.0.0', dependencies);
  }
}
