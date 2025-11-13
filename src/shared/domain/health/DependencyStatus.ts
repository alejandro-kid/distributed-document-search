import { StringValueObject } from '@/contexts/shared/domain/StringValueObject';

export class DependencyStatus extends StringValueObject {
  static readonly UP = 'up';
  static readonly DOWN = 'down';

  private static readonly VALID_STATUSES = [DependencyStatus.UP, DependencyStatus.DOWN];

  constructor(value: string) {
    super(value);
    this.ensureIsValid(value);
  }

  private ensureIsValid(value: string): void {
    if (!DependencyStatus.VALID_STATUSES.includes(value)) {
      throw new Error(`Invalid dependency status: ${value}`);
    }
  }

  static up(): DependencyStatus {
    return new DependencyStatus(DependencyStatus.UP);
  }

  static down(): DependencyStatus {
    return new DependencyStatus(DependencyStatus.DOWN);
  }

  isUp(): boolean {
    return this.value === DependencyStatus.UP;
  }

  isDown(): boolean {
    return this.value === DependencyStatus.DOWN;
  }
}
