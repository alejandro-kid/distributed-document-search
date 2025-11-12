export interface SocialProfile {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface SocialAuthenticator {
  authenticate(authorizationCode: string, codeVerifier: string): Promise<SocialProfile>;
}
