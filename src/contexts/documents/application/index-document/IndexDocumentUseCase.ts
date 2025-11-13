import { Document } from '../../domain/Document';
import { DocumentRepository } from '../../domain/DocumentRepository';
import { IndexDocumentRequest } from './IndexDocumentRequest';
import { IndexDocumentResponse } from './IndexDocumentResponse';

export class IndexDocumentUseCase {
  constructor(private readonly repository: DocumentRepository) {}

  async run(request: IndexDocumentRequest): Promise<IndexDocumentResponse> {
    // Create aggregate (validates invariants)
    const document = Document.create({
      title: request.title,
      content: request.content,
    });

    // Persist to database
    await this.repository.save(document);

    // Return response
    return new IndexDocumentResponse(document.id.value, document.title, document.content, document.createdAt);
  }
}
