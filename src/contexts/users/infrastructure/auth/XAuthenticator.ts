import { X_CLIENT_ID, X_CLIENT_SECRET } from '@/config';
import axios from 'axios';
import { SocialAuthenticator, SocialProfile } from '../../domain/auth/SocialAuthenticator';

export class XAuthenticator implements SocialAuthenticator {
  async authenticate(authorizationCode: string, codeVerifier: string): Promise<SocialProfile> {
    try {
      const tokenResponse = await this.exchangeCodeForToken(authorizationCode, codeVerifier);
      const accessToken = tokenResponse.access_token;

      const userData = await this.fetchUserProfile(accessToken);

      if (!userData) {
        throw new Error('Could not retrieve user data from X API');
      }

      return {
        id: userData.id,
        username: userData.username,
        avatarUrl: userData.profile_image_url,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid X token');
        }
        throw new Error(
          `X API error: ${error.response.status} - ${error.response.data.detail || error.response.data.title}`,
        );
      }
      throw new Error(`Failed to authenticate with X: ${error}`);
    }
  }

  private async exchangeCodeForToken(authorizationCode: string, codeVerifier: string) {
    const credentials = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        code: authorizationCode,
        grant_type: 'authorization_code',
        client_id: X_CLIENT_ID,
        redirect_uri: 'saldo://callback',
        code_verifier: codeVerifier,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    return response.data;
  }

  private async fetchUserProfile(accessToken: string) {
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        'user.fields': 'profile_image_url',
      },
    });

    return response.data.data;
  }
}
