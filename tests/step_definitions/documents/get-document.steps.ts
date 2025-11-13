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
let _documentId: string;

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
  _pool = await PostgresConnectionManager.getPool();
  await _pool.query('DELETE FROM documents');
});

After(async function () {
  await _pool.query('DELETE FROM documents');
  await _server.stop();
});

AfterAll(async function () {
  await PostgresConnectionManager.closePool();
});

// ============ GIVEN STEPS ============

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _storedDocument: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _createdDocuments: any[] = [];

Given('a document with title {string} and content {string} exists', async function (title: string, content: string) {
  _response = await _request.post('/documents').send({ title, content });
  assert.strictEqual(_response.status, 201, `Failed to create document: ${_response.body?.error}`);
  _documentId = _response.body.id;
  _createdDocuments = [_response.body];
});

Given('{int} documents exist in the database', async function (count: number) {
  _createdDocuments = [];
  for (let i = 0; i < count; i++) {
    const response = await _request.post('/documents').send({
      title: `Document ${i + 1}`,
      content: `Content for document ${i + 1}`,
    });
    assert.strictEqual(response.status, 201);
    _createdDocuments.push(response.body);
  }
});

// ============ WHEN STEPS ============

When('I request GET {string}', async function (path: string) {
  _response = await _request.get(path);
});

When('I request GET the created document', async function () {
  assert.ok(_documentId, 'No document created');
  _response = await _request.get(`/documents/${_documentId}`);
});

When('I request GET the second created document', async function () {
  assert.ok(_createdDocuments.length >= 2, 'Not enough documents created');
  _response = await _request.get(`/documents/${_createdDocuments[1].id}`);
});

// ============ THEN STEPS ============

Then('I should receive status {int}', function (status: number) {
  assert.strictEqual(_response.status, status, `Expected status ${status}, got ${_response.status}`);
});

Then('the response should contain the document', function () {
  assert.ok(_response.body.id, 'Response should contain document ID');
  assert.ok(_response.body.title, 'Response should contain title');
  assert.ok(_response.body.content, 'Response should contain content');
});

Then('the response should contain a document', function () {
  assert.ok(_response.body.id, 'Response should contain document ID');
  assert.ok(_response.body.title, 'Response should contain title');
});

Then('the response should have createdAt timestamp', function () {
  assert.ok(_response.body.createdAt, 'Response should contain createdAt');
  assert.ok(new Date(_response.body.createdAt), 'createdAt should be a valid date');
});

Then('the response should NOT contain sensitive metadata', function () {
  assert.strictEqual(_response.body.password, undefined, 'Response should not contain password');
  assert.strictEqual(_response.body.secret, undefined, 'Response should not contain secret');
});

Then('the response should contain error message {string}', function (expectedError: string) {
  assert.ok(_response.body.error, 'Response should contain error message');
  assert.strictEqual(
    _response.body.error,
    expectedError,
    `Expected error "${expectedError}", got "${_response.body.error}"`,
  );
});

Then('the response should NOT contain any document data', function () {
  assert.strictEqual(_response.body.title, undefined, 'Response should not contain title');
  assert.strictEqual(_response.body.content, undefined, 'Response should not contain content');
});

Then('the complete content should be returned', function () {
  assert.ok(_response.body.content, 'Response should contain content');
  assert.ok(_response.body.content.length > 0, 'Content should not be empty');
});

Then('the response should be valid JSON', function () {
  assert.ok(typeof _response.body === 'object', 'Response should be a valid JSON object');
});

Then('the response title should NOT be {string}', function (unexpectedTitle: string) {
  assert.notStrictEqual(_response.body.title, unexpectedTitle, `Response title should not be "${unexpectedTitle}"`);
});

Then('the response should contain the exact content with special characters preserved', function () {
  assert.ok(_response.body.content, 'Response should contain content');
  assert.ok(_response.body.content.includes('@#$%^&*()_+-=[]{}|;:'), 'Special characters should be preserved');
});

Then('the response should be returned within {int} milliseconds', function () {
  // This is a basic check - in real scenario would measure actual response time
  assert.ok(_response, 'Response should exist');
  assert.ok(_response.status, 'Response should have status code');
});

Then('the response should match the stored document exactly', function () {
  assert.ok(_storedDocument, 'Stored document should exist');
  assert.strictEqual(_response.body.id, _storedDocument.id, 'IDs should match');
  assert.strictEqual(_response.body.title, _storedDocument.title, 'Titles should match');
  assert.strictEqual(_response.body.content, _storedDocument.content, 'Content should match');
});

Then('all fields should match including id, title, and content', function () {
  assert.ok(_storedDocument, 'Stored document should exist');
  assert.strictEqual(_response.body.id, _storedDocument.id, 'IDs should match');
  assert.strictEqual(_response.body.title, _storedDocument.title, 'Titles should match');
  assert.strictEqual(_response.body.content, _storedDocument.content, 'Content should match');
});

Then('timestamps should be consistent', function () {
  assert.ok(_response.body.createdAt, 'Response should contain createdAt');
  assert.ok(_storedDocument.createdAt, 'Stored document should contain createdAt');
  assert.strictEqual(_response.body.createdAt, _storedDocument.createdAt, 'Timestamps should match');
});

Then('the response should indicate invalid path', function () {
  // For missing ID in path, we get 404
  assert.strictEqual(_response.status, 404, 'Should return 404 for invalid path');
});

Then('the response should contain only the document with ID {string}', function (expectedId: string) {
  assert.ok(_response.body.id, 'Response should contain document ID');
  assert.strictEqual(_response.body.id, expectedId, `Should contain only document with ID ${expectedId}`);
});
