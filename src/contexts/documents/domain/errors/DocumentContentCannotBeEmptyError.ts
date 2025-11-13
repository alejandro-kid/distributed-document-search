export class DocumentContentCannotBeEmptyError extends Error {
  constructor() {
    super('Document content cannot be empty');
    this.name = 'DocumentContentCannotBeEmptyError';
  }
}
