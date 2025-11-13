import httpStatus from 'http-status';
import { GetDocumentController } from '@/controllers/GetDocumentController';
import { FindDocumentByIdUseCase } from '@/contexts/documents/application/find-document/FindDocumentByIdUseCase';
import { DocumentNotFoundError } from '@/contexts/documents/domain/errors/DocumentNotFoundError';
import { DocumentResponse } from '@/contexts/documents/application/find-document/DocumentResponse';
import { DocumentMother } from '../domain/DocumentMother';
import { Request, Response } from 'express';

describe('GetDocumentController', () => {
  let controller: GetDocumentController;
  let useCaseMock: jest.Mocked<FindDocumentByIdUseCase>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    useCaseMock = {
      run: jest.fn(),
    } as unknown as jest.Mocked<FindDocumentByIdUseCase>;

    controller = new GetDocumentController(useCaseMock);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      params: {},
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('when document exists', () => {
    it('should return 200 with document data', async () => {
      const testId = '550e8400-e29b-41d4-a716-446655440000';
      const document = DocumentMother.create({ id: testId, title: 'Test Doc', content: 'Test' });
      const response = DocumentResponse.fromDomain(document);

      req.params = { id: testId };
      useCaseMock.run.mockResolvedValue(response);

      await controller.run(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(httpStatus.OK);
      expect(jsonMock).toHaveBeenCalledTimes(1);
      const data = jsonMock.mock.calls[0][0];
      expect(data.id).toBeDefined();
      expect(data.title).toBeDefined();
      expect(data.content).toBeDefined();
      expect(data.createdAt).toBeDefined();
    });

    it('should convert response to primitives for JSON serialization', async () => {
      const testId = '550e8400-e29b-41d4-a716-446655440001';
      const document = DocumentMother.create({
        id: testId,
        title: 'Test Doc',
        content: 'Test content',
      });
      const response = DocumentResponse.fromDomain(document);

      req.params = { id: testId };
      useCaseMock.run.mockResolvedValue(response);

      await controller.run(req as Request, res as Response);

      const data = jsonMock.mock.calls[0][0];
      expect(data.title).toBe('Test Doc');
      expect(data.content).toBe('Test content');
      expect(typeof data.createdAt).toBe('string'); // ISO string
    });
  });

  describe('when document does not exist', () => {
    it('should return 404 with error message', async () => {
      const testId = '550e8400-e29b-41d4-a716-446655440002';
      req.params = { id: testId };
      useCaseMock.run.mockRejectedValue(new DocumentNotFoundError(testId));

      await controller.run(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Document not found' });
    });
  });

  describe('input validation', () => {
    it('should return 400 when document ID is empty', async () => {
      req.params = { id: '' };

      await controller.run(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid document ID format' });
    });

    it('should return 400 when document ID is only whitespace', async () => {
      req.params = { id: '   ' };

      await controller.run(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid document ID format' });
    });

    it('should not call use case when ID is invalid', async () => {
      req.params = { id: '' };

      await controller.run(req as Request, res as Response);

      expect(useCaseMock.run).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 500 for unexpected errors', async () => {
      const testId = '550e8400-e29b-41d4-a716-446655440003';
      req.params = { id: testId };
      const error = new Error('Unexpected error');
      useCaseMock.run.mockRejectedValue(error);

      await controller.run(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unexpected error' });
    });

    it('should return 500 for non-Error objects', async () => {
      const testId = '550e8400-e29b-41d4-a716-446655440004';
      req.params = { id: testId };
      useCaseMock.run.mockRejectedValue('string error');

      await controller.run(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
