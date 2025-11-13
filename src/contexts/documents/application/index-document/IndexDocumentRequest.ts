export class IndexDocumentRequest {
  readonly title: string;
  readonly content: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}
