import { ContainerBuilder, Reference } from 'node-dependency-injection';
import { PostgresDocumentRepository } from '@/contexts/documents/infrastructure/persistence/PostgresDocumentRepository';
import { IndexDocumentUseCase } from '@/contexts/documents/application/index-document/IndexDocumentUseCase';
import { IndexDocumentController } from '@/controllers/IndexDocumentController';

export const register = (container: ContainerBuilder) => {
  // Repository
  container
    .register('Documents.repositories.DocumentRepository', PostgresDocumentRepository)
    .addArgument(new Reference('Shared.infrastructure.PostgresConnectionManager'));

  // Use Cases
  container
    .register('Documents.use_cases.IndexDocument', IndexDocumentUseCase)
    .addArgument(new Reference('Documents.repositories.DocumentRepository'));

  // Controllers
  container
    .register('Controllers.IndexDocumentController', IndexDocumentController)
    .addArgument(new Reference('Documents.use_cases.IndexDocument'));
};
