import { HealthCheckService } from '@/shared/domain/health/HealthCheckService';
import { HealthStatusResponse } from './HealthStatusResponse';

export class GetHealthStatusUseCase {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  async run(): Promise<HealthStatusResponse> {
    const applicationHealth = await this.healthCheckService.checkHealth();

    return HealthStatusResponse.fromDomain(applicationHealth);
  }
}
