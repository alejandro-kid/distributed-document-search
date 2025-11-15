import { Response, Request } from 'express';
import { Controller } from './Controller';
import { IndexDocumentUseCase } from '@/contexts/documents/application/index-document/IndexDocumentUseCase';
import { IndexDocumentRequest } from '@/contexts/documents/application/index-document/IndexDocumentRequest';
import { DocumentContentCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentContentCannotBeEmptyError';
import { DocumentTitleCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentTitleCannotBeEmptyError';
import { DocumentTitleExceedsMaxLengthError } from '@/contexts/documents/domain/errors/DocumentTitleExceedsMaxLengthError';
import { DocumentContentExceedsMaxLengthError } from '@/contexts/documents/domain/errors/DocumentContentExceedsMaxLengthError';
import httpStatus from 'http-status';
import { DocumentAuthorCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentAuthorCannotBeEmptyError';

export class IndexDocumentController implements Controller {
  constructor(private readonly useCase: IndexDocumentUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { title, author, content } = req.body;

      // Validate request - verificar que no sean undefined, null o solo espacios
      if (
        !title ||
        title.trim().length === 0 ||
        !author ||
        author.trim().length === 0 ||
        !content ||
        content.trim().length === 0
      ) {
        res.status(httpStatus.BAD_REQUEST).json({
          error: 'Title, author and content are required',
        });
        return;
      }

      // Create request object
      const request = new IndexDocumentRequest(title, author, content);

      // Execute use case
      const response = await this.useCase.run(request);

      // Return response
      res.status(httpStatus.CREATED).json({
        id: response.id,
        title: response.title,
        author: response.author,
        content: response.content,
        createdAt: response.createdAt,
      });
    } catch (error) {
      // Domain validation errors
      if (
        error instanceof DocumentContentCannotBeEmptyError ||
        error instanceof DocumentTitleCannotBeEmptyError ||
        error instanceof DocumentTitleExceedsMaxLengthError ||
        error instanceof DocumentContentExceedsMaxLengthError ||
        error instanceof DocumentAuthorCannotBeEmptyError
      ) {
        res.status(httpStatus.BAD_REQUEST).json({
          error: error.message,
        });
      } else if (error instanceof Error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: error.message,
        });
      } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Internal server error',
        });
      }
    }
  }
}
