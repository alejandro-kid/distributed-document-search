import { DependencyStatus } from './DependencyStatus';

export class DependencyHealth {
  readonly name: string;
  readonly status: DependencyStatus;
  readonly message: string;

  constructor(name: string, status: DependencyStatus, message: string) {
    this.name = name;
    this.status = status;
    this.message = message;
  }

  static up(name: string, message: string = 'Dependency is healthy'): DependencyHealth {
    return new DependencyHealth(name, DependencyStatus.up(), message);
  }

  static down(name: string, message: string = 'Dependency is unavailable'): DependencyHealth {
    return new DependencyHealth(name, DependencyStatus.down(), message);
  }

  toPrimitives(): Record<string, string> {
    return {
      status: this.status.value,
      message: this.message,
    };
  }

  static fromPrimitives(name: string, data: Record<string, string>): DependencyHealth {
    return new DependencyHealth(name, new DependencyStatus(data.status), data.message);
  }
}
