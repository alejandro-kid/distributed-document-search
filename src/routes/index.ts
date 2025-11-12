import { logger } from '@/logger';
import { Router } from 'express';
import { globSync } from 'glob';
import { ContainerBuilder } from 'node-dependency-injection';
import path from 'path';

export async function registerRoutes(router: Router, container: ContainerBuilder): Promise<void> {
  // Agregar ruta raíz
  router.get('/', (_req, res) => {
    res.json({ message: 'Backend API is running', status: 'OK' });
  });

  const routes = globSync(`${__dirname}/**/*.route.*`);
  for (const routePath of routes) {
    await register(routePath, router, container);
  }
}

async function register(routePath: string, router: Router, container: ContainerBuilder) {
  try {
    const { register }: { register: (router: Router, container: ContainerBuilder) => void } = await import(routePath);
    register(router, container);

    const routeName = getRouteName(routePath);
    logger.info(`Registered route: ${routeName}`);

    checkSwaggerDefinition(routePath, routeName);
  } catch (error) {
    logger.error(`Failed to load route at ${routePath}:${error}`);
  }
}

function getRouteName(routePath: string): string {
  return path.basename(routePath, path.extname(routePath)).replace('.route', '');
}

function checkSwaggerDefinition(routePath: string, routeName: string): void {
  const swaggerFilePaths = [
    routePath.replace('.route.', '.swagger.').replace(/\.[^/.]+$/, '.yaml'),
    routePath.replace('.route.', '.swagger.').replace(/\.[^/.]+$/, '.yml'),
  ];

  const foundSwagger = swaggerFilePaths.some((swaggerFilePath) => {
    try {
      require.resolve(swaggerFilePath);
      logger.info(
        `Found corresponding swagger definition for route: ${routeName} (${path.extname(swaggerFilePath).slice(1)})`,
      );
      return true;
    } catch {
      return false;
    }
  });

  if (!foundSwagger) {
    logger.error(`No swagger definition found for route: ${routeName}`);
  }
}
