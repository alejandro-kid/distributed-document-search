import { ContainerBuilder } from 'node-dependency-injection';
import registerApps from './apps';
import { register as registerShared } from './shared';
import { register as registerUserMock } from './users/mock';

const register = (container: ContainerBuilder) => {
  registerShared(container);
  registerApps(container);
  registerUserMock(container);
};

export default register;
