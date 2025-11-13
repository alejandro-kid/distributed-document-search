export class SearchDocumentsRequest {
  readonly query: string;

  constructor(query: string) {
    this.query = query;
  }
}
