import { DependencyHealth } from '@/shared/domain/health/DependencyHealth';
import { DependencyStatus } from '@/shared/domain/health/DependencyStatus';

describe('DependencyHealth', () => {
  describe('create', () => {
    it('should create a dependency health object', () => {
      const dep = new DependencyHealth('postgresql', DependencyStatus.up(), 'Connection ok');
      expect(dep.name).toBe('postgresql');
      expect(dep.status.isUp()).toBe(true);
      expect(dep.message).toBe('Connection ok');
    });
  });

  describe('factory methods', () => {
    it('should create an UP dependency using static method', () => {
      const dep = DependencyHealth.up('postgresql', 'Database is healthy');
      expect(dep.status.isUp()).toBe(true);
      expect(dep.message).toBe('Database is healthy');
    });

    it('should create a DOWN dependency using static method', () => {
      const dep = DependencyHealth.down('postgresql', 'Database is unavailable');
      expect(dep.status.isDown()).toBe(true);
      expect(dep.message).toBe('Database is unavailable');
    });
  });

  describe('toPrimitives', () => {
    it('should convert to primitives correctly', () => {
      const dep = DependencyHealth.up('postgresql', 'Connection ok');
      const primitives = dep.toPrimitives();

      expect(primitives.status).toBe('up');
      expect(primitives.message).toBe('Connection ok');
    });
  });

  describe('fromPrimitives', () => {
    it('should reconstruct from primitives', () => {
      const data = { status: 'up', message: 'Connection ok' };
      const dep = DependencyHealth.fromPrimitives('postgresql', data);

      expect(dep.name).toBe('postgresql');
      expect(dep.status.isUp()).toBe(true);
      expect(dep.message).toBe('Connection ok');
    });
  });
});
