import { AggregateRoot } from '@/contexts/shared/domain/AggregateRoot';
import { DocumentId } from './DocumentId';
import { DocumentIndexedEvent } from './events/DocumentIndexedEvent';
import { DocumentContentCannotBeEmptyError } from './errors/DocumentContentCannotBeEmptyError';
import { DocumentTitleCannotBeEmptyError } from './errors/DocumentTitleCannotBeEmptyError';
import { DocumentTitleExceedsMaxLengthError } from './errors/DocumentTitleExceedsMaxLengthError';
import { DocumentContentExceedsMaxLengthError } from './errors/DocumentContentExceedsMaxLengthError';
import { DocumentAuthorCannotBeEmptyError } from './errors/DocumentAuthorCannotBeEmptyError';

export class Document extends AggregateRoot {
  readonly id: DocumentId;
  readonly title: string;
  readonly author: string;
  readonly content: string;
  readonly createdAt: Date;

  constructor(id: DocumentId, title: string, author: string, content: string, createdAt: Date) {
    super();
    this.id = id;
    this.title = title;
    this.author = author;
    this.content = content;
    this.createdAt = createdAt;
  }

  static create(props: { title: string; author: string; content: string }): Document {
    // Invariant: Title cannot be empty or only whitespace
    if (!props.title || props.title.trim().length === 0) {
      throw new DocumentTitleCannotBeEmptyError();
    }

    // Invariant: Title cannot exceed max length (255 characters)
    if (props.title.length > 255) {
      throw new DocumentTitleExceedsMaxLengthError(255);
    }

    // Invariant: Author cannot be empty or only whitespace
    if (!props.author || props.author.trim().length === 0) {
      throw new DocumentAuthorCannotBeEmptyError();
    }

    // Invariant: Content cannot be empty or only whitespace
    if (!props.content || props.content.trim().length === 0) {
      throw new DocumentContentCannotBeEmptyError();
    }

    // Invariant: Content cannot exceed max length (1MB)
    const maxContentLength = 1048576; // 1MB
    if (props.content.length > maxContentLength) {
      throw new DocumentContentExceedsMaxLengthError(maxContentLength);
    }

    const document = new Document(DocumentId.generate(), props.title, props.author, props.content, new Date());

    // Emit domain event
    document.record(
      new DocumentIndexedEvent(
        document.id.value,
        document.title,
        document.author,
        document.content,
        document.createdAt,
      ),
    );

    return document;
  }

  static fromPrimitives(plainData: {
    id: string;
    title: string;
    author: string;
    content: string;
    createdAt: Date;
  }): Document {
    return new Document(
      new DocumentId(plainData.id),
      plainData.title,
      plainData.author,
      plainData.content,
      plainData.createdAt,
    );
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: this.id.value,
      title: this.title,
      author: this.author,
      content: this.content,
      createdAt: this.createdAt,
    };
  }
}
