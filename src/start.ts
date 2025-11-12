import 'dotenv/config';
import { API_PORT } from './config';
import containerPromise from './dependency-injection';
import { logger } from './logger';
import { Server } from './server';

export async function start() {
  const container = await containerPromise;
  const server = new Server(API_PORT, container);

  await server.listen();

  return server;
}

start().catch(handleError);

function handleError(error: unknown) {
  logger.error(error, 'Error during server startup');
  process.exit(1);
}
