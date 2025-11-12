import { SocialAuthenticator, SocialProfile } from '@/contexts/users/domain/auth/SocialAuthenticator';

export class MockSocialAuthenticator implements SocialAuthenticator {
  private mockProfile: SocialProfile | null = null;
  private errorToThrow: Error | null = null;

  setNextProfile(profile: SocialProfile): void {
    this.nextProfile = profile;
    this.errorToThrow = null; // Clear any previous error
  }

  setError(error: Error): void {
    this.errorToThrow = error;
    this.nextProfile = null; // Clear any previous profile
  }

  setNextProfile(profile: SocialProfile): void {
    this.mockProfile = profile;
    this.errorToThrow = null;
  }

  setNextError(error: Error): void {
    this.errorToThrow = error;
    this.mockProfile = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async authenticate(authorizationCode: string, codeVerifier: string): Promise<SocialProfile> {
    if (this.errorToThrow) {
      throw this.errorToThrow;
    }
    if (this.mockProfile) {
      return Promise.resolve(this.mockProfile);
    }
    throw new Error('MockSocialAuthenticator has no mock profile or error set');
  }
}
