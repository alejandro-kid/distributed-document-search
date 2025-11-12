import { logger } from '@/logger'; // Importar el logger
import express from 'express';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import YAML from 'js-yaml';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: express.Express): void {
  // Recopilar todos los archivos swagger YAML
  const swaggerFiles = globSync(`${__dirname}/**/*.swagger.@(yaml|yml)`);

  // Configuración base de Swagger (sin usar swagger-jsdoc)
  const baseSwaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'API Hexagonal',
      version: '1.0.0',
      description: 'Documentación de la API con arquitectura hexagonal',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
  };

  // Cargar y combinar todos los archivos YAML
  const combinedSwaggerDocs = swaggerFiles.reduce(
    (
      acc: {
        paths: Record<string, object>;
        components: Record<string, object>;
        tags: { name: string; description?: string }[];
      },
      filePath: string,
    ) => {
      try {
        const fileContent = readFileSync(filePath, 'utf8');
        const yamlDoc = YAML.load(fileContent) as {
          paths?: Record<
            string,
            {
              [method: string]: {
                summary?: string;
                description?: string;
                [key: string]: unknown;
              };
            }
          >;
          components?: Record<string, Record<string, unknown>>;
          tags?: { name: string; description?: string }[];
        };

        // Fusionar las definiciones de la API
        if (yamlDoc.paths) {
          acc.paths = { ...acc.paths, ...yamlDoc.paths };
        }

        // Fusionar los componentes (esquemas, respuestas, etc.)
        if (yamlDoc.components) {
          acc.components = acc.components || {};

          Object.keys(yamlDoc.components).forEach((componentType) => {
            acc.components[componentType] = {
              ...(acc.components[componentType] || {}),
              ...(yamlDoc.components?.[componentType] ?? {}),
            };
          });
        }

        if (yamlDoc.tags) {
          acc.tags = [...(acc.tags || []), ...yamlDoc.tags];
        }

        logger.info(`Loaded swagger YAML file: ${path.basename(filePath)}`);
        return acc;
      } catch (error) {
        logger.error(`Error loading YAML file ${filePath}:${error}`);
        return acc;
      }
    },
    { paths: {}, components: {}, tags: [] },
  );

  // Fusionar con la configuración base (sin swagger-jsdoc)
  const swaggerSpec = {
    ...baseSwaggerDefinition,
    ...combinedSwaggerDocs,
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  logger.info('Swagger documentation available at /api-docs');
  logger.info(`Loaded ${swaggerFiles.length} swagger YAML definition files`);
}
