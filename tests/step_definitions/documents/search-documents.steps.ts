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
let _createdDocuments: Array<{ id: string; title: string; content: string }> = [];

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
  _createdDocuments = [];
});

After(async function () {
  await _pool.query('DELETE FROM documents');
  await _server.stop();
});

AfterAll(async function () {
  await PostgresConnectionManager.closePool();
});

Given('there are documents in the system:', async function (dataTable) {
  const documents = dataTable.hashes();

  for (const doc of documents) {
    const response = await _request.post('/documents').send({
      title: doc.title,
      content: doc.content,
    });

    assert.strictEqual(response.status, 201, `Failed to create document: ${response.body?.error}`);

    const createdDoc = response.body;
    _createdDocuments.push({
      id: createdDoc.id,
      title: createdDoc.title,
      content: createdDoc.content,
    });
  }
});

When('I search for documents with query {string}', async function (query: string) {
  _response = await _request.get('/search').query({ q: query });
});

Then('I should see {int} documents in the results', function (expectedCount: number) {
  const actualCount = _response.body?.data?.length || 0;

  assert.strictEqual(
    actualCount,
    expectedCount,
    `Expected ${expectedCount} documents in results, but got ${actualCount}. Results: ${JSON.stringify(_response.body?.data)}`,
  );
});

Then('the results should include document with title {string}', function (expectedTitle: string) {
  const found = _response.body?.data?.some((doc: Record<string, unknown>) => doc.title === expectedTitle);

  assert.strictEqual(found, true, `Document with title "${expectedTitle}" not found in results`);
});

Then('I should see message {string}', function (expectedMessage: string) {
  const responseMessage = _response.body?.message || '';

  assert.ok(
    responseMessage.includes(expectedMessage),
    `Expected message to include "${expectedMessage}", but got "${responseMessage}"`,
  );
});
