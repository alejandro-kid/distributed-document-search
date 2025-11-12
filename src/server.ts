import { httpLogger, logger } from '@/logger';
import { registerRoutes } from '@/routes';
import { setupSwagger } from '@/swagger';
import compress from 'compression';
import errorHandler from 'errorhandler';
import express, { json, Request, Response, Router, urlencoded, NextFunction } from 'express';
import helmet from 'helmet';
import * as http from 'http';
import httpStatus from 'http-status';
import { ContainerBuilder } from 'node-dependency-injection';
import { NODE_ENV } from './config';

export class Server {
  private readonly app: express.Express;
  private readonly port: string;
  private httpServer?: http.Server;
  private readonly logger = logger;
  private readonly container: ContainerBuilder;

  constructor(port: string, container: ContainerBuilder) {
    this.port = port;
    this.app = express();
    this.container = container;
    this.configureMiddleware();
    // configureRoutes and configureSwagger will be called in init
    this.configureErrorHandling();
  }

  async init(): Promise<void> {
    await this.configureRoutes();
    await this.configureSwagger();
  }

  private configureMiddleware(): void {
    // Añadir el middleware de Pino para logs HTTP (debe ser uno de los primeros middleware)
    this.app.use(httpLogger);
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(compress());
  }

  private async configureRoutes(): Promise<void> {
    const router = Router();
    await registerRoutes(router, this.container);
    this.app.use(router);
  }

  private async configureSwagger(): Promise<void> {
    await setupSwagger(this.app);
  }

  private configureErrorHandling(): void {
    if (NODE_ENV !== 'production') {
      this.app.use(errorHandler());
    }

    // Middleware de manejo de errores debe tener 4 parámetros para que Express lo reconozca
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      this.logger.error({ err, req: req.id }, `Error: ${err.message}`);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    });
  }

  async listen(): Promise<void> {
    await this.init(); // Call init before listening
    return new Promise((resolve) => {
      this.httpServer = this.app.listen(this.port, () => {
        this.logger.info(`Backend API is running at http://localhost:${this.port} in ${this.app.get('env')} mode`);
        this.logger.info(`Swagger documentation available at http://localhost:${this.port}/api-docs`);
        this.logger.info('Press CTRL-C to stop');
        resolve();
      });
    });
  }

  getHTTPServer(): http.Server | undefined {
    return this.httpServer;
  }

  async stop(): Promise<void> {
    if (!this.httpServer) return;

    return new Promise((resolve, reject) => {
      this.logger.info('Stopping HTTP server...');
      this.httpServer?.close((error) => {
        if (error) {
          this.logger.error({ err: error }, 'Error while stopping the server');
          reject(error);
        } else {
          this.logger.info('HTTP server stopped successfully');
          resolve();
        }
      });
    });
  }
}
