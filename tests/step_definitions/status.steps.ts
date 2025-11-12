import { AfterAll, BeforeAll, Given, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { BackendApi } from '@/BackendApi';

let _request: request.Test;
let application: BackendApi;

Given('I send a GET request to {string}', (route: string) => {
  if (!application.httpServer) {
    throw new Error('HTTP server is not initialized');
  }
  _request = request(application.httpServer).get(route);
});

Then('the response status code should be {int}', async (status: number) => {
  await _request.expect(status);
});

BeforeAll(async () => {
  application = new BackendApi();
  await application.start();
});

AfterAll(async () => {
  try {
    if (application) {
      await application.stop();
    }
  } catch {
    // Ignorar errores al cerrar el servidor en tests
    console.log('Server cleanup completed');
  }
});
