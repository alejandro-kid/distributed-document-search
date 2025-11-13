import { Request, Response } from 'express';
import { DocumentSearcher } from '@/contexts/documents/application/search-documents/DocumentSearcher';
import { SearchDocumentsRequest } from '@/contexts/documents/application/search-documents/SearchDocumentsRequest';

export class SearchDocumentsController {
  constructor(private documentSearcher: DocumentSearcher) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          error: 'Search query is required',
          message: 'Please provide a search query using the "q" parameter',
        });
        return;
      }

      const request = new SearchDocumentsRequest(query);
      const response = await this.documentSearcher.run(request);

      if (response.documents.length === 0) {
        res.status(200).json({
          data: [],
          message: 'No documents found',
          count: 0,
        });
        return;
      }

      res.status(200).json({
        data: response.documents,
        count: response.documents.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({
        error: message,
      });
    }
  }
}
