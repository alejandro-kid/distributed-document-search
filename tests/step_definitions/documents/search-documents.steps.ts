import { After, AfterAll, Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import { Pool } from 'pg';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { PostgresConnectionManager } from '../../../src/contexts/shared/infrastructure/persistence/PostgresConnectionManager';
import container from '../../../src/dependency-injection';
import { Server } from '../../../src/server';

let _server: Server;
let _request: request.SuperTest<request.Test>;
let _pool: Pool;
let _response: request.Response;
let _createdDocuments: Array<{ id: string; title: string; content: string }> = [];
let _firstPageDocuments: Array<{ id: string }> = [];

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
  _firstPageDocuments = [];
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

Given('{int} documents exist with the word {string}', async function (count: number, word: string) {
  for (let i = 0; i < count; i++) {
    const response = await _request.post('/documents').send({
      id: uuid(),
      title: `Document ${i + 1}`,
      content: `This document contains the word ${word}`,
    });
    assert.strictEqual(response.status, 201, `Failed to create document ${i + 1}`);
  }
});

When('I search for documents with query {string}', async function (query: string) {
  _response = await _request.get('/search').query({ q: query });
});

When(
  'I search for {string} with page {int} and limit {int}',
  async function (query: string, page: number, limit: number) {
    _response = await _request.get('/search').query({ q: query, page, limit });
    if (page === 1) {
      _firstPageDocuments = _response.body?.data?.map((doc: { id: string }) => ({ id: doc.id })) || [];
    }
  },
);

Then('I should see {int} documents in the results', function (expectedCount: number) {
  const actualCount = _response.body?.data?.length || 0;

  assert.strictEqual(
    actualCount,
    expectedCount,
    `Expected ${expectedCount} documents in results, but got ${actualCount}. Results: ${JSON.stringify(_response.body?.data)}`,
  );
});

Then('I should receive {int} documents', function (expectedCount: number) {
  const actualCount = _response.body?.data?.length || 0;
  assert.strictEqual(actualCount, expectedCount, `Expected ${expectedCount} documents, but got ${actualCount}`);
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

Then(
  'the response should include pagination metadata with total {int} results and total {int} page(s)',
  function (expectedTotal: number, expectedTotalPages: number) {
    const pagination = _response.body?.meta?.pagination;
    assert.ok(pagination, 'Pagination metadata not found in response');
    assert.strictEqual(
      pagination.total,
      expectedTotal,
      `Expected total results to be ${expectedTotal}, but got ${pagination.total}`,
    );
    assert.strictEqual(
      pagination.totalPages,
      expectedTotalPages,
      `Expected total pages to be ${expectedTotalPages}, but got ${pagination.totalPages}`,
    );
  },
);

Then('the documents should be different from the first page', function () {
  const secondPageDocumentIds = new Set(_response.body?.data?.map((doc: { id: string }) => doc.id) || []);
  const firstPageDocumentIds = new Set(_firstPageDocuments.map((doc) => doc.id));

  assert.ok(secondPageDocumentIds.size > 0, 'Second page has no documents');
  assert.ok(firstPageDocumentIds.size > 0, 'First page has no documents');

  const intersection = new Set([...firstPageDocumentIds].filter((id) => secondPageDocumentIds.has(id)));
  assert.strictEqual(intersection.size, 0, 'Found duplicate documents between first and second page');
});

Then(
  'I should receive a {string} error with message {string}',
  function (expectedStatusString: string, expectedMessage: string) {
    const expectedStatus = parseInt(expectedStatusString.split(' ')[0]);
    assert.strictEqual(
      _response.status,
      expectedStatus,
      `Expected status code ${expectedStatus}, but got ${_response.status}`,
    );
    const errorMessage = _response.body?.error || '';
    assert.ok(
      errorMessage.includes(expectedMessage),
      `Expected error message to include "${expectedMessage}", but got "${errorMessage}"`,
    );
  },
);
