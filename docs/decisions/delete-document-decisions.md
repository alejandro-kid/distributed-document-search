# Architectural Decisions: DELETE /documents/{id}

## Feature Overview

**Endpoint**: `DELETE /documents/{id}`
**Description**: Delete a document by its ID
**Scope**: Remove a document from the system

---

## Decision Framework Application

### Question 1: What Type of Operation Is This?

**Answer**: ✅ **COMMAND (Write Operation)**
- DELETE is a write operation that modifies system state
- Removes a resource from the database

**Decision**: Create `DeleteDocumentUseCase` (not a Query)

---

### Question 2: For COMMANDS - Do You Need Validation Before Executing?

**Answer**: ✅ **YES - Critical Validation Required**
- Must verify document exists before deletion
- Cannot delete a document that doesn't exist
- User needs immediate feedback: 200 OK or 404 Not Found

**Validation Strategy**: SYNCHRONOUS
- User is waiting for the HTTP response
- Response must be immediate
- Cannot be asynchronous

**Validation Logic**:
```
1. Call repository.findById(documentId)
2. If document not found → Throw DocumentNotFoundError
3. If found → Proceed with deletion
```

---

### Question 3: Where Is the Data You Need?

**Answer**: ✅ **SAME BOUNDED CONTEXT**
- Document exists in our database (documents context)
- No external services required
- No cross-context dependencies

**Data Flow**:
```
1. Repository.findById(documentId)  ← Same database, same service
2. Repository.delete(documentId)    ← Same database, same service
```

**Decision**: Use SYNCHRONOUS Repository calls (no HTTP/gRPC needed)

---

### Question 4: Are the Events Critical?

**Answer**: ❌ **NO - Non-Critical Events**

**Event**: `DocumentDeletedEvent`

**Why Non-Critical**:
- Deletion events don't trigger payments or revenue
- No other bounded contexts depend on deletion in real-time
- Event loss is acceptable (document is already deleted)
- Side effects are optional (cleanup, analytics, etc.)

**Comparison with POST /documents**:
- POST: Creates document → CRITICAL (affects billing, search)
- DELETE: Removes document → NON-CRITICAL (already deleted)

**Decision**: Use SIMPLE PUBLISH (fire & forget)
- Publish event to EventBus
- Don't use Outbox Pattern
- If event publishing fails, log warning but don't fail the HTTP response
- Allow eventual consistency for event handlers

---

### Question 5: For QUERIES - What Type of Query Is It?

**Answer**: N/A (This is a COMMAND, not a QUERY)

---

## Implementation Strategy

### HTTP Response

**Status Codes**:
- `204 No Content` - Successful deletion (no response body needed)
- `404 Not Found` - Document doesn't exist
- `400 Bad Request` - Invalid document ID format
- `500 Internal Server Error` - Unexpected error

**Request**:
```
DELETE /documents/{id}
```

**Response (204)**:
```
(no content, just status code)
```

**Response (404)**:
```json
{
  "error": "Document not found",
  "documentId": "invalid-id"
}
```

### Use Case Flow

```
DeleteDocumentUseCase.run(request: DeleteDocumentRequest)
├─ STEP 1: Validate document exists (SYNCHRONOUS)
│   └─ document = repository.findById(id)
│   └─ if (!document) → throw DocumentNotFoundError(id)
│
├─ STEP 2: Delete document
│   └─ repository.delete(id)
│
├─ STEP 3: Create domain event (non-critical)
│   └─ event = DocumentDeletedEvent(id, deletedAt)
│
├─ STEP 4: Publish event asynchronously (fire & forget)
│   └─ eventBus.publish([event])
│   └─ if (error) → log warning (don't fail response)
│
└─ Output: void (204 No Content)
```

### Architecture Layers

**Domain Layer**:
- `DocumentDeletedEvent`: Event emitted when document is deleted
- `DocumentNotFoundError`: Error when document doesn't exist
- Repository interface: `delete(id: DocumentId): Promise<void>`

**Application Layer**:
- `DeleteDocumentUseCase`: Orchestrates the deletion
- `DeleteDocumentRequest`: Input DTO { documentId: string }
- Event publishing with error handling

**Infrastructure Layer**:
- `PostgresDocumentRepository.delete()`: SQL DELETE execution
- Event bus publishing (non-blocking)

**HTTP Layer**:
- `DeleteDocumentController`: Handles HTTP request
- Route: `DELETE /documents/:id`
- Error handling: 404, 400, 500

---

## Key Differences from POST /documents

| Aspect | POST (CREATE) | DELETE |
|--------|---------------|--------|
| **Validation** | Input validation (title/content) | Existence validation |
| **Event Criticality** | CRITICAL (Outbox Pattern) | NON-CRITICAL (Simple Publish) |
| **Response** | 201 Created + body | 204 No Content |
| **Idempotence** | Each call creates new | DELETE idempotent |
| **Side Effects** | Indexed in search | Cleanup, analytics |

---

## Testing Strategy

**Unit Tests**:
- Successful deletion returns void
- Document not found throws DocumentNotFoundError
- Event is created with correct properties

**Integration Tests**:
- DeleteDocumentController receives 204 response
- Document is actually deleted from database
- Event is published to EventBus

**Acceptance Tests (Gherkin)**:
- Successfully delete document returns 204
- Delete non-existent document returns 404
- Invalid ID format returns 400

---

## Error Handling

```typescript
if (!document) {
  throw new DocumentNotFoundError(id);  // → 404 response
}

if (invalidIdFormat(id)) {
  throw new InvalidDocumentIdError(id); // → 400 response
}

try {
  await eventBus.publish(events);
} catch (error) {
  // Log but don't fail - document is already deleted
  logger.warn('Failed to publish DocumentDeletedEvent', error);
}
```

---

## Non-Functional Requirements

- **Performance**: DELETE should complete in < 200ms
- **Consistency**: Immediate deletion from database
- **Availability**: Deletion should not block on event publishing
- **Observability**: Log all deletions for audit trail

---

## Summary

✅ **Operation Type**: COMMAND (DELETE)
✅ **Validation**: Synchronous (document exists check)
✅ **Data Source**: Same bounded context
✅ **Events**: Non-critical (simple publish)
✅ **Pattern**: No Outbox Pattern needed
✅ **Response**: 204 No Content (no body)
✅ **Error Handling**: 404 for missing, 400 for invalid ID
