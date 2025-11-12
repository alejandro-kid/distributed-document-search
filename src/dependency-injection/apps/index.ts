import { LoginXController } from '@/controllers/LoginXController';
import StatusGetController from '../../controllers/StatusGetController';
import { ContainerBuilder, Reference } from 'node-dependency-injection';

const register = (container: ContainerBuilder) => {
  // Register StatusGetController
  container.register('Api.controllers.StatusGetController', StatusGetController);
  container
    .register('Api.controllers.LoginXController', LoginXController)
    .addArgument(new Reference('Users.application.LoginOrRegisterUseCase'));
};

export default register;
