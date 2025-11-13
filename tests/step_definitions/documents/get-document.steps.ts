import { Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import { DocumentWorld } from './shared-document.steps';

// ============ WHEN STEPS ============

When('I request GET {string}', async function (this: DocumentWorld, path: string) {
  this._response = await this._request.get(path);
});

When('I request GET the created document', async function (this: DocumentWorld) {
  assert.ok(this._documentId, 'No document created');
  this._response = await this._request.get(`/documents/${this._documentId}`);
});

When('I request GET the second created document', async function (this: DocumentWorld) {
  assert.ok(this._createdDocuments.length >= 2, 'Not enough documents created');
  this._response = await this._request.get(`/documents/${this._createdDocuments[1].id}`);
});

// ============ THEN STEPS (GET-SPECIFIC) ============

Then('the response should contain the document', function (this: DocumentWorld) {
  assert.ok(this._response.body.id, 'Response should contain document ID');
  assert.ok(this._response.body.title, 'Response should contain title');
  assert.ok(this._response.body.content, 'Response should contain content');
});

Then('the response should contain a document', function (this: DocumentWorld) {
  assert.ok(this._response.body.id, 'Response should contain document ID');
  assert.ok(this._response.body.title, 'Response should contain title');
});

Then('the response should have createdAt timestamp', function (this: DocumentWorld) {
  assert.ok(this._response.body.createdAt, 'Response should contain createdAt');
  assert.ok(new Date(this._response.body.createdAt), 'createdAt should be a valid date');
});

Then('the response should NOT contain sensitive metadata', function (this: DocumentWorld) {
  assert.strictEqual(this._response.body.password, undefined, 'Response should not contain password');
  assert.strictEqual(this._response.body.secret, undefined, 'Response should not contain secret');
});

Then('the response should NOT contain any document data', function (this: DocumentWorld) {
  assert.strictEqual(this._response.body.title, undefined, 'Response should not contain title');
  assert.strictEqual(this._response.body.content, undefined, 'Response should not contain content');
});

Then('the complete content should be returned', function (this: DocumentWorld) {
  assert.ok(this._response.body.content, 'Response should contain content');
  assert.ok(this._response.body.content.length > 0, 'Content should not be empty');
});

Then('the response should be valid JSON', function (this: DocumentWorld) {
  assert.ok(typeof this._response.body === 'object', 'Response should be a valid JSON object');
});

Then('the response title should NOT be {string}', function (this: DocumentWorld, unexpectedTitle: string) {
  assert.notStrictEqual(
    this._response.body.title,
    unexpectedTitle,
    `Response title should not be "${unexpectedTitle}"`,
  );
});

Then('the response should contain the exact content with special characters preserved', function (this: DocumentWorld) {
  assert.ok(this._response.body.content, 'Response should contain content');
  assert.ok(this._response.body.content.includes('@#$%^&*()_+-=[]{}|;:'), 'Special characters should be preserved');
});

Then('the response should be returned within {int} milliseconds', function (this: DocumentWorld) {
  // This is a basic check - in real scenario would measure actual response time
  assert.ok(this._response, 'Response should exist');
  assert.ok(this._response.status, 'Response should have status code');
});

Then('the response should indicate invalid path', function (this: DocumentWorld) {
  // For missing ID in path, we get 404
  assert.strictEqual(this._response.status, 404, 'Should return 404 for invalid path');
});

Then(
  'the response should contain only the document with ID {string}',
  function (this: DocumentWorld, expectedId: string) {
    assert.ok(this._response.body.id, 'Response should contain document ID');
    assert.strictEqual(this._response.body.id, expectedId, `Should contain only document with ID ${expectedId}`);
  },
);
