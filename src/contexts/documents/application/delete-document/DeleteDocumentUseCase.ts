import { DocumentId } from '../../domain/DocumentId';
import { DocumentRepository } from '../../domain/DocumentRepository';
import { DocumentNotFoundError } from '../../domain/errors/DocumentNotFoundError';

export class DeleteDocumentUseCase {
  constructor(private repository: DocumentRepository) {}

  async run(request: DeleteDocumentRequest): Promise<void> {
    const documentId = new DocumentId(request.documentId);

    // STEP 1: SYNCHRONOUS VALIDATION - Check if document exists
    const document = await this.repository.findById(documentId);

    if (!document) {
      throw new DocumentNotFoundError(documentId.value);
    }

    // STEP 2: DELETE FROM DATABASE
    await this.repository.delete(documentId);
  }
}

export class DeleteDocumentRequest {
  readonly documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
  }
}
