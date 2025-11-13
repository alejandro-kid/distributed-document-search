import assert from 'assert';
import {
  DeleteDocumentUseCase,
  DeleteDocumentRequest,
} from '@/contexts/documents/application/delete-document/DeleteDocumentUseCase';
import { DocumentRepository } from '@/contexts/documents/domain/DocumentRepository';
import { DocumentNotFoundError } from '@/contexts/documents/domain/errors/DocumentNotFoundError';
import { DocumentMother } from '../../domain/DocumentMother';

describe('DeleteDocumentUseCase', () => {
  let useCase: DeleteDocumentUseCase;
  let mockRepository: DocumentRepository;

  beforeEach(() => {
    // Create a simple mock repository
    mockRepository = {
      save: async () => {},
      findById: async () => null,
      delete: async () => {},
      search: async () => [],
    };
  });

  describe('run', () => {
    it('should successfully delete a document', async () => {
      const document = DocumentMother.create();
      useCase = new DeleteDocumentUseCase(mockRepository);

      let findByIdCalled = false;
      let deleteCalled = false;

      mockRepository.findById = async (id) => {
        findByIdCalled = true;
        return document.id.value === id.value ? document : null;
      };

      mockRepository.delete = async () => {
        deleteCalled = true;
      };

      const request = new DeleteDocumentRequest(document.id.value);
      await useCase.run(request);

      assert.strictEqual(findByIdCalled, true);
      assert.strictEqual(deleteCalled, true);
    });

    it('should throw DocumentNotFoundError when document does not exist', async () => {
      useCase = new DeleteDocumentUseCase(mockRepository);

      mockRepository.findById = async () => null;

      const request = new DeleteDocumentRequest('non-existent-id');

      try {
        await useCase.run(request);
        throw new Error('Should have thrown DocumentNotFoundError');
      } catch (error) {
        assert(error instanceof DocumentNotFoundError);
      }
    });

    it('should not call delete if document not found', async () => {
      useCase = new DeleteDocumentUseCase(mockRepository);

      mockRepository.findById = async () => null;

      let deleteCalled = false;
      mockRepository.delete = async () => {
        deleteCalled = true;
      };

      const request = new DeleteDocumentRequest('non-existent-id');

      try {
        await useCase.run(request);
      } catch {
        // Expected error
      }

      assert.strictEqual(deleteCalled, false);
    });
  });
});
