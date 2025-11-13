export class SearchDocumentsQuery {
  readonly query: string;

  constructor(query: string) {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    this.query = query.trim();
  }
}
