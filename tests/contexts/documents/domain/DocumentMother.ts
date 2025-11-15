import { Document } from '@/contexts/documents/domain/Document';

export class DocumentMother {
  static create(
    props: {
      id?: string;
      title?: string;
      author?: string;
      content?: string;
    } = {},
  ): Document {
    return Document.fromPrimitives({
      id: props.id ?? '550e8400-e29b-41d4-a716-446655440000',
      title: props.title ?? 'Test Document',
      author: props.author ?? 'Test Author',
      content: props.content ?? 'Test content',
      createdAt: new Date(),
    });
  }

  static withContent(content: string): Document {
    return this.create({ content });
  }

  static withTitle(title: string): Document {
    return this.create({ title });
  }
}
