import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Controller } from '@/controllers/Controller';
import { GetHealthStatusUseCase } from '@/shared/application/get-health-status/GetHealthStatusUseCase';

export default class StatusGetController implements Controller {
  constructor(private readonly getHealthStatusUseCase: GetHealthStatusUseCase) {}

  async run(_req: Request, res: Response): Promise<void> {
    try {
      const response = await this.getHealthStatusUseCase.run();
      const status = response.toPrimitives().status === 'healthy' ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE;
      res.status(status).json(response.toPrimitives());
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: `Internal server error: ${err}`,
      });
    }
  }
}
