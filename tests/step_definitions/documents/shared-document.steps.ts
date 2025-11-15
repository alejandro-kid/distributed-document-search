import { After, AfterAll, Before, Given, Then, World, setWorldConstructor } from '@cucumber/cucumber';
import assert from 'assert';
import { Pool } from 'pg';
import request from 'supertest';
import { PostgresConnectionManager } from '../../../src/contexts/shared/infrastructure/persistence/PostgresConnectionManager';
import container from '../../../src/dependency-injection';
import { Server } from '../../../src/server';

/**
 * DocumentWorld: Shared context for all document-related scenarios
 * Each scenario gets its own instance with isolated state
 */
export class DocumentWorld extends World {
  _server!: Server;
  _request!: request.SuperTest<request.Test>;
  _pool!: Pool;
  _response!: request.Response;
  _documentId!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createdDocuments: any[] = [];
}

setWorldConstructor(DocumentWorld);

// ============ HOOKS ============

Before(async function (this: DocumentWorld) {
  const resolvedContainer = await container;
  this._server = new Server('3002', resolvedContainer);
  await this._server.listen();
  const httpServer = this._server.getHTTPServer();
  if (!httpServer) {
    throw new Error('HTTP server is not initialized');
  }
  // @ts-expect-error: supertest type issue
  this._request = request(httpServer);
  this._pool = PostgresConnectionManager.getPool();
  await this._pool.query('DELETE FROM documents');
});

After(async function (this: DocumentWorld) {
  await this._pool.query('DELETE FROM documents');
  await this._server.stop();
});

AfterAll(async function () {
  await PostgresConnectionManager.closePool();
});

// ============ GIVEN STEPS (SHARED) ============

Given(
  'a document with title {string}, author {string} and content {string} exists',
  async function (this: DocumentWorld, title: string, author: string, content: string) {
    this._response = await this._request.post('/documents').send({ title, author, content });
    assert.strictEqual(this._response.status, 201, `Failed to create document: ${this._response.body?.error}`);
    this._documentId = this._response.body.id;
    this._createdDocuments = [this._response.body];
  },
);

Given('{int} documents exist in the database', async function (this: DocumentWorld, count: number) {
  this._createdDocuments = [];
  for (let i = 0; i < count; i++) {
    const response = await this._request.post('/documents').send({
      title: `Document ${i + 1}`,
      author: `Author ${i + 1}`,
      content: `Content for document ${i + 1}`,
    });
    assert.strictEqual(response.status, 201);
    this._createdDocuments.push(response.body);
  }
});

// ============ THEN STEPS (SHARED/GENERIC) ============

Then('I should receive status {int}', function (this: DocumentWorld, status: number) {
  assert.strictEqual(
    this._response.status,
    status,
    `Expected status ${status}, got ${this._response.status}. Response: ${JSON.stringify(this._response.body)}`,
  );
});

Then('the response should contain error message {string}', function (this: DocumentWorld, expectedMessage: string) {
  assert.ok(this._response.body.error, 'Response should contain error field');
  assert.strictEqual(
    this._response.body.error,
    expectedMessage,
    `Expected error message "${expectedMessage}", got "${this._response.body.error}"`,
  );
});
