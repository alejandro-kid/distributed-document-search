import { ContainerBuilder } from 'node-dependency-injection';
import registerApps from './apps';
import { register as registerUsers } from './users';
import { register as registerDocuments } from './documents';
import { register as registerShared } from './shared';

const register = (container: ContainerBuilder) => {
  registerShared(container);
  registerApps(container);
  registerUsers(container);
  registerDocuments(container);
};

export default register;
