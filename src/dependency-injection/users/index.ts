import { LoginOrRegisterUseCase } from '@/contexts/users/application/LoginOrRegisterUseCase';
import { XAuthenticator } from '@/contexts/users/infrastructure/auth/XAuthenticator';
import { PostgresUserRepository } from '@/contexts/users/infrastructure/persistence/PostgresUserRepository';
import { LoginXController } from '@/controllers/LoginXController';
import { ContainerBuilder, Reference } from 'node-dependency-injection';

export const register = (container: ContainerBuilder) => {
  container.register('Users.infrastructure.auth.XAuthenticator', XAuthenticator);

  container
    .register('Users.infrastructure.PostgresUserRepository', PostgresUserRepository)
    .addArgument(new Reference('Shared.infrastructure.PostgresConnectionManager'));

  container
    .register('Users.application.LoginOrRegisterUseCase', LoginOrRegisterUseCase)
    .addArgument(new Reference('Users.infrastructure.auth.XAuthenticator'))
    .addArgument(new Reference('Users.infrastructure.PostgresUserRepository'))
    .addArgument(new Reference('Shared.infrastructure.auth.JwtService'));

  container
    .register('Controllers.LoginXController', LoginXController)
    .addArgument(new Reference('Users.application.LoginOrRegisterUseCase'));
};
