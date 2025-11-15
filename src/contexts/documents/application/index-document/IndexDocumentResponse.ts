export class IndexDocumentResponse {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly content: string;
  readonly createdAt: Date;

  constructor(id: string, title: string, author: string, content: string, createdAt: Date) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.content = content;
    this.createdAt = createdAt;
  }
}
