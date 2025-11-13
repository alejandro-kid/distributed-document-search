import { IndexDocumentController } from '@/controllers/IndexDocumentController';
import { Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

export const register = (router: Router, container: ContainerBuilder): void => {
  const indexDocumentController: IndexDocumentController = container.get('Controllers.IndexDocumentController');

  router.post('/documents', (req, res) => {
    return indexDocumentController.run(req, res);
  });
};
