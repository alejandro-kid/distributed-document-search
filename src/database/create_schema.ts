import { PostgresConnectionManager } from '../contexts/shared/infrastructure/persistence/PostgresConnectionManager';

async function createSchema() {
  const pool = await PostgresConnectionManager.getPool();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // SQL para crear la tabla users
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // SQL para crear la tabla documents
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
            id UUID PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            tsvector_column TSVECTOR,
            CONSTRAINT document_content_not_empty CHECK (content != '')
        );
      `);

      // SQL para crear índices en documents
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
      `);

      // Crear índice GIN para la columna tsvector_column
      await client.query(`
        CREATE INDEX IF NOT EXISTS documents_tsvector_idx ON documents USING GIN (tsvector_column);
      `);

      // Crear función para actualizar tsvector_column
      // IMPORTANTE: Usar pesos diferentes para title (A) y content (D)
      // A = peso 1.0, B = 0.4, C = 0.2, D = 0.1
      await client.query(`
        CREATE OR REPLACE FUNCTION update_documents_tsvector() RETURNS TRIGGER AS $$
        BEGIN
          NEW.tsvector_column =
            setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'D');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Crear trigger para actualizar tsvector_column automáticamente
      await client.query(`
        DROP TRIGGER IF EXISTS trg_update_documents_tsvector ON documents;
        CREATE TRIGGER trg_update_documents_tsvector
        BEFORE INSERT OR UPDATE OF title, content ON documents
        FOR EACH ROW
        EXECUTE FUNCTION update_documents_tsvector();
      `);

      // SQL para crear la función y el trigger para updated_at
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
                CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            END IF;
        END
        $$;
      `);

      await client.query('COMMIT');
      console.log('Database schema created/updated successfully.');

      // Actualizar tsvector para documentos existentes
      console.log('Updating tsvector for existing documents...');
      await pool.query('UPDATE documents SET title = title WHERE tsvector_column IS NULL');
      console.log('Existing documents updated.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating database schema:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error connecting to the database pool:', error);
    throw error;
  } finally {
    await PostgresConnectionManager.closePool();
  }
}

createSchema().catch((error) => {
  console.error('Failed to run schema creation script:', error);
  process.exit(1);
});
