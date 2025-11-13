import { Pool } from 'pg';
import { Document } from '../../domain/Document';
import { DocumentId } from '../../domain/DocumentId';
import { DocumentRepository } from '../../domain/DocumentRepository';

export class PostgresDocumentRepository implements DocumentRepository {
  constructor(private readonly pool: Pool) {}

  async save(document: Document): Promise<void> {
    const query = {
      text: `
        INSERT INTO documents (id, title, content, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          title = $2,
          content = $3
      `,
      values: [document.id.value, document.title, document.content, document.createdAt],
    };

    await this.pool.query(query);
  }

  async findById(id: DocumentId): Promise<Document | null> {
    const query = {
      text: 'SELECT id, title, content, created_at FROM documents WHERE id = $1',
      values: [id.value],
    };

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    const dbDocument = result.rows[0];
    return Document.fromPrimitives({
      id: dbDocument.id,
      title: dbDocument.title,
      content: dbDocument.content,
      createdAt: dbDocument.created_at,
    });
  }

  async delete(id: DocumentId): Promise<void> {
    const query = {
      text: 'DELETE FROM documents WHERE id = $1',
      values: [id.value],
    };

    await this.pool.query(query);
  }
}
