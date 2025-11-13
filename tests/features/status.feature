Feature: Api status and health check
  In order to know the server is up and running
  As a monitoring system
  I want to check the api status and all dependencies are healthy

  Scenario: Check the api status (basic health check)
    When I send a GET request to "/status"
    Then the response status code should be 200

  # Additional scenarios pending completion of health check integration
  # Scenario: Health check returns 200 with all dependencies healthy
  # Scenario: Health check returns 503 when database is unavailable
  # Scenario: Health check includes application metadata
