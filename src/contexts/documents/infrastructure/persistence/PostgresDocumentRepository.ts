import { Pool } from 'pg';
import { Document } from '../../domain/Document';
import { DocumentId } from '../../domain/DocumentId';
import { DocumentRepository } from '../../domain/DocumentRepository';

type DocumentWithRelevance = Document & { relevance: number };

export class PostgresDocumentRepository implements DocumentRepository {
  constructor(private readonly pool: Pool) {}

  async save(document: Document): Promise<void> {
    const query = {
      text: `
        INSERT INTO documents (id, title, content, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          created_at = EXCLUDED.created_at
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

  async search(
    query: string,
    page: number,
    limit: number,
  ): Promise<{ documents: DocumentWithRelevance[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = {
      text: `
        SELECT COUNT(*) FROM documents
        WHERE tsvector_column @@ plainto_tsquery('english', $1)
      `,
      values: [query],
    };

    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    // Usar ts_rank en lugar de ts_rank_cd y normalizarlo
    // ts_rank considera los pesos (A para title, B para content)
    // normalization 1 divide por (1 + logaritmo de la longitud del documento)
    const searchQuery = {
      text: `
        SELECT
          id,
          title,
          content,
          created_at,
          ts_rank(
            tsvector_column, 
            plainto_tsquery('english', $1),
            1  -- normalización: divide por 1 + log(longitud)
          ) as relevance
        FROM documents
        WHERE tsvector_column @@ plainto_tsquery('english', $1)
        ORDER BY relevance DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `,
      values: [query, limit, offset],
    };

    const result = await this.pool.query(searchQuery);

    const documents = result.rows.map((row) => {
      const doc = Document.fromPrimitives({
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
      });
      (doc as DocumentWithRelevance).relevance = parseFloat(row.relevance);
      return doc as DocumentWithRelevance;
    });

    return { documents, total };
  }
}
