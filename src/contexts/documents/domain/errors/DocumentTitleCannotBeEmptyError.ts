export class DocumentTitleCannotBeEmptyError extends Error {
  constructor() {
    super('Document title cannot be empty');
    this.name = 'DocumentTitleCannotBeEmptyError';
  }
}
