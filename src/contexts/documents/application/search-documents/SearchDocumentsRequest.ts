export class SearchDocumentsRequest {
  readonly query: string;
  readonly page: number;
  readonly limit: number;

  constructor(query: string, page: number, limit: number) {
    this.query = query;
    this.page = page;
    this.limit = limit;
  }
}
