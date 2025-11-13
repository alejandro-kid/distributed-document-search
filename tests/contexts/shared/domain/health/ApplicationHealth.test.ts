import { ApplicationHealth } from '@/shared/domain/health/ApplicationHealth';
import { DependencyHealthMother } from './DependencyHealthMother';

describe('ApplicationHealth', () => {
  describe('status', () => {
    it('should be healthy when all dependencies are up', () => {
      const deps = new Map();
      deps.set('postgresql', DependencyHealthMother.postgresqlUp());

      const health = new ApplicationHealth(new Date(), 60000, '1.0.0', deps);
      expect(health.status).toBe('healthy');
    });

    it('should be unhealthy when any dependency is down', () => {
      const deps = new Map();
      deps.set('postgresql', DependencyHealthMother.postgresqlDown());

      const health = new ApplicationHealth(new Date(), 60000, '1.0.0', deps);
      expect(health.status).toBe('unhealthy');
    });
  });

  describe('getHttpStatusCode', () => {
    it('should return 200 when healthy', () => {
      const deps = new Map();
      deps.set('postgresql', DependencyHealthMother.postgresqlUp());

      const health = new ApplicationHealth(new Date(), 60000, '1.0.0', deps);
      expect(health.getHttpStatusCode()).toBe(200);
    });

    it('should return 503 when unhealthy', () => {
      const deps = new Map();
      deps.set('postgresql', DependencyHealthMother.postgresqlDown());

      const health = new ApplicationHealth(new Date(), 60000, '1.0.0', deps);
      expect(health.getHttpStatusCode()).toBe(503);
    });
  });

  describe('toPrimitives', () => {
    it('should convert to primitives with correct structure', () => {
      const now = new Date();
      const dependencies = new Map();
      dependencies.set('postgresql', DependencyHealthMother.postgresqlUp());

      const health = new ApplicationHealth(now, 60000, '1.0.0', dependencies);
      const primitives = health.toPrimitives();

      expect(primitives.status).toBe('healthy');
      expect(primitives.timestamp).toBe(now.toISOString());
      expect(primitives.uptime).toBe(60); // 60000ms = 60s
      expect(primitives.version).toBe('1.0.0');
      const depsObj = primitives.dependencies as Record<string, unknown>;
      expect(depsObj.postgresql).toBeDefined();
    });

    it('should convert uptime from milliseconds to seconds', () => {
      const deps = new Map();
      deps.set('postgresql', DependencyHealthMother.postgresqlUp());

      const health = new ApplicationHealth(new Date(), 120000, '1.0.0', deps);
      const primitives = health.toPrimitives();

      expect(primitives.uptime).toBe(120);
    });
  });

  describe('fromPrimitives', () => {
    it('should reconstruct from primitives', () => {
      const data = {
        status: 'healthy',
        timestamp: '2025-01-13T10:30:00.000Z',
        uptime: 60,
        version: '1.0.0',
        dependencies: {
          postgresql: { status: 'up', message: 'Connection ok' },
        },
      };

      const health = ApplicationHealth.fromPrimitives(data);

      expect(health.status).toBe('healthy');
      expect(health.version).toBe('1.0.0');
      expect(health.dependencies.get('postgresql')).toBeDefined();
    });
  });
});
