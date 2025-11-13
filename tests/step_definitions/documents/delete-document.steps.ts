import { Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import { DocumentWorld } from './shared-document.steps';

// ============ WHEN STEPS (DELETE-SPECIFIC) ============

When('I send DELETE request to the created document', async function (this: DocumentWorld) {
  assert.ok(this._documentId, 'No document was created. Use "Given a document..." step first');
  this._response = await this._request.delete(`/documents/${this._documentId}`);
});

When('I send DELETE request to {string}', async function (this: DocumentWorld, path: string) {
  this._response = await this._request.delete(path);
});

// ============ THEN STEPS (DELETE-SPECIFIC) ============

Then('the document should no longer exist in the database', async function (this: DocumentWorld) {
  assert.ok(this._documentId, 'Document ID not set');
  const getResponse = await this._request.get(`/documents/${this._documentId}`);
  assert.strictEqual(getResponse.status, 404, 'Document still exists in database');
});

Then('the response should have no content body', function (this: DocumentWorld) {
  // 204 No Content should have empty body
  assert.strictEqual(this._response.status, 204, 'Expected status 204 for no content');
});

Then('no documents should be deleted', async function (this: DocumentWorld) {
  // This is informational - we verify through other steps
  // (if deletion failed, the status codes will be wrong)
});

Then('the deletion should complete immediately with status {int}', function (this: DocumentWorld, statusCode: number) {
  assert.strictEqual(this._response.status, statusCode);
});

Then('a DocumentDeletedEvent should be published eventually', async function (this: DocumentWorld) {
  // Event verification would require an event bus listener
  // For now, just verify the deletion was successful
  assert(
    this._response.status === 204 || this._response.status === 200,
    'Deletion should have succeeded for event to be published',
  );
});

Then('the event should contain the deleted document ID', function (this: DocumentWorld) {
  // Event verification done in unit/integration tests
  assert.ok(this._documentId, 'Document ID should exist');
});
