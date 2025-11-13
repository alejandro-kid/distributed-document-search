import { DocumentRepository } from '@/contexts/documents/domain/DocumentRepository';
import { DocumentId } from '@/contexts/documents/domain/DocumentId';
import { DocumentNotFoundError } from '@/contexts/documents/domain/errors/DocumentNotFoundError';
import { FindDocumentByIdRequest } from './FindDocumentByIdRequest';
import { DocumentResponse } from './DocumentResponse';

export class FindDocumentByIdUseCase {
  constructor(private readonly repository: DocumentRepository) {}

  async run(request: FindDocumentByIdRequest): Promise<DocumentResponse> {
    // Query repository for document
    const document = await this.repository.findById(new DocumentId(request.documentId));

    // If not found, throw error (controller will handle and return 404)
    if (!document) {
      throw new DocumentNotFoundError(request.documentId);
    }

    // Map to response DTO
    return DocumentResponse.fromDomain(document);
  }
}
