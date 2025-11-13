import assert from 'assert';
import { Request, Response } from 'express';
import { DeleteDocumentController } from '@/controllers/DeleteDocumentController';
import { DeleteDocumentUseCase } from '@/contexts/documents/application/delete-document/DeleteDocumentUseCase';
import { DocumentNotFoundError } from '@/contexts/documents/domain/errors/DocumentNotFoundError';
import { DocumentMother } from '../domain/DocumentMother';

describe('DeleteDocumentController', () => {
  let controller: DeleteDocumentController;
  let mockUseCase: DeleteDocumentUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let responseData: any;
  let responseStatus: number;

  beforeEach(() => {
    mockUseCase = new DeleteDocumentUseCase({
      save: async () => {},
      findById: async () => null,
      delete: async () => {},
      search: async () => [],
    });

    controller = new DeleteDocumentController(mockUseCase);

    // Setup mock response
    responseData = null;
    responseStatus = 200;

    mockResponse = {
      status: (code: number) => {
        responseStatus = code;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return mockResponse as any;
      },
      send: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return mockResponse as any;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json: (data: any) => {
        responseData = data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return mockResponse as any;
      },
    };

    mockRequest = {
      params: {},
    };
  });

  describe('run', () => {
    it('should return 204 when document is successfully deleted', async () => {
      const document = DocumentMother.create();
      const documentId = document.id.value;

      mockRequest.params = { id: documentId };

      // Mock useCase to succeed
      mockUseCase.run = async () => {
        // Success
      };

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(responseStatus, 204);
    });

    it('should return 404 when document not found', async () => {
      const documentId = '550e8400-e29b-41d4-a716-446655440000';

      mockRequest.params = { id: documentId };

      // Mock useCase to throw DocumentNotFoundError
      mockUseCase.run = async () => {
        throw new DocumentNotFoundError(documentId);
      };

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(responseStatus, 404);
      assert.strictEqual(responseData.error, 'Document not found');
      assert.strictEqual(responseData.documentId, documentId);
    });

    it('should return 400 for invalid document ID format', async () => {
      mockRequest.params = { id: '' };

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(responseStatus, 400);
      assert.strictEqual(responseData.error, 'Invalid document ID format');
    });

    it('should return 400 for missing document ID', async () => {
      mockRequest.params = {};

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(responseStatus, 400);
      assert.strictEqual(responseData.error, 'Invalid document ID format');
    });

    it('should return 400 for whitespace-only document ID', async () => {
      mockRequest.params = { id: '   ' };

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(responseStatus, 400);
      assert.strictEqual(responseData.error, 'Invalid document ID format');
    });

    it('should return 500 for unexpected errors', async () => {
      const documentId = '550e8400-e29b-41d4-a716-446655440001';

      mockRequest.params = { id: documentId };

      // Mock useCase to throw unexpected error
      mockUseCase.run = async () => {
        throw new Error('Database connection error');
      };

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(responseStatus, 500);
      assert.strictEqual(responseData.error, 'Internal server error');
    });

    it('should pass document ID to use case correctly', async () => {
      const document = DocumentMother.create();
      const documentId = document.id.value;

      mockRequest.params = { id: documentId };

      let capturedId: string | null = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockUseCase.run = async (request: any) => {
        capturedId = request.documentId;
      };

      await controller.run(mockRequest as Request, mockResponse as Response);

      assert.strictEqual(capturedId, documentId);
    });
  });
});
