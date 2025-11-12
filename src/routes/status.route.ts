import { Request, Response, Router } from 'express';
import StatusController from '@/controllers/StatusGetController';
import { logger } from '@/logger';
import { ContainerBuilder } from 'node-dependency-injection';

export const register = (router: Router, container: ContainerBuilder): void => {
  logger.info('Endpoint /status');
  const controller = container.get<StatusController>('Api.controllers.StatusGetController');
  router.get('/status', (req: Request, res: Response) => {
    controller.run(req, res);
  });
};
