import { ContainerBuilder } from 'node-dependency-injection';
import registerApps from './apps';
import { register as registerShared } from './shared';
import { register as registerUserMock } from './users/mock';
import { register as registerDocuments } from './documents';

const register = (container: ContainerBuilder) => {
  registerShared(container);
  registerApps(container);
  registerUserMock(container);
  registerDocuments(container);
};

export default register;
