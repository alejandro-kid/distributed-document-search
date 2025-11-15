export class SearchDocumentsRequest {
  readonly query: string;
  readonly page: number;
  readonly limit: number;
  readonly author?: string;

  constructor(query: string, page: number, limit: number, author?: string) {
    this.query = query;
    this.page = page;
    this.limit = limit;
    this.author = author;
  }
}
