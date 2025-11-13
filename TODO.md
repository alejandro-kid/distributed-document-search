# Distributed Document Search Service - Implementation Plan

## Phase 1: Project Setup & Refactoring ✅

### 1.1 Initialize Base Project ✅

- [x] Fix TypeScript errors in MockSocialAuthenticator
- [x] Add TypeScript type checking command (check:type)
- [x] Add unified check command (check:type + lint:fix)
- [x] Update test:all to run checks before tests
- [x] Exclude CLAUDE.md from ESLint
- [x] Update package.json with correct project name and description
- [x] Verify all tests pass (unit + acceptance)
- [x] Create initial commit

### 1.2 Create BDD Scenarios and Step Definitions ✅

- [ ] Create Architectural Decisions document
- [ ] Create feature files for all endpoints (5 feature files with 50+ scenarios)
- [ ] Create step definitions (5 step definition files with 83+ steps)
- [ ] Fix TypeScript and ESLint configuration
- [ ] Create commit: "feat(bdd): create BDD scenarios for document search service"
- [ ] Create commit: "test(step-definitions): create step definitions for all features"
- [ ] Create commit: "fix(config): update eslint configuration for test files"

### 1.3 Refactor Base Project to Document Search Context ✅

- [x] Rename `users` context to `documents`
- [x] Replace User aggregate with Document aggregate
- [x] Update UserRepository to DocumentRepository
- [x] Replace authentication-related code with document management code
- [x] Update all import paths and references
- [x] Update DI configuration for documents context
- [x] Verify all tests still pass
- [x] Create commit: "refactor(context): rename users context to documents"

---

## Phase 2: REST API Endpoints Implementation (from README.md)

### 2.1 POST /documents - Index a New Document ✅

**Feature File**: Create BDD scenarios for document indexing

- [x] Create feature file: `tests/features/documents/index-document.feature`
  - [x] Scenario: Successfully index a new document
  - [x] Scenario: Cannot index document without required fields
  - [x] Scenario: Document is searchable after indexing (via tests)

**Implementation** (following DDD + CQRS + EDA):

- [x] Create domain: Document aggregate with IndexedEvent
- [x] Create application: IndexDocumentUseCase with request/response
- [x] Create infrastructure: PostgreSQL repository for documents
- [x] Create controller: IndexDocumentController
- [x] Create route: POST /documents
- [x] Create Swagger docs: documents.swagger.yml
- [x] Configure DI for documents context
- [x] Unit tests for domain logic (14 tests)
- [x] Integration tests for use case (12 tests)
- [x] Acceptance tests (Cucumber) (10 scenarios, 41 steps)
- [x] Verify checks and tests pass
- [x] Create commit: "feat(documents): implement POST /documents endpoint"
- [x] Add input validation: title/content empty and length constraints
- [x] Create PostgresDocumentRepository tests (10 tests)
- [x] Create commit: "feat(documents): add comprehensive input validation"

**Pending Cache Invalidation** (to be implemented in Phase 5):

- [ ] Create CacheService abstraction
- [ ] Create InMemoryCacheService implementation (for development/testing)
- [ ] Inject CacheService into IndexDocumentUseCase for cache invalidation
- [ ] Implement cache invalidation after document creation
- [ ] Tests for cache invalidation
- [ ] Create commit: "feat(documents): add cache invalidation on document indexing"

**Pending Event Handlers** (to be implemented in Phase 4):

- [ ] SearchEngineIndexingHandler: Listen to DocumentIndexedEvent to index in PostgreSQL FTS
  - Will be implemented in Phase 4 when PostgreSQL FTS is added
  - Pattern: Outbox (critical - document must be searchable)
  - Retry: Exponential backoff

### 2.2 GET /search - Search Documents

**Feature File**: Create BDD scenarios for searching

- [ ] Create feature file: `tests/features/documents/search-documents.feature`
  - [ ] Scenario: Successfully search documents
  - [ ] Scenario: Search returns empty results for non-matching query
  - [ ] Scenario: Search returns multiple results

**Implementation**:

- [ ] Create application: SearchDocumentsQuery and QueryHandler
- [ ] Create infrastructure: Search implementation (PostgreSQL FTS)
- [ ] Create controller: SearchDocumentsController
- [ ] Create route: GET /search?q={query}&tenant={tenantId}
- [ ] Update Swagger docs
- [ ] Unit and integration tests
- [ ] Acceptance tests (Cucumber)
- [ ] Verify checks and tests pass
- [ ] Create commit: "feat(documents): implement GET /search endpoint"

### 2.3 GET /documents/{id} - Retrieve Document Details ✅

**Status**: ✅ COMPLETED

**Architectural Decisions**: ✅ Complete

- Decision Framework applied: QUERY operation, no validation, Repository Pattern
- Document: `docs/decisions/get-document-decisions.md`

**Feature File**: ✅ Complete

- [x] Create feature file: `tests/features/documents/get-document.feature`
  - [x] Scenario: Successfully retrieve document by ID
  - [x] Scenario: Return 404 for non-existent document
  - [x] Scenario: Invalid document ID format (400)
  - [x] Scenario: Return appropriate response when document ID is missing
  - [x] Scenario: Retrieve correct document among multiple documents

**Implementation Plan**: ✅ Complete

- Document: `docs/implementation-plan/get-document-implementation.md`
- CQRS Pattern: Query/QueryHandler (consistent with codebase)
- Repository Method: findById() with SQL direct query
- Error Handling: 404/400/500 HTTP responses
- Testing: Unit + Integration + Acceptance

**Implementation**: ✅ Complete

- [x] STEP 1: Add DocumentNotFoundError domain error
- [x] STEP 2: Create FindDocumentByIdQuery and QueryHandler
- [x] STEP 3: Extend DocumentRepository with findById()
- [x] STEP 4: Create GetDocumentController
- [x] STEP 5: Add route GET /documents/:id
- [x] STEP 6: Update Swagger documentation
- [x] STEP 7: Register DI components
- [x] STEP 8: Create step definitions (Gherkin)
- [x] STEP 9: Create unit tests
- [x] STEP 10: Create integration tests
- [x] Verify checks and tests pass
- [x] Create commit: "feat(documents): implement GET /documents/{id} endpoint"

**Files Created**:

- `src/contexts/documents/application/find-document/FindDocumentByIdUseCase.ts`
- `src/contexts/documents/application/find-document/FindDocumentByIdRequest.ts`
- `src/contexts/documents/application/find-document/DocumentResponse.ts`
- `src/controllers/GetDocumentController.ts`
- `tests/features/documents/get-document.feature`
- `tests/step_definitions/documents/get-document.steps.ts`
- `tests/contexts/documents/application/find-document/FindDocumentByIdUseCase.test.ts`
- `tests/contexts/documents/controllers/GetDocumentController.test.ts`
- Updated `src/contexts/documents/domain/DocumentRepository.ts` with findById()
- Updated `src/contexts/documents/infrastructure/persistence/PostgresDocumentRepository.ts` with findById() implementation

### 2.4 DELETE /documents/{id} - Remove a Document ✅

**Status**: ✅ COMPLETED

**Architectural Decisions**: ✅ Complete

- Decision Framework applied: COMMAND operation, SYNCHRONOUS validation (document exists)
- Document: `docs/decisions/delete-document-decisions.md`
- Non-critical events: No Outbox Pattern needed

**Feature File**: ✅ Complete

- [x] Create feature file: `tests/features/documents/delete-document.feature`
  - [x] Scenario: Successfully delete document (204)
  - [x] Scenario: Return 404 for non-existent document
  - [x] Scenario: Invalid ID format returns 400
  - [x] Scenario: Missing ID returns 400

**Implementation**: ✅ Complete

- [x] Create domain: DocumentDeletedEvent
- [x] Create application: DeleteDocumentUseCase with synchronous validation
- [x] Extend DocumentRepository with delete() method
- [x] Create controller: DeleteDocumentController
- [x] Create route: DELETE /documents/:id
- [x] Update Swagger docs
- [x] Register DI components
- [x] Create step definitions (Gherkin)
- [x] Create unit tests (DeleteDocumentUseCase)
- [x] Create integration tests (DeleteDocumentController)
- [x] Verify checks and tests pass
- [x] Create commit: "feat(documents): implement DELETE /documents/{id} endpoint"

**BDD Test Infrastructure**: ✅ Complete

- [x] Create shared-document.steps.ts with DocumentWorld context
- [x] Implement Cucumber's World pattern for scenario-level state isolation
- [x] Move common step definitions to shared file (Before/After hooks, common Given/Then steps)
- [x] Refactor get-document.steps.ts to use shared DocumentWorld
- [x] Refactor delete-document.steps.ts to use shared DocumentWorld
- [x] Fix unit test IDs to use valid UUIDs
- [x] All 22 BDD scenarios passing (0 ambiguous steps)
- [x] All 62 unit tests passing
- [x] Verify checks and tests pass

**Files Created**:

- `docs/decisions/delete-document-decisions.md` - Architectural decisions document
- `tests/features/documents/delete-document.feature` - BDD scenarios
- `tests/step_definitions/documents/delete-document.steps.ts` - Step implementations
- `tests/step_definitions/documents/shared-document.steps.ts` - Shared DocumentWorld context (NEW)
- `src/contexts/documents/application/delete-document/DeleteDocumentUseCase.ts` - Use case
- `src/contexts/documents/application/delete-document/DeleteDocumentRequest.ts` - Request DTO
- `src/contexts/documents/domain/events/DocumentDeletedEvent.ts` - Domain event
- `src/controllers/DeleteDocumentController.ts` - HTTP controller
- `tests/contexts/documents/application/delete-document/DeleteDocumentUseCase.test.ts` - Unit tests
- `tests/contexts/documents/controllers/DeleteDocumentController.test.ts` - Integration tests
- Updated `src/contexts/documents/domain/DocumentRepository.ts` with delete() method
- Updated `src/contexts/documents/infrastructure/persistence/PostgresDocumentRepository.ts` with delete() implementation
- Updated `src/routes/documents.route.ts` with DELETE route
- Updated `src/routes/documents.swagger.yml` with DELETE operation
- Updated `src/dependency-injection/documents/index.ts` with DI registration
- Updated `tests/step_definitions/documents/get-document.steps.ts` to use DocumentWorld (REFACTORED)
- Updated `tests/step_definitions/documents/delete-document.steps.ts` to use DocumentWorld (REFACTORED)
- Updated `src/controllers/DeleteDocumentController.ts` with UUID format validation (ENHANCED)

**Test Results**: ✅ All Passing

- Unit Tests: DeleteDocumentUseCase (3 tests) + DeleteDocumentController (7 tests) + All Others (52 tests) = 62 tests ✅
- Type Checking: All types correct ✅
- ESLint: All linting rules pass ✅
- Acceptance Tests: 22 BDD scenarios (0 ambiguous) ✅
  - All GET scenarios passing
  - All DELETE scenarios passing
  - All shared steps working correctly with DocumentWorld isolation

---

## Phase 3: Multi-Tenancy Support

### 3.1 Multi-Tenant Support (Header-based or Path-based)

**Feature File**: Create BDD scenarios for multi-tenancy

- [ ] Create feature file: `tests/features/documents/multi-tenancy.feature`
  - [ ] Scenario: User can only search their tenant's documents
  - [ ] Scenario: Different tenants cannot see each other's documents

**Implementation**:

- [ ] Add tenantId to Document aggregate
- [ ] Create middleware for tenant extraction (header: X-Tenant-ID)
- [ ] Update DocumentRepository to support tenant isolation
- [ ] Update all use cases to enforce tenant context
- [ ] Update controllers to validate tenant access
- [ ] Tests verifying tenant isolation
- [ ] Verify checks and tests pass
- [ ] Create commit: "feat(multi-tenancy): implement tenant isolation"

---

## Phase 4: Search Functionality Enhancement

### 4.1 PostgreSQL Full-Text Search (FTS) - Basic Implementation ✅

**Status**: ✅ COMPLETED

- [x] Create BDD scenarios for search: `tests/features/documents/search-documents.feature`
  - [x] Scenario: Successfully search documents with matching query (3 matching docs)
  - [x] Scenario: Search returns empty results for non-matching query
  - [x] Scenario: Search matches both title and content
- [x] Create step definitions: `tests/step_definitions/search.steps.ts`
- [x] Implement DocumentSearcher use case
- [x] Update DocumentRepository with search() method using PostgreSQL FTS
- [x] Create SearchDocumentsController and GET /search route
- [x] Add Swagger documentation for GET /search
- [x] Configure dependency injection
- [x] All tests passing (13 scenarios, 54 steps)

### 4.2 Advanced Search Features (Pospuesto - Future Enhancements)

**These features will be implemented after all basic endpoints are complete:**

#### 4.2.1 Relevance Ranking

- [ ] Implement FTS ranking with `ts_rank()` PostgreSQL function
- [ ] Weight title matches higher than content matches
- [ ] Update SearchDocumentsResponse to include relevance scores
- [ ] Sort results by relevance score (highest first)
- [ ] Add relevance filtering/threshold
- [ ] BDD scenarios for relevance testing

#### 4.2.2 Pagination

- [ ] Add limit/offset parameters to SearchDocumentsQuery
- [ ] Update SearchDocumentsResponse with pagination metadata (total, page, limit)
- [ ] Update repository search method to support pagination
- [ ] Update controller to validate and pass pagination params
- [ ] Update Swagger documentation with pagination params
- [ ] BDD scenarios for pagination testing

#### 4.2.3 Advanced Filters

- [ ] Add dateFrom/dateTo filter support
- [ ] Add createdBy/author filter support
- [ ] Support multiple query terms with AND/OR logic
- [ ] Support phrase search with quotes
- [ ] BDD scenarios for advanced filters

#### 4.2.4 Search Performance & Indexing

- [ ] Create PostgreSQL search index on title and content fields
- [ ] Analyze FTS performance with large datasets
- [ ] Implement SearchEngineIndexingHandler for automatic indexing
- [ ] Add retry logic for failed indexing operations
- [ ] Performance benchmarks and optimization

---

## Phase 5: Caching Layer

### 5.1 Simple Caching Layer (Redis for Production, In-Memory for Test)

**Feature File**: Create BDD scenarios for caching

- [ ] Create feature file: `tests/features/documents/caching.feature`
  - [ ] Scenario: Document retrieved from cache on second request
  - [ ] Scenario: Cache invalidated after document update

**Implementation**:

- [ ] Create CacheService abstraction
- [ ] Create RedisCache implementation (production)
- [ ] Create InMemoryCache implementation (development/testing)
- [ ] Configure DI to switch implementations by environment
- [ ] Add caching to:
  - [ ] GET /documents/{id}
  - [ ] GET /search (with query as key)
- [ ] Cache invalidation on PUT/DELETE
- [ ] Tests for cache hit/miss scenarios
- [ ] Verify checks and tests pass
- [ ] Create commit: "feat(caching): implement Redis and In-Memory cache layers"

---

## Phase 6: Rate Limiting

### 6.1 Basic Rate Limiting Per Tenant

**Feature File**: Create BDD scenarios for rate limiting

- [ ] Create feature file: `tests/features/documents/rate-limiting.feature`
  - [ ] Scenario: User can make N requests per minute
  - [ ] Scenario: Request rejected when rate limit exceeded (429)
  - [ ] Scenario: Rate limit resets after time window

**Implementation**:

- [ ] Create RateLimiter service
- [ ] Create Redis-based rate limiter
- [ ] Create In-Memory rate limiter (for tests)
- [ ] Create middleware for rate limiting
- [ ] Configure per-tenant rate limits (e.g., 1000 req/min)
- [ ] Return 429 when limit exceeded with retry-after header
- [ ] Tests for rate limit enforcement
- [ ] Verify checks and tests pass
- [ ] Create commit: "feat(rate-limiting): implement basic rate limiting per tenant"

---

## Phase 7: Health Check & Observability ✅

### 7.1 Health Check Endpoint with Dependency Status ✅

**Status**: ✅ COMPLETED

**Feature File**: ✅ Complete

- [x] Updated `tests/features/status.feature` with BDD scenarios
  - [x] Scenario: Check the api status (basic health check)
  - [x] Additional scenarios pending (commented for future enhancement)

**Implementation**: ✅ Complete

- [x] Domain Layer:
  - [x] DependencyStatus ValueObject (UP/DOWN)
  - [x] DependencyHealth ValueObject (per-dependency tracking)
  - [x] ApplicationHealth Aggregate (full health state)
  - [x] HealthCheckService Interface
- [x] Application Layer:
  - [x] GetHealthStatusUseCase (Query operation)
  - [x] HealthStatusResponse (DTO)
- [x] Infrastructure Layer:
  - [x] PostgreSQLHealthChecker (database connectivity check)
  - [x] HealthCheckServiceImpl (aggregates all checks)
  - [x] PackageVersion utility (reads from package.json)
- [x] Endpoint Integration:
  - [x] StatusGetController enhanced with GetHealthStatusUseCase injection
  - [x] Returns 200 with health status when all dependencies OK
  - [x] Returns 503 with health status when dependencies down
  - [x] Returns structured JSON response with:
    - [x] status: 'healthy' | 'unhealthy'
    - [x] timestamp: ISO 8601 format
    - [x] uptime: seconds since startup
    - [x] version: application version
    - [x] dependencies: per-dependency status map
- [x] Testing:
  - [x] Object Mothers for all domain objects
  - [x] Unit tests for all domain and application classes
  - [x] Step definitions with comprehensive assertions
  - [x] All BDD scenarios passing (22 scenarios, 93 steps)
- [x] Verify checks and tests pass: ✅ All passing
- [x] Create commit: "feat(observability): implement health check system with dependency monitoring"

**Redis Health Check**: ⏳ Pending Phase 5 (Caching Layer implementation)

---

## Phase 8: Final Verification & Documentation

### 8.1 Complete Integration Testing

- [ ] Run full test suite: `pnpm test:all`
- [ ] Verify all unit tests pass
- [ ] Verify all acceptance tests pass
- [ ] Check code coverage (at least 80%)
- [ ] Verify no TypeScript errors: `pnpm check:type`
- [ ] Verify no linting issues: `pnpm lint:fix`

### 8.2 API Documentation

- [ ] Verify all endpoints documented in Swagger
- [ ] Test Swagger UI at `/api-docs`
- [ ] Verify example requests/responses

### 8.3 Architecture Documentation

- [ ] Create ARCHITECTURE.md with:
  - [ ] System architecture diagram
  - [ ] Data flow diagrams
  - [ ] Database/storage strategy
  - [ ] Caching strategy
  - [ ] Multi-tenancy approach
  - [ ] API design overview
  - [ ] Consistency model and trade-offs

### 8.4 Production Readiness Analysis

- [ ] Document scalability approach
- [ ] Document resilience/fault tolerance
- [ ] Document security measures
- [ ] Document observability/monitoring
- [ ] Document performance optimization strategies
- [ ] Document deployment strategy
- [ ] Document SLA targets (99.95% availability)

### 8.5 Final Commit

- [ ] Create final commit: "docs(project): complete architecture documentation"

---

## Notes

- **BDD First**: Every feature must have a .feature file with Gherkin scenarios before implementation
- **DDD + Hexagonal**: Follow domain-driven design with clear separation of layers
- **CQRS**: Separate commands (write) from queries (read)
- **EDA**: Use domain events for eventual consistency
- **Testing**: Unit + Integration + Acceptance tests for every feature
- **Git Flow**: Follow the established Git Flow workflow with squashed commits
- **Checks**: Before every commit: `pnpm check && pnpm test:all` must pass

---

## Progress Tracking

| Phase | Status | Commits |
|-------|--------|---------|
| 1. Setup & Refactoring | ✅ 100% | 4 |
| 1.1 Base Project Init | ✅ 100% | 1 |
| 1.2 BDD Scenarios | ✅ 100% | 3 |
| 1.3 Context Refactoring | ✅ 100% | 0 |
| 2. REST API Endpoints | ✅ 100% | 6 |
| 2.1 POST /documents | ✅ 100% | 2 |
| 2.2 GET /search | ✅ 100% | 1 |
| 2.3 GET /documents/{id} | ✅ 100% | 1 |
| 2.4 DELETE /documents/{id} | ✅ 100% | 2 |
| 3. Multi-Tenancy | ⏳ 0% | 0 |
| 4. Search Enhancement | 🟢 5% | 0 |
| 4.1 PostgreSQL FTS Basic | ✅ 100% | 0 |
| 4.2 Advanced Search Features | ⏳ 0% | 0 |
| 5. Caching Layer | ⏳ 0% | 0 |
| 6. Rate Limiting | ⏳ 0% | 0 |
| 7. Health Check | ✅ 100% | 1 |
| 8. Final Verification | ⏳ 0% | 0 |

**Total Progress**: ~55% (12 of 21 major sub-tasks completed)

### Completed Artifacts

- ✅ Package.json configured with proper check commands
- ✅ 8 Feature Files (7 Gherkin scenario files including delete-document.feature)
- ✅ 8 Step Definitions Files (step implementations across all features, with shared DocumentWorld context)
- ✅ 3 Architectural Decisions Documents (GET /documents/{id}, DELETE /documents/{id}, and more)
- ✅ ESLint and TypeScript fully configured
- ✅ All tests passing (22 BDD scenarios, 93 steps total - 0 ambiguous)
- ✅ All unit tests passing (62 tests)
- ✅ POST /documents endpoint with validation and domain events
- ✅ GET /search endpoint with PostgreSQL FTS
- ✅ GET /documents/{id} endpoint with CQRS Query Handler
- ✅ DELETE /documents/{id} endpoint with synchronous validation
- ✅ Domain layer: Document aggregate, DocumentDeletedEvent, DocumentRepository with delete()
- ✅ Application layer: Use cases (Index, Search, Get, Delete), Request/Response DTOs, QueryHandlers
- ✅ Infrastructure layer: PostgresDocumentRepository with findById() and delete()
- ✅ Controllers: IndexDocumentController, SearchDocumentsController, GetDocumentController, DeleteDocumentController
- ✅ Swagger documentation for all endpoints (POST, GET, DELETE)
- ✅ BDD Test Infrastructure: Cucumber World pattern with DocumentWorld for scenario state isolation
- ✅ Unit and integration tests for all 4 endpoints (62 tests passing)
