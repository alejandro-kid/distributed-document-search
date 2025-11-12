import { JwtService } from '@/contexts/shared/infrastructure/auth/JwtService';
import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { SocialAuthenticator } from '../domain/auth/SocialAuthenticator';
import { LoginOrRegisterUserResponse } from './LoginOrRegisterUserResponse';

export class LoginOrRegisterUseCase {
  constructor(
    private readonly socialAuthenticator: SocialAuthenticator,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async run(authorizationCode: string, codeVerifier: string): Promise<LoginOrRegisterUserResponse> {
    const profile = await this.socialAuthenticator.authenticate(authorizationCode, codeVerifier);

    let user = await this.userRepository.findById(profile.id);

    if (user) {
      user.updateProfile(profile.username, profile.avatarUrl);
    } else {
      user = User.create(profile);
    }

    await this.userRepository.save(user);

    const token = await this.jwtService.sign({ sub: user.id });

    return new LoginOrRegisterUserResponse(user, token);
  }
}
