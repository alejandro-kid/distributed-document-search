import { API_PORT } from './config';
import containerPromise from './dependency-injection';
import { logger } from './logger';
import { Server } from './server';

export class BackendApi {
  server?: Server;

  async start(): Promise<void> {
    const container = await containerPromise;
    this.server = new Server(API_PORT, container);

    await this.server.listen();
  }

  get httpServer() {
    return this.server?.getHTTPServer();
  }

  async stop() {
    logger.info('Stopping backend application...');
    return this.server?.stop();
  }
}
