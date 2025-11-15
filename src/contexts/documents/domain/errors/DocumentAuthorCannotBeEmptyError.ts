export class DocumentAuthorCannotBeEmptyError extends Error {
  constructor() {
    super('Author cannot be empty');
    this.name = 'DocumentAuthorCannotBeEmptyError';
  }
}
