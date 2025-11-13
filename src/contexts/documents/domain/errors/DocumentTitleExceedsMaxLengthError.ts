export class DocumentTitleExceedsMaxLengthError extends Error {
  constructor(maxLength: number = 255) {
    super(`Document title cannot exceed ${maxLength} characters`);
    this.name = 'DocumentTitleExceedsMaxLengthError';
  }
}
