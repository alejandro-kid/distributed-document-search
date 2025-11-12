import { LoginOrRegisterUseCase } from '@/contexts/users/application/LoginOrRegisterUseCase';
import { PostgresUserRepository } from '@/contexts/users/infrastructure/persistence/PostgresUserRepository';
import { LoginXController } from '@/controllers/LoginXController';
import { ContainerBuilder, Reference } from 'node-dependency-injection';
import { MockSocialAuthenticator } from '../../../tests/mocks/MockSocialAuthenticator';

export const register = (container: ContainerBuilder) => {
  container.register('Users.application.SocialAuthenticator', MockSocialAuthenticator);

  container
    .register('Users.infrastructure.PostgresUserRepository', PostgresUserRepository)
    .addArgument(new Reference('Shared.infrastructure.PostgresConnectionManager'));

  container
    .register('Users.application.LoginOrRegisterUseCase', LoginOrRegisterUseCase)
    .addArgument(new Reference('Users.application.SocialAuthenticator'))
    .addArgument(new Reference('Users.infrastructure.PostgresUserRepository'))
    .addArgument(new Reference('Shared.infrastructure.auth.JwtService'));

  container
    .register('Controllers.LoginXController', LoginXController)
    .addArgument(new Reference('Users.application.LoginOrRegisterUseCase'));
};
