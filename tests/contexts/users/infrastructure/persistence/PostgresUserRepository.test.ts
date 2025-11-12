import { PostgresConnectionManager } from '@/contexts/shared/infrastructure/persistence/PostgresConnectionManager';
import { User } from '@/contexts/users/domain/User';
import { PostgresUserRepository } from '@/contexts/users/infrastructure/persistence/PostgresUserRepository';
import { Pool } from 'pg';

describe('PostgresUserRepository', () => {
  let pool: Pool;
  let userRepository: PostgresUserRepository;

  beforeAll(async () => {
    pool = await PostgresConnectionManager.getPool();
    userRepository = new PostgresUserRepository(pool);
  });

  afterAll(async () => {
    await PostgresConnectionManager.closePool();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM users');
  });

  describe('save', () => {
    it('should save a new user to the database', async () => {
      const user = User.create({
        id: 'user-1',
        username: 'testuser',
        avatarUrl: 'http://example.com/avatar.png',
      });

      await userRepository.save(user);

      const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe(user.id);
      expect(result.rows[0].username).toBe(user.username);
      expect(result.rows[0].avatar_url).toBe(user.avatarUrl);
    });

    it('should update an existing user in the database', async () => {
      const user = User.create({
        id: 'user-1',
        username: 'testuser',
        avatarUrl: 'http://example.com/avatar.png',
      });
      await userRepository.save(user);

      user.updateProfile('updateduser', 'http://example.com/new-avatar.png');
      await userRepository.save(user);

      const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].username).toBe('updateduser');
      expect(result.rows[0].avatar_url).toBe('http://example.com/new-avatar.png');
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = User.create({
        id: 'user-1',
        username: 'testuser',
        avatarUrl: 'http://example.com/avatar.png',
      });
      await userRepository.save(user);

      const foundUser = await userRepository.findById(user.id);

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.id).toBe(user.id);
    });

    it('should return null if user is not found', async () => {
      const foundUser = await userRepository.findById('non-existent-user');
      expect(foundUser).toBeNull();
    });
  });
});
