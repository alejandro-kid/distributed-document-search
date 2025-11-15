import { Document } from '../../domain/Document';

type DocumentWithRelevance = Document & { relevance?: number };

export class SearchDocumentsResponse {
  readonly data: Array<{
    id: string;
    title: string;
    author: string;
    content: string;
    createdAt: Date;
    relevance?: number;
  }>;
  readonly meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };

  constructor(documents: DocumentWithRelevance[], total: number, page: number, limit: number) {
    this.data = documents.map((doc) => ({
      id: doc.id.value,
      title: doc.title,
      author: doc.author,
      content: doc.content,
      createdAt: doc.createdAt,
      relevance: doc.relevance,
    }));
    this.meta = {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static fromDomainDocuments(
    documents: DocumentWithRelevance[],
    total: number,
    page: number,
    limit: number,
  ): SearchDocumentsResponse {
    return new SearchDocumentsResponse(documents, total, page, limit);
  }
}
