import { ApplicationHealth } from './ApplicationHealth';

export interface HealthCheckService {
  /**
   * Check the health status of the application and all dependencies
   */
  checkHealth(): Promise<ApplicationHealth>;
}
