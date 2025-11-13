import { Request, Response } from 'express';
import {
  DeleteDocumentUseCase,
  DeleteDocumentRequest,
} from '../contexts/documents/application/delete-document/DeleteDocumentUseCase';
import { DocumentNotFoundError } from '../contexts/documents/domain/errors/DocumentNotFoundError';

export class DeleteDocumentController {
  constructor(private deleteDocumentUseCase: DeleteDocumentUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate document ID format (must be valid UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!id || typeof id !== 'string' || id.trim() === '' || !uuidRegex.test(id)) {
        res.status(400).json({
          error: 'Invalid document ID format',
          documentId: id,
        });
        return;
      }

      // Execute use case
      const request = new DeleteDocumentRequest(id);
      await this.deleteDocumentUseCase.run(request);

      // Return 204 No Content - document deleted successfully
      res.status(204).send();
    } catch (error) {
      if (error instanceof DocumentNotFoundError) {
        res.status(404).json({
          error: 'Document not found',
          documentId: req.params.id,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
        });
      }
    }
  }
}
