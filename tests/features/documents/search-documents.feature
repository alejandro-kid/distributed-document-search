@search
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

  Scenario: Search returns the first page of results
    Given 30 documents exist with the word "searchable"
    When I search for "searchable" with page 1 and limit 10
    Then I should receive 10 documents
    And the response should include pagination metadata with total 30 results and total 3 pages

  Scenario: Search returns the second page of results
    Given 30 documents exist with the word "searchable"
    When I search for "searchable" with page 1 and limit 10
    And I search for "searchable" with page 2 and limit 10
    Then I should receive 10 documents
    And the documents should be different from the first page

  Scenario: Search handles invalid pagination parameters
    When I search for "searchable" with page -1 and limit 10
    Then I should receive a "400 Bad Request" error with message "Invalid pagination parameters"

  Scenario: Search with limit greater than total results
    Given 15 documents exist with the word "searchable"
    When I search for "searchable" with page 1 and limit 20
    Then I should receive 15 documents
    And the response should include pagination metadata with total 15 results and total 1 page