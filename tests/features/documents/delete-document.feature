Feature: Delete Document by ID
  As a user
  I want to delete a document I no longer need
  So that I can remove unwanted documents from the system

  # SYNCHRONOUS: Happy path - document is deleted successfully
  Scenario: Successfully delete document
    Given a document with title "To Delete", author "Test Author" and content "This will be deleted" exists
    When I send DELETE request to the created document
    Then I should receive status 204
    And the document should no longer exist in the database
    And the response should have no content body

  # SYNCHRONOUS: Error case - document not found returns 404
  Scenario: Return 404 when document doesn't exist
    When I send DELETE request to "/documents/00000000-0000-0000-0000-000000000000"
    Then I should receive status 404
    And the response should contain error message "Document not found"
    And no documents should be deleted

  # SYNCHRONOUS: Invalid document ID format returns 400
  Scenario: Return 400 for invalid document ID format
    When I send DELETE request to "/documents/invalid-id!"
    Then I should receive status 400
    And the response should contain error message "Invalid document ID format"
    And no documents should be deleted

  # ASYNCHRONOUS: Side effect - event is eventually published
  Scenario: DocumentDeletedEvent published after successful deletion
    Given a document with title "Event Test", author "Test Author" and content "Test content" exists
    When I send DELETE request to the created document
    Then the deletion should complete immediately with status 204
    And a DocumentDeletedEvent should be published eventually
    And the event should contain the deleted document ID
