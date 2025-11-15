import { Document } from '@/contexts/documents/domain/Document';

export class DocumentResponse {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly content: string;
  readonly createdAt: Date;

  constructor(id: string, title: string, author: string, content: string, createdAt: Date) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.content = content;
    this.createdAt = createdAt;
  }

  static fromDomain(document: Document): DocumentResponse {
    return new DocumentResponse(
      document.id.value,
      document.title,
      document.author,
      document.content,
      document.createdAt,
    );
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      content: this.content,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
