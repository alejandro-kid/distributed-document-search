import { FindDocumentByIdUseCase } from '@/contexts/documents/application/find-document/FindDocumentByIdUseCase';
import { FindDocumentByIdRequest } from '@/contexts/documents/application/find-document/FindDocumentByIdRequest';
import { DocumentNotFoundError } from '@/contexts/documents/domain/errors/DocumentNotFoundError';
import { DocumentRepository } from '@/contexts/documents/domain/DocumentRepository';
import { DocumentMother } from '../../domain/DocumentMother';

describe('FindDocumentByIdUseCase', () => {
  let useCase: FindDocumentByIdUseCase;
  let repositoryMock: jest.Mocked<DocumentRepository>;

  beforeEach(() => {
    repositoryMock = {
      save: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new FindDocumentByIdUseCase(repositoryMock);
  });

  describe('when document exists', () => {
    it('should return DocumentResponse when document is found', async () => {
      const document = DocumentMother.create({ id: 'doc-001' });
      const request = new FindDocumentByIdRequest('doc-001');

      repositoryMock.findById.mockResolvedValue(document);

      const response = await useCase.run(request);

      expect(response.id).toBe('doc-001');
      expect(response.title).toBe(document.title);
      expect(response.content).toBe(document.content);
      expect(response.createdAt).toBeInstanceOf(Date);
      expect(repositoryMock.findById).toHaveBeenCalledTimes(1);
    });

    it('should transform document aggregate to response DTO', async () => {
      const document = DocumentMother.create({
        id: 'doc-123',
        title: 'Test Document',
        content: 'Test content',
      });
      const request = new FindDocumentByIdRequest('doc-123');

      repositoryMock.findById.mockResolvedValue(document);

      const response = await useCase.run(request);

      const primitives = response.toPrimitives();
      expect(primitives.id).toBe('doc-123');
      expect(primitives.title).toBe('Test Document');
      expect(primitives.content).toBe('Test content');
    });

    it('should pass DocumentId with correct value to repository', async () => {
      const document = DocumentMother.create();
      const request = new FindDocumentByIdRequest('doc-999');

      repositoryMock.findById.mockResolvedValue(document);

      await useCase.run(request);

      const callArg = repositoryMock.findById.mock.calls[0][0];
      expect(callArg.value).toBe('doc-999');
    });
  });

  describe('when document does not exist', () => {
    it('should throw DocumentNotFoundError when document is not found', async () => {
      const request = new FindDocumentByIdRequest('doc-not-found');
      repositoryMock.findById.mockResolvedValue(null);

      await expect(useCase.run(request)).rejects.toThrow(DocumentNotFoundError);
      await expect(useCase.run(request)).rejects.toThrow('doc-not-found');
    });

    it('should include document ID in error message', async () => {
      const request = new FindDocumentByIdRequest('missing-doc-123');
      repositoryMock.findById.mockResolvedValue(null);

      await expect(useCase.run(request)).rejects.toThrow('Document with ID missing-doc-123 not found');
    });
  });

  describe('request validation', () => {
    it('should throw error when document ID is empty', () => {
      expect(() => new FindDocumentByIdRequest('')).toThrow();
    });

    it('should throw error when document ID is only whitespace', () => {
      expect(() => new FindDocumentByIdRequest('   ')).toThrow();
    });

    it('should trim document ID before storing', () => {
      const request = new FindDocumentByIdRequest('  doc-001  ');
      expect(request.documentId).toBe('doc-001');
    });
  });
});
