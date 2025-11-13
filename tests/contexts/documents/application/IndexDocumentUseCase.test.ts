import { IndexDocumentUseCase } from '@/contexts/documents/application/index-document/IndexDocumentUseCase';
import { IndexDocumentRequest } from '@/contexts/documents/application/index-document/IndexDocumentRequest';
import { DocumentRepository } from '@/contexts/documents/domain/DocumentRepository';
import { Document } from '@/contexts/documents/domain/Document';
import { DocumentContentCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentContentCannotBeEmptyError';
import { DocumentTitleCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentTitleCannotBeEmptyError';
import { DocumentTitleExceedsMaxLengthError } from '@/contexts/documents/domain/errors/DocumentTitleExceedsMaxLengthError';
import { DocumentContentExceedsMaxLengthError } from '@/contexts/documents/domain/errors/DocumentContentExceedsMaxLengthError';

describe('IndexDocumentUseCase', () => {
  let useCase: IndexDocumentUseCase;
  let mockRepository: jest.Mocked<DocumentRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new IndexDocumentUseCase(mockRepository);
  });

  it('should index a document successfully', async () => {
    const request = new IndexDocumentRequest('My Document', 'Some content');

    const response = await useCase.run(request);

    expect(response.id).toBeDefined();
    expect(response.title).toBe('My Document');
    expect(response.content).toBe('Some content');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should call repository save with the created document', async () => {
    const request = new IndexDocumentRequest('My Document', 'Some content');

    await useCase.run(request);

    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Document));
  });

  it('should throw error when content is empty', async () => {
    const request = new IndexDocumentRequest('My Document', '');

    await expect(useCase.run(request)).rejects.toThrow(DocumentContentCannotBeEmptyError);
  });

  it('should throw error when content is only whitespace', async () => {
    const request = new IndexDocumentRequest('My Document', '   ');

    await expect(useCase.run(request)).rejects.toThrow(DocumentContentCannotBeEmptyError);
  });

  it('should return response with all document data', async () => {
    const request = new IndexDocumentRequest('Test Title', 'Test content');

    const response = await useCase.run(request);

    expect(response.title).toBe('Test Title');
    expect(response.content).toBe('Test content');
    expect(response.id).toBeDefined();
    expect(response.createdAt).toBeDefined();
  });

  it('should throw error when title is empty', async () => {
    const request = new IndexDocumentRequest('', 'Valid content');

    await expect(useCase.run(request)).rejects.toThrow(DocumentTitleCannotBeEmptyError);
  });

  it('should throw error when title is only whitespace', async () => {
    const request = new IndexDocumentRequest('   ', 'Valid content');

    await expect(useCase.run(request)).rejects.toThrow(DocumentTitleCannotBeEmptyError);
  });

  it('should throw error when title exceeds max length', async () => {
    const longTitle = 'a'.repeat(256);
    const request = new IndexDocumentRequest(longTitle, 'Valid content');

    await expect(useCase.run(request)).rejects.toThrow(DocumentTitleExceedsMaxLengthError);
  });

  it('should throw error when content exceeds max length', async () => {
    const largeContent = 'a'.repeat(1048577);
    const request = new IndexDocumentRequest('Valid title', largeContent);

    await expect(useCase.run(request)).rejects.toThrow(DocumentContentExceedsMaxLengthError);
  });

  it('should allow document with title at exact max length', async () => {
    const maxTitle = 'a'.repeat(255);
    const request = new IndexDocumentRequest(maxTitle, 'Valid content');

    const response = await useCase.run(request);

    expect(response.title.length).toBe(255);
  });

  it('should allow document with content at exact max length', async () => {
    const maxContent = 'a'.repeat(1048576);
    const request = new IndexDocumentRequest('Valid title', maxContent);

    const response = await useCase.run(request);

    expect(response.content.length).toBe(1048576);
  });
});
