import { LoginXController } from '@/controllers/LoginXController';
import { Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

export const register = (router: Router, container: ContainerBuilder) => {
  const controller: LoginXController = container.get('Controllers.LoginXController');
  router.post('/auth/login/x', (req: Request, res: Response) => controller.run(req, res));
};
