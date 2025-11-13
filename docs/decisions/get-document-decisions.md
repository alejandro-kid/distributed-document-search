# Feature: Get Document by ID (GET /documents/{id})

## Executive Summary

Implement a simple read operation to retrieve a document by its ID. This is a synchronous query operation with no side effects, using the Repository Pattern with CQRS Query/Handler for consistency with the existing codebase.

---

## 1. Decision Framework Analysis

### Question 1: What Type of Operation Is This?

```
[x] QUERY (Read Operation) ← GET /documents/{id}
[ ] COMMAND (Write Operation)
```

**Decision**: **QUERY** - Pure read operation, no state changes, no domain events.

---

### Question 2: Do You Need Validation Before Executing?

```
[x] NO - Direct Execution
[ ] YES - Critical Validation Required
```

**Decision**: **NO VALIDATION NEEDED**
- User provides only a document ID
- No business rules to check before retrieval
- ID validation is simple format check (not business logic)
- If document doesn't exist → return 404 (standard REST semantics)

---

### Question 3: Where Is the Data You Need?

```
[x] SAME BOUNDED CONTEXT
    └─ Document is stored in PostgreSQL (Documents context)
    └─ All data needed is within Documents aggregate
    └─ DECISION: Use Repository Pattern (SYNCHRONOUS)

[ ] DIFFERENT BOUNDED CONTEXT
```

**Decision**: **REPOSITORY PATTERN - SYNCHRONOUS**
- All data is in the same bounded context
- No external service calls needed
- No data enrichment from other contexts
- Direct single-record lookup

---

### Question 4: What Type of Query Is This?

```
[x] SIMPLE (Single aggregate, GetById)
    └─ One-to-one mapping: ID → Document
    └─ No joins, filters, or complex logic
    └─ DECISION: Repository Pattern (not CQRS read model)

[ ] COMPLEX (Multiple joins, filters, search)
```

**Decision**: **REPOSITORY PATTERN - SIMPLE FINDBYID**
- Single aggregate retrieval
- No pagination needed
- No filters or search criteria
- No denormalization required

---

### Question 5: Are Events Critical?

```
[x] NO EVENTS - This is a read operation
[ ] CRITICAL EVENTS (Outbox Pattern)
[ ] NON-CRITICAL EVENTS (Simple Publish)
```

**Decision**: **NO EVENTS**
- Reading a document doesn't change state
- No domain events emitted
- No side effects to communicate

---

## 2. Decision Tree Summary

```
GET /documents/{id}
├─ Operation: QUERY ✓
├─ Validation: NONE ✓
├─ Data Location: SAME CONTEXT ✓
├─ Sync/Async: SYNCHRONOUS ✓
├─ Events: NONE ✓
├─ Query Type: SIMPLE (GetById) ✓
├─ Pattern: Repository Pattern ✓
├─ CQRS: Query/Handler for consistency ✓
└─ Caching: Plan for Phase 5 ✓
```

---

## 3. Architectural Decisions

### 3.1 Operation Classification

| Aspect | Decision |
|--------|----------|
| **Type** | QUERY (Read Operation) |
| **Complexity** | Simple |
| **User Expectation** | Immediate response (< 200ms) |
| **Response Time** | Synchronous (blocking) |
| **Consistency** | Strong (read from primary DB) |

---

### 3.2 Synchronous Operations

**Retrieve Document by ID from PostgreSQL**

- **Why**: User needs immediate response to determine if document exists
- **How**: `DocumentRepository.findById(documentId)` with direct SQL query
- **Data Source**: PostgreSQL documents table
- **Performance Target**: < 100ms P95
- **No External Dependencies**: All data is local

---

### 3.3 Asynchronous Operations

**NONE** - This is a pure read operation with no side effects.

---

### 3.4 Error Handling

| Status | Scenario | Response |
|--------|----------|----------|
| **200 OK** | Document exists | Full DocumentResponse |
| **400 Bad Request** | Invalid ID format | `{ error: "Invalid document ID format" }` |
| **404 Not Found** | Document doesn't exist | `{ error: "Document not found" }` |
| **500 Internal Server Error** | Database error | `{ error: "Internal server error" }` |

---

### 3.5 Response Format

```json
{
  "id": "doc-001",
  "title": "Document Title",
  "content": "Full document content here...",
  "createdAt": "2024-11-13T10:30:00Z",
  "updatedAt": "2024-11-13T10:30:00Z"
}
```

---

## 4. Pattern Selection Justification

### Why CQRS Query/Handler (Not Direct Repository)?

For **consistency** with existing codebase:
- POST /documents uses `IndexDocumentUseCase` pattern
- GET /search uses `DocumentSearcher` use case pattern
- **Uniform pattern across all endpoints**

**Benefits**:
1. ✅ Consistent with codebase style
2. ✅ Easy to add caching decorator later (Phase 5)
3. ✅ Testable in isolation
4. ✅ Follows Query Bus pattern established

---

### Why NOT Read Model?

**Read Model** is used in GET /search because:
- ✅ Complex query with multiple filters
- ✅ Full-text search requires indexed data

**GET /documents/{id}** doesn't need Read Model because:
- ❌ Simple single-record lookup
- ❌ No denormalization benefit
- ❌ Strong consistency appropriate

---

## 5. Caching Strategy (Phase 5)

**Decision**: Plan for caching in Phase 5, implement without cache in Phase 2.3

**Future Implementation**:
- **Pattern**: Cache-Aside (Lazy Loading)
- **Cache Key**: `document:{documentId}`
- **TTL**: 5 minutes
- **Cache Layer**: Redis (production), In-Memory (test)

---

## 6. Multi-Tenancy Consideration (Phase 3)

**Current State**: Document aggregate doesn't have tenantId yet

**Impact on GET /documents/{id}**:
- **NOW (Phase 2.3)**: No tenant isolation
- **LATER (Phase 3)**: Will require `findByIdAndTenantId(id, tenantId)`

**Migration Path**:
```typescript
// Phase 2.3 (Current)
await repository.findById(documentId)

// Phase 3 (Future)
await repository.findByIdAndTenantId(documentId, tenantId)
```

---

## 7. Implementation Layers

### Layer 1: Domain (No Changes)
- ✅ Document aggregate exists
- ✅ DocumentId value object exists

### Layer 2: Application (CQRS Query/Handler)
- [ ] `FindDocumentByIdQuery` class
- [ ] `FindDocumentByIdQueryHandler` class
- [ ] `DocumentNotFoundError` domain error
- [ ] DTOs: Request & Response

### Layer 3: Infrastructure (Repository)
- [ ] `findById()` in `DocumentRepository` interface
- [ ] Implementation in `PostgresDocumentRepository`
- [ ] SQL: `SELECT * FROM documents WHERE id = $1`

### Layer 4: Web (Controller + Routes)
- [ ] `GetDocumentController`
- [ ] Route: `GET /documents/:id`
- [ ] Swagger documentation

### Layer 5: Testing
- [ ] Unit tests for QueryHandler
- [ ] Integration tests for Repository
- [ ] Acceptance tests (Gherkin)

---

## 8. Decision Summary Table

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Operation Type | QUERY | Read-only, no state change |
| Validation | None required | Only ID needed, format check only |
| Data Source | Repository (same context) | Documents context has all data |
| Synchronous | Yes | User needs immediate response |
| Pattern | CQRS Query/Handler | Consistency with codebase |
| Caching | Phase 5 | Not critical for first implementation |
| Events | None | No state change, no side effects |
| Error Handling | 404/400/500 | Standard HTTP semantics |
| Performance Target | < 200ms P95 | Single DB query is sufficient |

---

## Conclusion

GET /documents/{id} is a **simple synchronous read operation** that requires:
1. **Repository Pattern** for document retrieval
2. **CQRS Query/Handler** for consistency
3. **Standard error handling** (404/400/500)
4. **Future preparation** for Phase 3 & Phase 5
