import { User } from '../domain/User';

export class LoginOrRegisterUserResponse {
  constructor(
    public readonly user: User,
    public readonly token: string,
  ) {}
}
