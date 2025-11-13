import { DocumentRepository } from '../../domain/DocumentRepository';
import { SearchDocumentsRequest } from './SearchDocumentsRequest';
import { SearchDocumentsResponse } from './SearchDocumentsResponse';

export class DocumentSearcher {
  constructor(private readonly repository: DocumentRepository) {}

  async run(request: SearchDocumentsRequest): Promise<SearchDocumentsResponse> {
    const { documents, total } = await this.repository.search(request.query, request.page, request.limit);
    return SearchDocumentsResponse.fromDomainDocuments(documents, total, request.page, request.limit);
  }
}
