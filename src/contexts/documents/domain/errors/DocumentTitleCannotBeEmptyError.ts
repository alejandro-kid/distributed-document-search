export class DocumentTitleCannotBeEmptyError extends Error {
  constructor() {
    super('Title cannot be empty');
    this.name = 'DocumentTitleCannotBeEmptyError';
  }
}
