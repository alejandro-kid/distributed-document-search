import { Request, Response } from 'express';
import { DocumentSearcher } from '@/contexts/documents/application/search-documents/DocumentSearcher';
import { SearchDocumentsRequest } from '@/contexts/documents/application/search-documents/SearchDocumentsRequest';

export class SearchDocumentsController {
  constructor(private documentSearcher: DocumentSearcher) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          error: 'Search query is required',
          message: 'Please provide a search query using the "q" parameter',
        });
        return;
      }

      if (page < 1 || limit < 1) {
        res.status(400).json({
          error: 'Invalid pagination parameters',
          message: 'Page and limit must be positive integers',
        });
        return;
      }

      const request = new SearchDocumentsRequest(query, page, limit);
      const response = await this.documentSearcher.run(request);

      if (response.data.length === 0 && response.meta.pagination.total === 0) {
        res.status(200).json({
          data: [],
          meta: response.meta,
          message: 'No documents found',
        });
        return;
      }

      res.status(200).json({
        data: response.data,
        meta: response.meta,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({
        error: message,
      });
    }
  }
}
