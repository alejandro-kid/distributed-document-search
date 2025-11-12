import { NODE_ENV } from '@/config';
import { ContainerBuilder } from 'node-dependency-injection';

let containerInstance: ContainerBuilder | null = null;

export const getContainer = async (): Promise<ContainerBuilder> => {
  if (!containerInstance) {
    containerInstance = await configureContainer();
  }
  return containerInstance;
};

const configureContainer = async (): Promise<ContainerBuilder> => {
  const container = new ContainerBuilder();

  switch (NODE_ENV) {
    case 'production': {
      const { default: register } = await import('./application_production');
      register(container);
      break;
    }
    case 'test': {
      const { default: registerTEST } = await import('./application_test');
      registerTEST(container);
      break;
    }
    default: {
      const { default: registerDEV } = await import('./application_dev');
      registerDEV(container);
      break;
    }
  }

  await container.compile(); // Compile the container after all definitions are registered

  return container;
};

// Para compatibilidad con el código existente
// Exportamos una promesa del contenedor para que pueda ser await-eado
const containerPromise = getContainer();
export default containerPromise;
