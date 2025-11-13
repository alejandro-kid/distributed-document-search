import { DependencyStatus } from '@/shared/domain/health/DependencyStatus';

describe('DependencyStatus', () => {
  describe('create', () => {
    it('should create a valid status with UP value', () => {
      const status = new DependencyStatus(DependencyStatus.UP);
      expect(status.value).toBe(DependencyStatus.UP);
    });

    it('should create a valid status with DOWN value', () => {
      const status = new DependencyStatus(DependencyStatus.DOWN);
      expect(status.value).toBe(DependencyStatus.DOWN);
    });

    it('should throw error for invalid status', () => {
      expect(() => {
        new DependencyStatus('invalid');
      }).toThrow();
    });
  });

  describe('factory methods', () => {
    it('should create UP status using static method', () => {
      const status = DependencyStatus.up();
      expect(status.isUp()).toBe(true);
      expect(status.isDown()).toBe(false);
    });

    it('should create DOWN status using static method', () => {
      const status = DependencyStatus.down();
      expect(status.isDown()).toBe(true);
      expect(status.isUp()).toBe(false);
    });
  });

  describe('predicates', () => {
    it('should correctly identify UP status', () => {
      const status = DependencyStatus.up();
      expect(status.isUp()).toBe(true);
    });

    it('should correctly identify DOWN status', () => {
      const status = DependencyStatus.down();
      expect(status.isDown()).toBe(true);
    });
  });
});
