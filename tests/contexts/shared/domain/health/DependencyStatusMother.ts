import { DependencyStatus } from '@/shared/domain/health/DependencyStatus';

export class DependencyStatusMother {
  static create(value: string = DependencyStatus.UP): DependencyStatus {
    return new DependencyStatus(value);
  }

  static up(): DependencyStatus {
    return DependencyStatus.up();
  }

  static down(): DependencyStatus {
    return DependencyStatus.down();
  }
}
