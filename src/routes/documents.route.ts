import { IndexDocumentController } from '@/controllers/IndexDocumentController';
import { SearchDocumentsController } from '@/controllers/SearchDocumentsController';
import { Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

export const register = (router: Router, container: ContainerBuilder): void => {
  const indexDocumentController: IndexDocumentController = container.get('Controllers.IndexDocumentController');
  const searchDocumentsController: SearchDocumentsController = container.get('Controllers.SearchDocumentsController');

  router.post('/documents', (req, res) => {
    return indexDocumentController.run(req, res);
  });

  router.get('/search', (req, res) => {
    return searchDocumentsController.run(req, res);
  });
};
