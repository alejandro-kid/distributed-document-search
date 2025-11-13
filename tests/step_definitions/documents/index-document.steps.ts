import { After, AfterAll, Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import { Pool } from 'pg';
import request from 'supertest';
import { PostgresConnectionManager } from '../../../src/contexts/shared/infrastructure/persistence/PostgresConnectionManager';
import container from '../../../src/dependency-injection';
import { Server } from '../../../src/server';

let _server: Server;
let _request: request.SuperTest<request.Test>;
let _pool: Pool;
let _response: request.Response;
let _requestBody: Record<string, string> = {};

Before(async function () {
  const resolvedContainer = await container;
  _server = new Server('3002', resolvedContainer);
  await _server.listen();
  const httpServer = _server.getHTTPServer();
  if (!httpServer) {
    throw new Error('HTTP server is not initialized');
  }
  // @ts-expect-error: supertest type issue
  _request = request(httpServer);
  _pool = PostgresConnectionManager.getPool();
  await _pool.query('DELETE FROM documents');
});

After(async function () {
  await _pool.query('DELETE FROM documents');
  await _server.stop();
});

AfterAll(async function () {
  await PostgresConnectionManager.closePool();
});

Given('I send a POST request to {string} with:', function (_path: string, dataTable) {
  const rows = dataTable.hashes();
  // Convert array of {field, value} to object
  _requestBody = {};
  rows.forEach((row: { field: string | number; value: string }) => {
    _requestBody[row.field] = row.value;
  });
});

When('the request is sent', async function () {
  _response = await _request.post('/documents').send(_requestBody);
});

Then('the response status code should be {int} for documents', function (statusCode: number) {
  assert.ok(_response, 'Response is undefined');
  assert.strictEqual(_response.status, statusCode, `Expected status ${statusCode}, got ${_response.status}`);
});

Then('the response should contain {string} with value {string}', function (key: string, value: string) {
  assert.strictEqual(_response.body[key], value, `Expected ${key} to be "${value}", got "${_response.body[key]}"`);
});

Then('the response should contain {string}', function (key: string) {
  assert.ok(_response.body[key] !== undefined, `Expected response to contain ${key}, but it was not found`);
});

Then('the response should contain error {string}', function (expectedError: string) {
  assert.strictEqual(
    _response.body.error,
    expectedError,
    `Expected error "${expectedError}", got "${_response.body.error}"`,
  );
});
