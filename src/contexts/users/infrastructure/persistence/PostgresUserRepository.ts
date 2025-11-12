import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';
import { Pool } from 'pg';

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async save(user: User): Promise<void> {
    const query = {
      text: `
        INSERT INTO users (id, username, avatar_url, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url, updated_at = NOW();
      `,
      values: [user.id, user.username, user.avatarUrl],
    };
    await this.pool.query(query);
  }

  async findById(id: string): Promise<User | null> {
    const query = {
      text: 'SELECT id, username, avatar_url FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (result.rows.length === 0) {
      return null;
    }
    const dbUser = result.rows[0];
    return new User({
      id: dbUser.id,
      username: dbUser.username,
      avatarUrl: dbUser.avatar_url,
    });
  }
}
