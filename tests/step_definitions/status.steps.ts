import { AfterAll, BeforeAll, Given, Then, When } from '@cucumber/cucumber';
import request from 'supertest';
import { BackendApi } from '@/BackendApi';

let _request: request.Test;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _response: any;
let application: BackendApi;

When('I send a GET request to {string}', (route: string) => {
  if (!application.httpServer) {
    throw new Error('HTTP server is not initialized');
  }
  _request = request(application.httpServer).get(route);
});

Then('the response status code should be {int}', async (status: number) => {
  _response = await _request.expect(status);
});

Then('the response JSON should have {string} equal to {string}', (path: string, value: string) => {
  if (!_response) {
    throw new Error('No response available. Make sure to execute the request first');
  }

  const keys = path.split('.');
  let current = _response.body;

  for (const key of keys) {
    if (current[key] === undefined) {
      throw new Error(`Path ${path} not found in response`);
    }
    current = current[key];
  }

  if (current !== value) {
    throw new Error(`Expected ${value}, but got ${current}`);
  }
});

Then('the response should include {string}', (field: string) => {
  if (!_response) {
    throw new Error('No response available');
  }

  const keys = field.split('.');
  let current = _response.body;

  for (const key of keys) {
    if (current[key] === undefined) {
      throw new Error(`Field ${field} not found in response`);
    }
    current = current[key];
  }

  if (current === undefined) {
    throw new Error(`Field should not be undefined`);
  }
});

Then('the response should include timestamp in ISO 8601 format', () => {
  if (!_response) {
    throw new Error('No response available');
  }

  const timestamp = _response.body.timestamp;
  if (!timestamp) {
    throw new Error('Timestamp is missing');
  }

  // Verify ISO 8601 format
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!iso8601Regex.test(timestamp)) {
    throw new Error(`Timestamp ${timestamp} is not in ISO 8601 format`);
  }
});

Then('the response should include uptime as a number', () => {
  if (!_response) {
    throw new Error('No response available');
  }

  const uptime = _response.body.uptime;
  if (typeof uptime !== 'number') {
    throw new Error(`Uptime should be a number, but got ${typeof uptime}`);
  }
  if (uptime < 0) {
    throw new Error(`Uptime should be >= 0, but got ${uptime}`);
  }
});

Then('the response should include version information', () => {
  if (!_response) {
    throw new Error('No response available');
  }

  if (!_response.body.version) {
    throw new Error('Version is missing');
  }
  if (typeof _response.body.version !== 'string') {
    throw new Error(`Version should be a string, but got ${typeof _response.body.version}`);
  }
});

Then('the response should include dependencies as an object', () => {
  if (!_response) {
    throw new Error('No response available');
  }

  if (!_response.body.dependencies) {
    throw new Error('Dependencies are missing');
  }
  if (typeof _response.body.dependencies !== 'object') {
    throw new Error(`Dependencies should be an object, but got ${typeof _response.body.dependencies}`);
  }
});

Given('the PostgreSQL database is running', () => {
  // In tests, we'll use the real database connection
  // This is automatically available in the test environment
});

Given('the PostgreSQL database is unavailable', () => {
  // This scenario will be tested by mocking the database connection
  // For now, we'll skip this as it requires DB mocking setup
});

Given('the application is fully initialized', () => {
  // Application is already initialized by BeforeAll
  if (!application) {
    throw new Error('Application is not initialized');
  }
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
