import { LoginXController } from '@/controllers/LoginXController';
import StatusGetController from '../../controllers/StatusGetController';
import { ContainerBuilder, Reference } from 'node-dependency-injection';
import { PostgreSQLHealthChecker } from '@/shared/infrastructure/health/PostgreSQLHealthChecker';
import { PackageVersion } from '@/shared/infrastructure/persistence/PackageVersion';
import { GetHealthStatusUseCase } from '@/shared/application/get-health-status/GetHealthStatusUseCase';
import { HealthCheckServiceImpl } from '@/shared/infrastructure/health/HealthCheckServiceImpl';

const register = (container: ContainerBuilder) => {
  container.register('Shared.infrastructure.PackageVersion', PackageVersion);

  container
    .register('Shared.infrastructure.PostgreSQLHealthChecker', PostgreSQLHealthChecker)
    .addArgument(new Reference('Shared.infrastructure.PostgresConnectionManager'));

  container
    .register('Shared.infrastructure.HealthCheckService', HealthCheckServiceImpl)
    .addArgument(new Reference('Shared.infrastructure.PostgreSQLHealthChecker'))
    .addArgument(new Reference('Shared.infrastructure.PackageVersion'));

  container
    .register('Shared.application.GetHealthStatusUseCase', GetHealthStatusUseCase)
    .addArgument(new Reference('Shared.infrastructure.HealthCheckService'));

  // Register StatusGetController
  container
    .register('Api.controllers.StatusGetController', StatusGetController)
    .addArgument(new Reference('Shared.application.GetHealthStatusUseCase'));

  container
    .register('Api.controllers.LoginXController', LoginXController)
    .addArgument(new Reference('Users.application.LoginOrRegisterUseCase'));
};

export default register;
