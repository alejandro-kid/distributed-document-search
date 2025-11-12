import { User } from '@/contexts/users/domain/User';

describe('User', () => {
  it('should create a new user with the correct profile details', () => {
    const profile = {
      id: 'user-123',
      username: 'testuser',
      avatarUrl: 'http://example.com/avatar.png',
    };

    const user = User.create(profile);

    expect(user.id).toBe(profile.id);
    expect(user.username).toBe(profile.username);
    expect(user.avatarUrl).toBe(profile.avatarUrl);
  });

  it('should update the user profile correctly', () => {
    const initialProfile = {
      id: 'user-123',
      username: 'testuser',
      avatarUrl: 'http://example.com/avatar.png',
    };
    const user = new User(initialProfile);

    const newUsername = 'updateduser';
    const newAvatarUrl = 'http://example.com/new-avatar.png';

    user.updateProfile(newUsername, newAvatarUrl);

    expect(user.username).toBe(newUsername);
    expect(user.avatarUrl).toBe(newAvatarUrl);
  });

  it('should convert the user to primitives', () => {
    const profile = {
      id: 'user-123',
      username: 'testuser',
      avatarUrl: 'http://example.com/avatar.png',
    };

    const user = new User(profile);
    const primitives = user.toPrimitives();

    expect(primitives).toEqual({
      id: 'user-123',
      username: 'testuser',
      avatarUrl: 'http://example.com/avatar.png',
    });
  });
});
