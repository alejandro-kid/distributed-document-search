import { AggregateRoot } from '../../shared/domain/AggregateRoot';

interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
}

export class User extends AggregateRoot {
  readonly id: string;
  username: string;
  avatarUrl: string;

  constructor(profile: UserProfile) {
    super();
    this.id = profile.id;
    this.username = profile.username;
    this.avatarUrl = profile.avatarUrl;
  }

  static create(profile: UserProfile): User {
    const user = new User(profile);
    // Aquí se podrían registrar eventos de dominio, por ejemplo: user.record(new UserCreatedEvent(...))
    return user;
  }

  public updateProfile(username: string, avatarUrl: string): void {
    this.username = username;
    this.avatarUrl = avatarUrl;
    // Aquí se podrían registrar eventos de dominio, por ejemplo: user.record(new UserProfileUpdatedEvent(...))
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: this.id,
      username: this.username,
      avatarUrl: this.avatarUrl,
    };
  }
}
