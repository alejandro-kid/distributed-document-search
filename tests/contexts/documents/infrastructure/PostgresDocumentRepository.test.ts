import { Pool, QueryResult } from 'pg';
import { PostgresDocumentRepository } from '@/contexts/documents/infrastructure/persistence/PostgresDocumentRepository';
import { DocumentId } from '@/contexts/documents/domain/DocumentId';
import { DocumentMother } from '../domain/DocumentMother';

describe('PostgresDocumentRepository', () => {
  let repository: PostgresDocumentRepository;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn() as jest.Mock<Promise<QueryResult<Record<string, unknown>>>, [string, unknown[]]>,
      connect: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    repository = new PostgresDocumentRepository(mockPool);
  });

  describe('save', () => {
    it('should save a document to the database', async () => {
      const document = DocumentMother.create();

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      } as QueryResult);

      await repository.save(document);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('INSERT INTO documents'),
          values: expect.arrayContaining([document.id.value, document.title, document.content, document.createdAt]),
        }),
      );
    });

    it('should handle upsert when document already exists', async () => {
      const document = DocumentMother.create();

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      } as QueryResult);

      await repository.save(document);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('ON CONFLICT'),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find a document by id', async () => {
      const document = DocumentMother.create();
      const documentId = document.id;

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: documentId.value,
            title: document.title,
            content: document.content,
            created_at: document.createdAt,
          },
        ],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult);

      const result = await repository.findById(documentId);

      expect(result).toBeDefined();
      expect(result?.title).toBe(document.title);
      expect(result?.content).toBe(document.content);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('SELECT'),
          values: expect.arrayContaining([documentId.value]),
        }),
      );
    });

    it('should return null when document is not found', async () => {
      const documentId = new DocumentId('non-existent-id');

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult);

      const result = await repository.findById(documentId);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a document by id', async () => {
      const documentId = new DocumentId('test-id');

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'DELETE',
        oid: 0,
        fields: [],
      } as QueryResult);

      await repository.delete(documentId);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('DELETE FROM documents WHERE id'),
          values: expect.arrayContaining([documentId.value]),
        }),
      );
    });

    it('should not fail when deleting non-existent document', async () => {
      const documentId = new DocumentId('non-existent-id');

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'DELETE',
        oid: 0,
        fields: [],
      } as QueryResult);

      await expect(repository.delete(documentId)).resolves.toBeUndefined();
    });
  });
});
