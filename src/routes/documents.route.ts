import { IndexDocumentController } from '@/controllers/IndexDocumentController';
import { SearchDocumentsController } from '@/controllers/SearchDocumentsController';
import { GetDocumentController } from '@/controllers/GetDocumentController';
import { Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

export const register = (router: Router, container: ContainerBuilder): void => {
  const indexDocumentController: IndexDocumentController = container.get('Controllers.IndexDocumentController');
  const searchDocumentsController: SearchDocumentsController = container.get('Controllers.SearchDocumentsController');
  const getDocumentController: GetDocumentController = container.get('Controllers.GetDocumentController');

  router.post('/documents', (req, res) => {
    return indexDocumentController.run(req, res);
  });

  router.get('/documents/:id', (req, res) => {
    return getDocumentController.run(req, res);
  });

  router.get('/search', (req, res) => {
    return searchDocumentsController.run(req, res);
  });
};
