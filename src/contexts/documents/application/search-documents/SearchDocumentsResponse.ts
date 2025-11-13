import { Document } from '../../domain/Document';

export class SearchDocumentsResponse {
  readonly data: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
  }>;
  readonly meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };

  constructor(documents: Document[], total: number, page: number, limit: number) {
    this.data = documents.map((doc) => ({
      id: doc.id.value,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
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
    documents: Document[],
    total: number,
    page: number,
    limit: number,
  ): SearchDocumentsResponse {
    return new SearchDocumentsResponse(documents, total, page, limit);
  }
}
