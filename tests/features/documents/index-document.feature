Feature: Index Documents
  As a user
  I want to index documents in the system
  So that I can manage and search through them

  Scenario: Successfully index a new document
    Given I send a POST request to "/documents" with:
      | field   | value              |
      | title   | My Test Document   |
      | author  | Test Author        |
      | content | This is test content   |
    When the request is sent
    Then the response status code should be 201 for documents
    And the response should contain "title" with value "My Test Document"
    And the response should contain "author" with value "Test Author"
    And the response should contain "content" with value "This is test content"
    And the response should contain "id"
    And the response should contain "createdAt"

  Scenario: Cannot index document without title
    Given I send a POST request to "/documents" with:
      | field   | value                |
      | author  | Test Author          |
      | content | This is test content |
    When the request is sent
    Then the response status code should be 400 for documents
    And the response should contain error "Title, author and content are required"

  Scenario: Cannot index document without content
    Given I send a POST request to "/documents" with:
      | field   | value            |
      | title   | My Test Document |
      | author  | Test Author      |
    When the request is sent
    Then the response status code should be 400 for documents
    And the response should contain error "Title, author and content are required"

  Scenario: Cannot index document with empty content
    Given I send a POST request to "/documents" with:
      | field   | value            |
      | title   | My Test Document |
      | author  | Test Author      |
      | content |                  |
    When the request is sent
    Then the response status code should be 400 for documents
    And the response should contain error "Title, author and content are required"

  Scenario: Cannot index document with only whitespace content
    Given I send a POST request to "/documents" with:
      | field   | value            |
      | title   | My Test Document |
      | author  | Test Author      |
      | content |                  |
    When the request is sent
    Then the response status code should be 400 for documents
    And the response should contain error "Title, author and content are required"
