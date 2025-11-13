import { Document } from '../../domain/Document';

export class SearchDocumentsResponse {
  readonly documents: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
  }>;

  constructor(documents: Document[]) {
    this.documents = documents.map((doc) => ({
      id: doc.id.value,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
    }));
  }

  static fromDomainDocuments(documents: Document[]): SearchDocumentsResponse {
    return new SearchDocumentsResponse(documents);
  }
}
