import { DomainEvent } from '@/contexts/shared/domain/DomainEvent';
import { randomUUID } from 'crypto';

export class DocumentIndexedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'document.indexed';

  constructor(
    public readonly documentId: string,
    public readonly title: string,
    public readonly author: string,
    public readonly content: string,
    public readonly indexedAt: Date,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(DocumentIndexedEvent.EVENT_NAME, documentId, eventId || randomUUID(), occurredOn);
  }

  toPrimitives(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn.toISOString(),
      documentId: this.documentId,
      title: this.title,
      author: this.author,
      content: this.content,
      indexedAt: this.indexedAt.toISOString(),
    };
  }

  static fromPrimitives(data: Record<string, unknown>): DocumentIndexedEvent {
    return new DocumentIndexedEvent(
      data.documentId as string,
      data.title as string,
      data.author as string,
      data.content as string,
      new Date(data.indexedAt as string),
      data.eventId as string,
      new Date(data.occurredOn as string),
    );
  }
}
