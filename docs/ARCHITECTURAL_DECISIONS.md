# Architectural Decisions - Distributed Document Search Service

## Phase 1.2: Context Refactoring - Users → Documents

### Operation Analysis

#### Synchronous Operations (Immediate Response Required)

1. **Index Document (POST /documents)**
   - **Why**: User expects immediate confirmation that document was accepted
   - **How**: Synchronous persistence in PostgreSQL
   - **Decision**: Persist document synchronously, then publish event asynchronously
   - **Performance Target**: < 200ms

2. **Search Documents (GET /search?q={query})**
   - **Why**: User needs immediate search results
   - **How**: Query PostgreSQL FTS or search engine
   - **Decision**: Synchronous query execution with caching
   - **Performance Target**: < 500ms (P95)

3. **Retrieve Document (GET /documents/{id})**
   - **Why**: User expects immediate retrieval
   - **How**: Synchronous query with caching
   - **Decision**: Cache layer (Redis/In-Memory)
   - **Performance Target**: < 100ms (with cache)

4. **Delete Document (DELETE /documents/{id})**
   - **Why**: User expects immediate confirmation
   - **How**: Synchronous deletion + event publication
   - **Decision**: Delete synchronously, publish event asynchronously
   - **Performance Target**: < 200ms

#### Asynchronous Operations (Side Effects)

1. **Search Engine Indexing**
   - **Why**: Can happen in background after document stored in DB
   - **How**: Event Handler listening to DocumentIndexedEvent
   - **Retry**: Exponential backoff if indexing fails

2. **Audit Logging**
   - **Why**: Non-critical, for compliance
   - **How**: Event Handler listening to Document events
   - **Retry**: Can be eventually consistent

3. **Cache Invalidation**
   - **Why**: Other services can use stale data temporarily
   - **How**: Event Handler invalidates cache
   - **Retry**: Not critical, next query will fetch fresh data

#### Event Criticality

| Event | Critical | Pattern | Reason |
|-------|----------|---------|--------|
| DocumentIndexed | YES | Outbox | Without this, document won't be searchable |
| DocumentDeleted | YES | Outbox | Without this, document still searchable after deletion |
| DocumentUpdated | YES | Outbox | Without this, updates won't propagate to search engine |
| DocumentAudited | NO | Simple Publish | Can occasionally lose audit events |

**Decision**: Use **Outbox Pattern** for critical events

### Multi-Tenancy Decision

**Isolation Level**: Tenant separation at application level

- **Approach**: tenantId passed in every operation
- **Storage**: Single shared database with tenant_id column
- **Enforcement**: Check tenantId in every query and command
- **Scalability**: Ready to move to per-tenant databases later

### Search Strategy Decision

**For Initial Implementation**:

- **Technology**: PostgreSQL Full-Text Search (FTS)
- **Why**: Already have PostgreSQL, no external dependency
- **Future**: Can migrate to Elasticsearch for 10M+ documents

**Indexing**:

- GIN index on tsvector column
- Automatic update via trigger on content changes

### Caching Strategy

**Dual Implementation**:

1. **Redis** (Production): Distributed cache, TTL 5 minutes
2. **In-Memory** (Development/Test): Simple Map, TTL same

**What to Cache**:

- Single document retrieval (GET /documents/{id})
- Search results (query-based key)

**Invalidation**:

- On PUT/DELETE: Synchronously clear related keys
- On IndexedEvent: Event handler clears search cache

### Performance Targets

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Index Document | 50ms | 150ms | 300ms |
| Search (100K docs) | 100ms | 400ms | 700ms |
| Get Document | 5ms (cached) | 50ms (uncached) | 100ms |
| Delete Document | 50ms | 150ms | 300ms |
| Health Check | 20ms | 50ms | 100ms |

### Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API | Express.js | Lightweight, TypeScript support |
| Database | PostgreSQL | FTS support, transactions, ACID |
| Caching | Redis + In-Memory | Production and testing |
| Search | PostgreSQL FTS (v1), Elasticsearch (future) | Simplicity vs Scale |
| Rate Limiting | Redis-based | Distributed, accurate |
| Events | Domain Events + Outbox | Zero event loss |

---

## Document Structure (Domain Model)

```typescript
Document {
  id: UUID
  tenantId: UUID (for multi-tenancy)
  title: string
  content: string (full-text searchable)
  metadata: JSON (optional, for extensions)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## API Endpoints Summary

| Method | Endpoint | Tenant Isolated | Cached |
|--------|----------|-----------------|--------|
| POST | /documents | Yes | No |
| GET | /search?q={q}&tenant={t} | Yes | Yes (30s) |
| GET | /documents/{id} | Yes | Yes (5m) |
| DELETE | /documents/{id} | Yes | No |
| GET | /status | No | No |

---

## Decision Trail

### Why Outbox Pattern?

**Rejected Alternatives**:

- ❌ Direct event publishing: Risk of data loss if event fails after DB commit
- ❌ Eventual consistency without pattern: No guarantee events are processed
- ✅ **Outbox Pattern**: Atomic operation - either both saved or both fail

### Why PostgreSQL FTS first?

**Rejected Alternatives**:

- ❌ Elasticsearch: Complexity, operations overhead
- ❌ Full custom solution: Time constraint
- ✅ **PostgreSQL FTS**: We have it, can search, easy to scale

### Why Synchronous indexing?

**Rejected Alternatives**:

- ❌ Fully asynchronous: Document indexed but not searchable immediately (bad UX)
- ✅ **Synchronous storage + async search indexing**: Best of both worlds
  - User gets immediate confirmation
  - Search engine catches up asynchronously
  - Can use eventual consistency for search ranking

---

## Future Improvements

1. **Elasticsearch Migration**: When >1M documents
2. **Distributed Caching**: Move Redis to cluster
3. **Event Sourcing**: Full audit trail
4. **CQRS Read Models**: Separate search database
5. **Circuit Breakers**: Graceful degradation
