import { DomainEvent } from '../../../shared/domain/DomainEvent';
import { v4 as uuid } from 'uuid';

export class DocumentDeletedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'document.deleted';

  constructor(
    public readonly documentId: string,
    public readonly deletedAt: Date,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(DocumentDeletedEvent.EVENT_NAME, documentId, eventId, occurredOn);
  }

  toPrimitives(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      eventName: this.eventName,
      occurredOn: this.occurredOn.toISOString(),
      documentId: this.documentId,
      deletedAt: this.deletedAt.toISOString(),
    };
  }

  static fromPrimitives(data: Record<string, unknown>): DocumentDeletedEvent {
    return new DocumentDeletedEvent(
      data.documentId as string,
      new Date(data.deletedAt as string),
      data.eventId as string,
      new Date(data.occurredOn as string),
    );
  }

  static create(documentId: string): DocumentDeletedEvent {
    return new DocumentDeletedEvent(documentId, new Date(), uuid(), new Date());
  }
}
