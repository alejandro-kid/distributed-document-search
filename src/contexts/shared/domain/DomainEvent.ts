export abstract class DomainEvent {
  static EVENT_NAME: string;
  static fromPrimitives: (args: Record<string, unknown>) => DomainEvent;

  readonly aggregateId: string;
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;

  constructor(eventName: string, aggregateId: string, eventId?: string, occurredOn?: Date) {
    this.eventName = eventName;
    this.aggregateId = aggregateId;
    this.eventId = eventId || 'c2c5b8a0-5b8a-4b0a-8b0a-5b8a4b0a8b0a';
    this.occurredOn = occurredOn || new Date();
  }

  abstract toPrimitives(): Record<string, unknown>;
}
