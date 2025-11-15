export class IndexDocumentRequest {
  readonly title: string;
  readonly author: string;
  readonly content: string;

  constructor(title: string, author: string, content: string) {
    this.title = title;
    this.author = author;
    this.content = content;
  }
}
