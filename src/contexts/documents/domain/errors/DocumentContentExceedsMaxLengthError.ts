export class DocumentContentExceedsMaxLengthError extends Error {
  constructor(maxLength: number = 1048576) {
    super(`Document content cannot exceed ${maxLength} characters (${(maxLength / 1024 / 1024).toFixed(2)}MB)`);
    this.name = 'DocumentContentExceedsMaxLengthError';
  }
}
