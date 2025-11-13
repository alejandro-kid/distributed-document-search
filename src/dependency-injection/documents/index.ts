import { ContainerBuilder, Reference } from 'node-dependency-injection';
import { PostgresDocumentRepository } from '@/contexts/documents/infrastructure/persistence/PostgresDocumentRepository';
import { IndexDocumentUseCase } from '@/contexts/documents/application/index-document/IndexDocumentUseCase';
import { IndexDocumentController } from '@/controllers/IndexDocumentController';
import { DocumentSearcher } from '@/contexts/documents/application/search-documents/DocumentSearcher';
import { SearchDocumentsController } from '@/controllers/SearchDocumentsController';
import { FindDocumentByIdUseCase } from '@/contexts/documents/application/find-document/FindDocumentByIdUseCase';
import { GetDocumentController } from '@/controllers/GetDocumentController';

export const register = (container: ContainerBuilder) => {
  // Repository
  container
    .register('Documents.repositories.DocumentRepository', PostgresDocumentRepository)
    .addArgument(new Reference('Shared.infrastructure.PostgresConnectionManager'));

  // Use Cases
  container
    .register('Documents.use_cases.IndexDocument', IndexDocumentUseCase)
    .addArgument(new Reference('Documents.repositories.DocumentRepository'));

  container
    .register('Documents.use_cases.SearchDocuments', DocumentSearcher)
    .addArgument(new Reference('Documents.repositories.DocumentRepository'));

  container
    .register('Documents.use_cases.FindDocumentById', FindDocumentByIdUseCase)
    .addArgument(new Reference('Documents.repositories.DocumentRepository'));

  // Controllers
  container
    .register('Controllers.IndexDocumentController', IndexDocumentController)
    .addArgument(new Reference('Documents.use_cases.IndexDocument'));

  container
    .register('Controllers.SearchDocumentsController', SearchDocumentsController)
    .addArgument(new Reference('Documents.use_cases.SearchDocuments'));

  container
    .register('Controllers.GetDocumentController', GetDocumentController)
    .addArgument(new Reference('Documents.use_cases.FindDocumentById'));
};
