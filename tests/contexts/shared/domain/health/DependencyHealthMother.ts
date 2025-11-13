import { DependencyHealth } from '@/shared/domain/health/DependencyHealth';
import { DependencyStatusMother } from './DependencyStatusMother';

export class DependencyHealthMother {
  static create(name: string = 'postgresql', status: string = 'up', message: string = 'Healthy'): DependencyHealth {
    return new DependencyHealth(name, DependencyStatusMother.create(status), message);
  }

  static postgresqlUp(): DependencyHealth {
    return DependencyHealth.up('postgresql', 'Database connection successful');
  }

  static postgresqlDown(): DependencyHealth {
    return DependencyHealth.down('postgresql', 'Database connection failed');
  }
}
