import { Document } from './Document';
import { DocumentId } from './DocumentId';

export interface DocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: DocumentId): Promise<Document | null>;
  delete(id: DocumentId): Promise<void>;
  search(query: string): Promise<Document[]>;
}
