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
            CONSTRAINT document_content_not_empty CHECK (content != '')
        );
      `);

      // SQL para crear índices en documents
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
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
