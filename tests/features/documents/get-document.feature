Feature: Get Document by ID
  As a user
  I want to retrieve a document by its ID
  So that I can view the complete document content

  # SYNCHRONOUS: Happy path - document exists and is returned immediately
  Scenario: Successfully retrieve document by ID
    Given a document with title "First Document", author "Test Author" and content "This is test content" exists
    When I request GET the created document
    Then I should receive status 200
    And the response should contain the document
    And the response should have createdAt timestamp
    And the response should NOT contain sensitive metadata

  # SYNCHRONOUS: Error case - document not found returns 404
  Scenario: Return 404 when document doesn't exist
    When I request GET "/documents/00000000-0000-0000-0000-000000000000"
    Then I should receive status 404
    And the response should contain error message "Document not found"
    And the response should NOT contain any document data

  # SYNCHRONOUS: Invalid document ID format returns 400
  Scenario: Return 400 for invalid document ID format
    When I request GET "/documents/invalid-id!"
    Then I should receive status 400
    And the response should contain error message "Invalid document ID format"
    And the response should NOT contain any document data

  # EDGE CASE: Empty document ID in URL
  Scenario: Return appropriate response when document ID is missing
    When I request GET "/documents/"
    Then I should receive status 404
    And the response should indicate invalid path

  # SYNCHRONOUS: Retrieve correct document among multiple
  Scenario: Retrieve correct document among multiple documents
    Given 3 documents exist in the database
    When I request GET the second created document
    Then I should receive status 200
    And the response should contain a document
