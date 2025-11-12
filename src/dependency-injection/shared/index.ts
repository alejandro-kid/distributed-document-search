import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from '@/config';
import { JwtService } from '@/contexts/shared/infrastructure/auth/JwtService';
import { PostgresConnectionManager } from '@/contexts/shared/infrastructure/persistence/PostgresConnectionManager';
import { ContainerBuilder, Definition } from 'node-dependency-injection';

export const register = (container: ContainerBuilder) => {
  // Register the PostgreSQL Connection Pool
  const definition = new Definition();
  definition.setFactory(PostgresConnectionManager, 'getPool');
  container.setDefinition('Shared.infrastructure.PostgresConnectionManager', definition);

  // Register JwtService
  container
    .register('Shared.infrastructure.auth.JwtService', JwtService)
    .addArgument(JWT_SECRET)
    .addArgument(JWT_ISSUER)
    .addArgument(JWT_AUDIENCE);
};
