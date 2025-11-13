import { GetHealthStatusUseCase } from '@/shared/application/get-health-status/GetHealthStatusUseCase';
import { HealthCheckService } from '@/shared/domain/health/HealthCheckService';
import { ApplicationHealthMother } from '../../domain/health/ApplicationHealthMother';

describe('GetHealthStatusUseCase', () => {
  let useCase: GetHealthStatusUseCase;
  let healthCheckServiceMock: jest.Mocked<HealthCheckService>;

  beforeEach(() => {
    healthCheckServiceMock = {
      checkHealth: jest.fn(),
    };
    useCase = new GetHealthStatusUseCase(healthCheckServiceMock);
  });

  describe('run', () => {
    it('should return health status when application is healthy', async () => {
      const expectedHealth = ApplicationHealthMother.healthy();
      healthCheckServiceMock.checkHealth.mockResolvedValue(expectedHealth);

      const response = await useCase.run();

      expect(response.status).toBe('healthy');
      expect(response.version).toBe('1.0.0');
      expect(response.dependencies).toBeDefined();
    });

    it('should return unhealthy status when database is down', async () => {
      const expectedHealth = ApplicationHealthMother.unhealthy();
      healthCheckServiceMock.checkHealth.mockResolvedValue(expectedHealth);

      const response = await useCase.run();

      expect(response.status).toBe('unhealthy');
      expect(response.dependencies.postgresql.status).toBe('down');
    });

    it('should include timestamp in response', async () => {
      const expectedHealth = ApplicationHealthMother.healthy();
      healthCheckServiceMock.checkHealth.mockResolvedValue(expectedHealth);

      const response = await useCase.run();

      expect(response.timestamp).toBeDefined();
      expect(typeof response.timestamp).toBe('string');
    });

    it('should include uptime in response', async () => {
      const expectedHealth = ApplicationHealthMother.healthy();
      healthCheckServiceMock.checkHealth.mockResolvedValue(expectedHealth);

      const response = await useCase.run();

      expect(typeof response.uptime).toBe('number');
      expect(response.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
