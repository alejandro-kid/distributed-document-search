Feature: Search Documents
  As a user
  I want to search for documents by title and content
  So that I can find relevant documents quickly

  Scenario: Successfully search documents with matching query
    Given there are documents in the system:
      | title               | content                      |
      | TypeScript Guide    | Learn TypeScript basics      |
      | JavaScript Tutorial | Master JavaScript advanced   |
      | TypeScript Advanced | Deep dive into TypeScript    |
    When I search for documents with query "TypeScript"
    Then I should see 2 documents in the results
    And the results should include document with title "TypeScript Guide"
    And the results should include document with title "TypeScript Advanced"

  Scenario: Search returns empty results for non-matching query
    Given there are documents in the system:
      | title          | content           |
      | Python Basics  | Learn Python      |
      | Java Advanced  | Master Java       |
    When I search for documents with query "TypeScript"
    Then I should see 0 documents in the results
    And I should see message "No documents found"

  Scenario: Search matches both title and content
    Given there are documents in the system:
      | title            | content                    |
      | Web Development  | Learn TypeScript and React |
      | Database Guide   | SQL and PostgreSQL basics  |
    When I search for documents with query "TypeScript"
    Then I should see 1 documents in the results
    And the results should include document with title "Web Development"
