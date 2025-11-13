import { Document } from '@/contexts/documents/domain/Document';
import { DocumentContentCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentContentCannotBeEmptyError';
import { DocumentTitleCannotBeEmptyError } from '@/contexts/documents/domain/errors/DocumentTitleCannotBeEmptyError';
import { DocumentTitleExceedsMaxLengthError } from '@/contexts/documents/domain/errors/DocumentTitleExceedsMaxLengthError';
import { DocumentContentExceedsMaxLengthError } from '@/contexts/documents/domain/errors/DocumentContentExceedsMaxLengthError';
import { DocumentIndexedEvent } from '@/contexts/documents/domain/events/DocumentIndexedEvent';
import { DocumentMother } from './DocumentMother';

describe('Document', () => {
  it('should create a document with valid data', () => {
    const document = Document.create({
      title: 'My Document',
      content: 'Some content',
    });

    expect(document.title).toBe('My Document');
    expect(document.content).toBe('Some content');
    expect(document.id).toBeDefined();
    expect(document.createdAt).toBeDefined();
  });

  it('should emit DocumentIndexedEvent on creation', () => {
    const document = Document.create({
      title: 'My Document',
      content: 'Some content',
    });

    const events = document.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(DocumentIndexedEvent);
  });

  it('should throw error when content is empty', () => {
    expect(() =>
      Document.create({
        title: 'My Document',
        content: '',
      }),
    ).toThrow(DocumentContentCannotBeEmptyError);
  });

  it('should throw error when content is only whitespace', () => {
    expect(() =>
      Document.create({
        title: 'My Document',
        content: '   ',
      }),
    ).toThrow(DocumentContentCannotBeEmptyError);
  });

  it('should convert to primitives correctly', () => {
    const document = DocumentMother.create({ title: 'Test', content: 'Content' });

    const primitives = document.toPrimitives();

    expect(primitives.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(primitives.title).toBe('Test');
    expect(primitives.content).toBe('Content');
    expect(primitives.createdAt).toBeDefined();
  });

  it('should reconstruct from primitives correctly', () => {
    const data = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Reconstructed',
      content: 'Reconstructed content',
      createdAt: new Date(),
    };

    const document = Document.fromPrimitives(data);

    expect(document.id.value).toBe(data.id);
    expect(document.title).toBe(data.title);
    expect(document.content).toBe(data.content);
  });

  it('should throw error when title is empty', () => {
    expect(() =>
      Document.create({
        title: '',
        content: 'Valid content',
      }),
    ).toThrow(DocumentTitleCannotBeEmptyError);
  });

  it('should throw error when title is only whitespace', () => {
    expect(() =>
      Document.create({
        title: '   ',
        content: 'Valid content',
      }),
    ).toThrow(DocumentTitleCannotBeEmptyError);
  });

  it('should throw error when title exceeds max length (255 chars)', () => {
    const longTitle = 'a'.repeat(256);
    expect(() =>
      Document.create({
        title: longTitle,
        content: 'Valid content',
      }),
    ).toThrow(DocumentTitleExceedsMaxLengthError);
  });

  it('should allow title with exactly max length (255 chars)', () => {
    const maxTitle = 'a'.repeat(255);
    const document = Document.create({
      title: maxTitle,
      content: 'Valid content',
    });

    expect(document.title).toBe(maxTitle);
    expect(document.title.length).toBe(255);
  });

  it('should throw error when content exceeds max length (1MB)', () => {
    const largeContent = 'a'.repeat(1048577); // 1MB + 1 byte
    expect(() =>
      Document.create({
        title: 'Valid title',
        content: largeContent,
      }),
    ).toThrow(DocumentContentExceedsMaxLengthError);
  });

  it('should allow content with exactly max length (1MB)', () => {
    const maxContent = 'a'.repeat(1048576); // exactly 1MB
    const document = Document.create({
      title: 'Valid title',
      content: maxContent,
    });

    expect(document.content.length).toBe(1048576);
  });
});
