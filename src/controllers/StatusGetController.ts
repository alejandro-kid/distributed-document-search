import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Controller } from '@/controllers/Controller';

export default class StatusGetController implements Controller {
  run(_req: Request, res: Response): void {
    res.status(httpStatus.OK).send();
  }
}
