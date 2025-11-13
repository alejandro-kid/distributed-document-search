export class IndexDocumentResponse {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;

  constructor(id: string, title: string, content: string, createdAt: Date) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
  }
}
