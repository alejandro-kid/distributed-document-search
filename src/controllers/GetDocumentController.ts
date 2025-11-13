import { Response, Request } from 'express';
import httpStatus from 'http-status';
import { Controller } from './Controller';
import { FindDocumentByIdUseCase } from '@/contexts/documents/application/find-document/FindDocumentByIdUseCase';
import { FindDocumentByIdRequest } from '@/contexts/documents/application/find-document/FindDocumentByIdRequest';
import { DocumentNotFoundError } from '@/contexts/documents/domain/errors/DocumentNotFoundError';

export class GetDocumentController implements Controller {
  constructor(private readonly useCase: FindDocumentByIdUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Input validation: ID cannot be empty
      if (!id || id.trim().length === 0) {
        res.status(httpStatus.BAD_REQUEST).json({
          error: 'Invalid document ID format',
        });
        return;
      }

      // Validate UUID format using regex (avoids ESM module issue with uuid package)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(httpStatus.BAD_REQUEST).json({
          error: 'Invalid document ID format',
        });
        return;
      }

      // Create request object
      let request: FindDocumentByIdRequest;
      try {
        request = new FindDocumentByIdRequest(id);
      } catch {
        res.status(httpStatus.BAD_REQUEST).json({
          error: 'Invalid document ID format',
        });
        return;
      }

      // Execute use case
      const response = await this.useCase.run(request);

      // Return response
      res.status(httpStatus.OK).json(response.toPrimitives());
    } catch (error) {
      // Document not found
      if (error instanceof DocumentNotFoundError) {
        res.status(httpStatus.NOT_FOUND).json({
          error: 'Document not found',
        });
      } else if (error instanceof Error) {
        // Log the error for debugging
        console.error('[GetDocumentController] Unexpected error:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: error.message || 'Internal server error',
        });
      } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Internal server error',
        });
      }
    }
  }
}
