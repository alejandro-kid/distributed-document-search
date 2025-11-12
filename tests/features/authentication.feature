Feature: User Authentication with X (Twitter)
  As a user of the mobile application
  I want to register and log in using my X account
  So that I can access the platform securely and without a separate password.

  Scenario: A new user registers using their X account
    Given a new user provides their X account details: id "new_user_123", username "new_user", and avatar_url "http://example.com/avatar.png"
    When the user attempts to log in
    Then the user with id "new_user_123" should be logged in

  Scenario: An existing user logs in with their X account
    Given a user already exists in the database with id "existing_user_456", username "old_username", and avatar_url "http://example.com/old_avatar.png"
    And the user provides their X account details: id "existing_user_456", username "old_username", and avatar_url "http://example.com/old_avatar.png"
    When the user attempts to log in
    Then the system should recognize the existing user with id "existing_user_456"
    And no new user should be created

  Scenario: An existing user logs in and their X account details have changed
    Given a user already exists in the database with id "existing_user_789", username "original_name", and avatar_url "http://example.com/original_avatar.png"
    And the user provides their updated X account details: id "existing_user_789", username "updated_name", and avatar_url "http://example.com/updated_avatar.png"
    When the user attempts to log in
    Then the user's details in the database should be updated
    And the user's username should be "updated_name"
    And the user's avatar_url should be "http://example.com/updated_avatar.png"

  Scenario: A user attempts to log in with an invalid authorization code
    Given the authentication service will fail
    When the user attempts to log in with an invalid code
    Then the login should fail with a 401 Unauthorized error
