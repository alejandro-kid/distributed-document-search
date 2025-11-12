import { After, AfterAll, Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import { Pool } from 'pg';
import request from 'supertest';
import { PostgresConnectionManager } from '../../src/contexts/shared/infrastructure/persistence/PostgresConnectionManager';
import container from '../../src/dependency-injection'; // Import the DI container
import { Server } from '../../src/server';
import { MockSocialAuthenticator } from '../mocks/MockSocialAuthenticator'; // Import the mock authenticator
import { SocialProfile } from '@/contexts/users/domain/auth/SocialAuthenticator';

let _server: Server;
let _request: request.SuperTest<request.Test>;
let _pool: Pool;
let _response: request.Response;
let _mockSocialAuthenticator: MockSocialAuthenticator; // Declare mock authenticator

Before(async function () {
  const resolvedContainer = await container; // Await the container promise
  _server = new Server('3001', resolvedContainer);
  await _server.listen();
  const httpServer = _server.getHTTPServer();
  if (!httpServer) {
    throw new Error('HTTP server is not initialized');
  }
  // @ts-expect-error: supertest type issue
  _request = request(httpServer);
  _pool = await PostgresConnectionManager.getPool();
  await _pool.query('DELETE FROM users');

  // Get the mock authenticator from the DI container
  _mockSocialAuthenticator = resolvedContainer.get('Users.application.SocialAuthenticator');
});

After(async function () {
  await _pool.query('DELETE FROM users');
  await _server.stop();
});

AfterAll(async function () {
  await PostgresConnectionManager.closePool();
});

Given(
  'a new user provides their X account details: id {string}, username {string}, and avatar_url {string}',
  function (id: string, username: string, avatar_url: string) {
    this.id = id;
    this.username = username;
    this.avatar_url = avatar_url;

    // Set the mock authenticator to return these details
    const profile: SocialProfile = { id, username, avatarUrl: avatar_url };
    _mockSocialAuthenticator.setNextProfile(profile);
  },
);

When('the user attempts to log in', async function () {
  // The authorization_code and code_verifier sent here don't matter as much, as the mock authenticator will return the set profile
  _response = await _request
    .post('/auth/login/x')
    .send({ authorization_code: 'any_code', code_verifier: 'any_verifier' });
});

Then('the user with id {string} should be logged in', async function (id: string) {
  assert.strictEqual(_response.status, 200, 'Expected a 200 OK response');
  assert.strictEqual(_response.body.user.id, id, 'Response user ID does not match');
});

Then("the user's username should be {string}", async function (username: string) {
  const result = await _pool.query('SELECT username FROM users WHERE id = $1', [this.id]);
  assert.strictEqual(result.rows[0].username, username, "The user's username was not saved correctly");
});

Given(
  'a user already exists in the database with id {string}, username {string}, and avatar_url {string}',
  async function (id: string, username: string, avatar_url: string) {
    // Insert the user directly into the database for this scenario
    await _pool.query(
      'INSERT INTO users (id, username, avatar_url, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
      [id, username, avatar_url],
    );
    this.id = id;
    this.username = username;
    this.avatar_url = avatar_url;

    // Set the mock authenticator to return these details for the login attempt
    const profile: SocialProfile = { id, username, avatarUrl: avatar_url };
    _mockSocialAuthenticator.setNextProfile(profile);
  },
);

Given(
  'the user provides their X account details: id {string}, username {string}, and avatar_url {string}',
  function (id: string, username: string, avatar_url: string) {
    // This step is redundant if the previous Given already set the mock.
    // It's better to combine these into a single Given for clarity or use a Background.
    // For now, we'll just ensure the mock is set correctly if this step is used.
    const profile: SocialProfile = { id, username, avatarUrl: avatar_url };
    _mockSocialAuthenticator.setNextProfile(profile);
  },
);

Then('the system should recognize the existing user with id {string}', async function (id: string) {
  const result = await _pool.query('SELECT * FROM users WHERE id = $1', [id]);
  assert.strictEqual(result.rows.length, 1, 'Existing user was not found in the database');
  assert.strictEqual(_response.status, 200, 'Expected a 200 OK response');
  assert.strictEqual(_response.body.user.id, id, 'Response user ID does not match');
});

Then('no new user should be created', async function () {
  const result = await _pool.query('SELECT COUNT(*) FROM users');
  assert.strictEqual(parseInt(result.rows[0].count), 1, 'More than one user found, indicating a new user was created');
});

Given(
  'the user provides their updated X account details: id {string}, username {string}, and avatar_url {string}',
  function (id: string, username: string, avatar_url: string) {
    // This step is for the scenario where an existing user logs in with changed details.
    // The previous Given 'a user already exists...' should have been called first.
    // We need to ensure the mock authenticator returns the *updated* details.
    this.username = username;
    this.avatar_url = avatar_url;
    const profile: SocialProfile = { id, username, avatarUrl: avatar_url };
    _mockSocialAuthenticator.setNextProfile(profile);
  },
);

Then("the user's details in the database should be updated", async function () {
  const result = await _pool.query('SELECT username, avatar_url FROM users WHERE id = $1', [this.id]);
  assert.strictEqual(result.rows[0].username, this.username, 'Username was not updated');
  assert.strictEqual(result.rows[0].avatar_url, this.avatar_url, 'Avatar URL was not updated');
});

Then("the user's avatar_url should be {string}", async function (avatar_url: string) {
  const result = await _pool.query('SELECT avatar_url FROM users WHERE id = $1', [this.id]);
  assert.strictEqual(result.rows[0].avatar_url, avatar_url, "The user's avatar_url was not saved correctly");
});

Given('the authentication service will fail', function () {
  _mockSocialAuthenticator.setError(new Error('Invalid authorization code'));
});

When('the user attempts to log in with an invalid code', async function () {
  _response = await _request
    .post('/auth/login/x')
    .send({ authorization_code: 'invalid_code', code_verifier: 'any_verifier' });
});

Then('the login should fail with a 401 Unauthorized error', function () {
  assert.strictEqual(_response.status, 401);
  assert.deepStrictEqual(_response.body, { error: 'Invalid authorization code' });
});
