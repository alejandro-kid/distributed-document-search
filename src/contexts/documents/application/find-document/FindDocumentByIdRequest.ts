export class FindDocumentByIdRequest {
  readonly documentId: string;

  constructor(documentId: string) {
    if (!documentId || documentId.trim().length === 0) {
      throw new Error('Document ID cannot be empty');
    }

    this.documentId = documentId.trim();
  }
}
