# Implementation Plan: GET /documents/{id}

## Overview

This document provides a detailed step-by-step implementation guide for the GET /documents/{id} endpoint following the established DDD + CQRS + EDA architecture.

---

## Phase 2.3: GET /documents/{id}

### Implementation Scope

| Component | Status | Details |
|-----------|--------|---------|
| Domain Layer | No changes | Document aggregate already complete |
| Application Layer | New | CQRS Query/Handler pattern |
| Infrastructure Layer | Extend | Add `findById()` to repository |
| Web Layer | New | Controller + Routes + Swagger |
| Testing | New | Unit + Integration + Acceptance |

---

## Implementation Steps

### STEP 1: Domain Layer (No Changes Required)

**Status**: ✅ Already complete from Phase 2.1

**Verification**:
```typescript
// Existing Document aggregate
src/contexts/documents/domain/Document.ts ✅
src/contexts/documents/domain/DocumentId.ts ✅

// Need to create (if not exists):
src/contexts/documents/domain/DocumentNotFoundError.ts (NEW)
```

**New File**: DocumentNotFoundError

```typescript
export class DocumentNotFoundError extends DomainError {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`);
  }
}
```

---

### STEP 2: Application Layer - CQRS Query/Handler

**Pattern**: Query/QueryHandler (following CQRS established in codebase)

**Files to Create**:

#### 2.1: Create FindDocumentByIdQuery

**File**: `src/contexts/documents/application/find-document/FindDocumentByIdQuery.ts`

```typescript
import { Query } from '@shared/domain/Query';

export class FindDocumentByIdQuery implements Query {
  constructor(readonly documentId: string) {}
}
```

**Rationale**:
- Implements Query interface (consistent with codebase)
- Simple query object with documentId
- Will be dispatched via QueryBus

---

#### 2.2: Create DocumentResponse DTO

**File**: `src/contexts/documents/application/find-document/DocumentResponse.ts`

```typescript
import { Document } from '../../domain/Document';

export class DocumentResponse {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly content: string,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  static fromDomain(document: Document): DocumentResponse {
    return new DocumentResponse(
      document.id.value,
      document.title.value,
      document.content.value,
      document.createdAt,
      document.updatedAt
    );
  }

  toPrimitives(): any {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}
```

**Rationale**:
- Maps Document aggregate to API response format
- Includes timestamp fields
- Excludes internal/sensitive data

---

#### 2.3: Create FindDocumentByIdQueryHandler

**File**: `src/contexts/documents/application/find-document/FindDocumentByIdQueryHandler.ts`

```typescript
import { QueryHandler } from '@shared/domain/QueryHandler';
import { Query } from '@shared/domain/Query';
import { DocumentRepository } from '../../domain/DocumentRepository';
import { DocumentId } from '../../domain/DocumentId';
import { DocumentNotFoundError } from '../../domain/DocumentNotFoundError';
import { FindDocumentByIdQuery } from './FindDocumentByIdQuery';
import { DocumentResponse } from './DocumentResponse';

export class FindDocumentByIdQueryHandler
  implements QueryHandler<FindDocumentByIdQuery, DocumentResponse>
{
  constructor(private repository: DocumentRepository) {}

  subscribedTo(): Query {
    return FindDocumentByIdQuery;
  }

  async handle(query: FindDocumentByIdQuery): Promise<DocumentResponse> {
    // Query repository for document
    const document = await this.repository.findById(
      new DocumentId(query.documentId)
    );

    // If not found, throw error (controller will handle 404)
    if (!document) {
      throw new DocumentNotFoundError(query.documentId);
    }

    // Map to response DTO
    return DocumentResponse.fromDomain(document);
  }
}
```

**Rationale**:
- Implements QueryHandler interface (CQRS pattern)
- Uses Repository pattern for data access
- Throws domain error if not found (controller converts to 404)
- Returns response DTO

---

### STEP 3: Infrastructure Layer - Repository Extension

**Pattern**: Extend existing DocumentRepository with findById()

**File to Modify**: `src/contexts/documents/infrastructure/persistence/DocumentRepository.ts`

**Current Interface**:
```typescript
export interface DocumentRepository {
  save(document: Document, transaction?: Transaction): Promise<void>;
  search(query: string, tenantId?: string): Promise<Document[]>;
  // NEW METHOD:
  findById(id: DocumentId): Promise<Document | null>;
}
```

---

**File to Modify**: `src/contexts/documents/infrastructure/persistence/PostgresDocumentRepository.ts`

**Add New Method**:
```typescript
async findById(id: DocumentId): Promise<Document | null> {
  const client = await this.connectionManager.getConnection();

  try {
    const result = await client.query(
      'SELECT * FROM documents WHERE id = $1',
      [id.value]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.toDomain(result.rows[0]);
  } finally {
    client.release();
  }
}
```

**Why this implementation**:
- Direct SQL query (simple and efficient)
- Returns null if not found (caller decides error handling)
- Reuses existing `toDomain()` mapper
- Proper resource cleanup with try/finally

---

### STEP 4: Web Layer - Controller

**File**: `src/controllers/documents/GetDocumentController.ts`

```typescript
import { Controller } from '../Controller';
import { Request, Response } from 'express';
import { QueryBus } from '@shared/domain/QueryBus';
import { FindDocumentByIdQuery } from '@documents/application/find-document/FindDocumentByIdQuery';
import { DocumentNotFoundError } from '@documents/domain/DocumentNotFoundError';

export class GetDocumentController implements Controller {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Input validation
      if (!id || id.trim() === '') {
        res.status(400).json({
          error: 'Invalid document ID format'
        });
        return;
      }

      // Create and dispatch query
      const query = new FindDocumentByIdQuery(id);
      const document = await this.queryBus.ask(query);

      // Return success
      res.status(200).json(document.toPrimitives());

    } catch (error) {
      if (error instanceof DocumentNotFoundError) {
        res.status(404).json({
          error: 'Document not found'
        });
      } else {
        res.status(500).json({
          error: 'Internal server error'
        });
      }
    }
  }
}
```

**Rationale**:
- Validates ID format (not empty)
- Dispatches query via QueryBus
- Maps domain errors to HTTP status codes
- Returns DTO primitives as JSON

---

### STEP 5: Web Layer - Routes

**File**: `src/routes/documents.ts`

**Add New Route**:
```typescript
import { Router, Request, Response } from 'express';
import container from '../dependency-injection';

export const register = (router: Router) => {
  // Existing routes...

  // GET /documents/:id - Retrieve document by ID
  const getDocumentController = container.get('Controllers.GetDocumentController');
  router.get('/documents/:id', (req: Request, res: Response) =>
    getDocumentController.run(req, res)
  );
};
```

---

### STEP 6: Web Layer - Swagger Documentation

**File**: `src/docs/documents.swagger.yml`

**Add Documentation**:
```yaml
paths:
  /documents/{id}:
    get:
      summary: Get document by ID
      description: Retrieves a document by its unique identifier
      tags:
        - Documents
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            example: "doc-001"
          description: Document ID
      responses:
        '200':
          description: Document found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentResponse'
        '400':
          description: Invalid document ID format
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Invalid document ID format"
        '404':
          description: Document not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Document not found"
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Internal server error"

components:
  schemas:
    DocumentResponse:
      type: object
      properties:
        id:
          type: string
          example: "doc-001"
        title:
          type: string
          example: "Document Title"
        content:
          type: string
          example: "Full document content..."
        createdAt:
          type: string
          format: date-time
          example: "2024-11-13T10:30:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2024-11-13T10:30:00Z"
```

---

### STEP 7: Dependency Injection - Register Handler

**File**: `src/dependency-injection/documents/index.ts`

**Add DI Registration**:
```typescript
// Query Handler
container.register(
  'Documents.query_handlers.FindDocumentByIdQueryHandler',
  FindDocumentByIdQueryHandler
)
  .addArgument('@Documents.repositories.DocumentRepository');

// Controller
container.register('Controllers.GetDocumentController', GetDocumentController)
  .addArgument('@Shared.QueryBus');

// Register query handler with QueryBus
const queryBus = container.get('Shared.QueryBus');
const findDocumentHandler = container.get(
  'Documents.query_handlers.FindDocumentByIdQueryHandler'
);
queryBus.subscribe(
  FindDocumentByIdQuery,
  (query) => findDocumentHandler.handle(query)
);
```

---

### STEP 8: Testing - Step Definitions

**File**: `tests/step_definitions/documents/get-document.steps.ts`

```typescript
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { World } from '../support/World';

// ============ GIVEN STEPS ============

Given('the following documents exist:',
  async function(this: World, dataTable: DataTable) {
    const documents = dataTable.hashes();
    for (const doc of documents) {
      await this.documentRepository.save({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
);

Given('a document with ID {string} exists',
  async function(this: World, documentId: string) {
    const doc = await this.documentRepository.findById(documentId);
    expect(doc).to.exist;
  }
);

Given('no document exists with ID {string}',
  async function(this: World, documentId: string) {
    const doc = await this.documentRepository.findById(documentId);
    expect(doc).to.be.null;
  }
);

Given('an invalid document ID format {string}',
  function(this: World, invalidId: string) {
    this.lastRequestedDocumentId = invalidId;
  }
);

Given('{int} documents exist in the database',
  async function(this: World, count: number) {
    for (let i = 1; i <= count; i++) {
      await this.documentRepository.save({
        id: `doc-${i}`,
        title: `Document ${i}`,
        content: `Content of document ${i}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
);

// ============ WHEN STEPS ============

When('I request GET /documents/{id}',
  async function(this: World, id: string) {
    try {
      this.lastResponse = await this.apiClient.get(`/documents/${id}`);
      this.lastRequestedDocumentId = id;
    } catch (error: any) {
      this.lastResponse = error.response;
      this.lastRequestedDocumentId = id;
    }
  }
);

When('I request GET /documents/',
  async function(this: World) {
    try {
      this.lastResponse = await this.apiClient.get('/documents/');
    } catch (error: any) {
      this.lastResponse = error.response;
    }
  }
);

// ============ THEN STEPS ============

Then('I should receive status {int}',
  function(this: World, status: number) {
    expect(this.lastResponse.status).to.equal(status);
  }
);

Then('the response should contain the document with ID {string}',
  function(this: World, documentId: string) {
    expect(this.lastResponse.data.id).to.equal(documentId);
  }
);

Then('the response should contain title {string}',
  function(this: World, title: string) {
    expect(this.lastResponse.data.title).to.equal(title);
  }
);

Then('the response should contain content {string}',
  function(this: World, content: string) {
    expect(this.lastResponse.data.content).to.equal(content);
  }
);

Then('the response should have createdAt timestamp',
  function(this: World) {
    expect(this.lastResponse.data.createdAt).to.exist;
    expect(new Date(this.lastResponse.data.createdAt)).to.be.instanceof(Date);
  }
);

Then('the response should NOT contain sensitive metadata',
  function(this: World) {
    expect(this.lastResponse.data).to.not.have.property('password');
    expect(this.lastResponse.data).to.not.have.property('secret');
  }
);

Then('the response should contain error message {string}',
  function(this: World, errorMessage: string) {
    expect(this.lastResponse.data.error).to.equal(errorMessage);
  }
);

Then('the response should NOT contain any document data',
  function(this: World) {
    expect(this.lastResponse.data).to.not.have.property('title');
    expect(this.lastResponse.data).to.not.have.property('content');
  }
);

Then('the response should indicate invalid path',
  function(this: World) {
    expect(this.lastResponse.status).to.equal(404);
  }
);

Then('the response should NOT contain any document data',
  function(this: World) {
    expect(this.lastResponse.data.title).to.be.undefined;
    expect(this.lastResponse.data.content).to.be.undefined;
  }
);

Then('the response title should NOT be {string}',
  function(this: World, title: string) {
    expect(this.lastResponse.data.title).to.not.equal(title);
  }
);

Then('the response should be returned within {int} milliseconds',
  async function(this: World, ms: number) {
    const startTime = Date.now();
    await this.apiClient.get(`/documents/${this.lastRequestedDocumentId}`);
    const elapsed = Date.now() - startTime;
    expect(elapsed).to.be.lessThan(ms);
  }
);

Then('the complete content should be returned',
  function(this: World) {
    expect(this.lastResponse.data.content).to.exist;
    expect(this.lastResponse.data.content.length).to.be.greaterThan(0);
  }
);

Then('the response should be valid JSON',
  function(this: World) {
    expect(this.lastResponse.data).to.be.an('object');
  }
);
```

---

### STEP 9: Unit Tests

**File**: `tests/contexts/documents/application/FindDocumentByIdQueryHandler.test.ts`

```typescript
import { expect } from 'chai';
import { FindDocumentByIdQueryHandler } from '@documents/application/find-document/FindDocumentByIdQueryHandler';
import { FindDocumentByIdQuery } from '@documents/application/find-document/FindDocumentByIdQuery';
import { DocumentNotFoundError } from '@documents/domain/DocumentNotFoundError';
import { DocumentMother } from '../domain/DocumentMother';

describe('FindDocumentByIdQueryHandler', () => {
  let handler: FindDocumentByIdQueryHandler;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = {
      findById: async () => null
    };
    handler = new FindDocumentByIdQueryHandler(repositoryMock);
  });

  it('should return DocumentResponse when document exists', async () => {
    const document = DocumentMother.create({ id: 'doc-001' });
    repositoryMock.findById = async () => document;

    const query = new FindDocumentByIdQuery('doc-001');
    const response = await handler.handle(query);

    expect(response.id).to.equal('doc-001');
    expect(response.title).to.equal(document.title.value);
  });

  it('should throw DocumentNotFoundError when document does not exist', async () => {
    repositoryMock.findById = async () => null;

    const query = new FindDocumentByIdQuery('doc-999');

    try {
      await handler.handle(query);
      throw new Error('Should have thrown DocumentNotFoundError');
    } catch (error) {
      expect(error).to.be.instanceof(DocumentNotFoundError);
    }
  });

  it('should call repository with correct DocumentId', async () => {
    let capturedId: any = null;
    repositoryMock.findById = async (id: any) => {
      capturedId = id;
      return DocumentMother.create();
    };

    const query = new FindDocumentByIdQuery('doc-001');
    await handler.handle(query);

    expect(capturedId.value).to.equal('doc-001');
  });
});
```

---

### STEP 10: Integration Tests

**File**: `tests/contexts/documents/infrastructure/PostgresDocumentRepository.findById.test.ts`

```typescript
import { expect } from 'chai';
import { PostgresDocumentRepository } from '@documents/infrastructure/persistence/PostgresDocumentRepository';
import { DocumentMother } from '../domain/DocumentMother';
import { DocumentId } from '@documents/domain/DocumentId';

describe('PostgresDocumentRepository - findById', () => {
  let repository: PostgresDocumentRepository;
  let db: any;

  beforeEach(async () => {
    // Setup test database connection
    db = await setupTestDatabase();
    repository = new PostgresDocumentRepository(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it('should return document when it exists', async () => {
    const document = DocumentMother.create({ id: 'doc-001' });
    await repository.save(document);

    const result = await repository.findById(new DocumentId('doc-001'));

    expect(result).to.exist;
    expect(result?.id.value).to.equal('doc-001');
  });

  it('should return null when document does not exist', async () => {
    const result = await repository.findById(new DocumentId('doc-999'));

    expect(result).to.be.null;
  });

  it('should return document with all properties intact', async () => {
    const document = DocumentMother.create({
      id: 'doc-001',
      title: 'Test Document',
      content: 'Test content with special chars: @#$%'
    });
    await repository.save(document);

    const result = await repository.findById(new DocumentId('doc-001'));

    expect(result?.id.value).to.equal('doc-001');
    expect(result?.title.value).to.equal('Test Document');
    expect(result?.content.value).to.contain('@#$%');
  });
});
```

---

## Implementation Sequence

### Phase 2.3: GET /documents/{id}

```
STEP 1: Domain Layer (Review/Add Error)
  └─ Add DocumentNotFoundError.ts

STEP 2: Application Layer
  ├─ Create FindDocumentByIdQuery.ts
  ├─ Create DocumentResponse.ts
  └─ Create FindDocumentByIdQueryHandler.ts

STEP 3: Infrastructure Layer
  ├─ Update DocumentRepository interface
  └─ Implement findById() in PostgresDocumentRepository

STEP 4: Web Layer
  ├─ Create GetDocumentController.ts
  ├─ Update documents.ts routes
  └─ Update documents.swagger.yml

STEP 5: Dependency Injection
  └─ Register handler and controller in DI container

STEP 6: Testing
  ├─ Create step definitions
  ├─ Create unit tests
  ├─ Create integration tests
  └─ Run acceptance tests (Gherkin)

STEP 7: Verification
  ├─ Run full test suite
  ├─ Type checking passes
  ├─ Linting passes
  └─ Manual API testing
```

---

## Testing Checklist

```
UNIT TESTS
[ ] QueryHandler handles found document
[ ] QueryHandler throws on not found
[ ] DTO transformation works correctly

INTEGRATION TESTS
[ ] Repository.findById() finds document
[ ] Repository.findById() returns null when not found
[ ] Document properties preserved from DB

ACCEPTANCE TESTS
[ ] GET /documents/{id} returns 200 for existing
[ ] GET /documents/{id} returns 404 for non-existing
[ ] GET /documents/{id} returns 400 for invalid ID
[ ] Multiple documents: correct one returned
[ ] Special characters preserved in content
[ ] Response within performance target

MANUAL TESTS
[ ] Swagger UI works at /api-docs
[ ] Example request/response visible
[ ] Error responses display correctly
```

---

## Commit Message Template

```
feat(documents): implement GET /documents/{id} endpoint

- Add FindDocumentByIdQuery and QueryHandler (CQRS pattern)
- Extend DocumentRepository with findById() method
- Implement PostgreSQL query for single document retrieval
- Create GetDocumentController with error handling
- Add route GET /documents/:id
- Add comprehensive Swagger documentation
- Include step definitions for all Gherkin scenarios
- Create unit and integration tests
- Performance target: < 200ms P95

Architectural decisions applied:
- Query operation with no validations
- Repository pattern for simple FindById
- CQRS Query/Handler for consistency
- No caching (reserved for Phase 5)
- No events (read operation)
```

---

## Future Enhancements (Not in Phase 2.3)

### Phase 3: Multi-Tenancy
- [ ] Add tenantId filter to findById()
- [ ] Update controller to extract tenantId from request
- [ ] Add 403 Forbidden for unauthorized access

### Phase 5: Caching
- [ ] Add CacheService abstraction
- [ ] Implement Cache-Aside pattern
- [ ] Set TTL: 5 minutes
- [ ] Add cache invalidation on DELETE

### Phase 6: Rate Limiting
- [ ] Apply rate limiting middleware
- [ ] Return 429 Too Many Requests

---

## Success Criteria

- ✅ All Gherkin scenarios pass
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Type checking clean (no errors)
- ✅ Linting clean (no warnings)
- ✅ Swagger documentation complete
- ✅ Manual API testing successful
- ✅ Performance < 200ms P95
- ✅ Ready for Phase 3 multi-tenancy
