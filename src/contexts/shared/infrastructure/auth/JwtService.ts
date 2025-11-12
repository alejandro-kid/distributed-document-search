import { JWTPayload, SignJWT } from 'jose';

export class JwtService {
  private readonly secret: Uint8Array;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(secret: string, issuer: string, audience: string) {
    this.secret = new TextEncoder().encode(secret);
    this.issuer = issuer;
    this.audience = audience;
  }

  async sign(payload: JWTPayload, expiresIn: string = '1h'): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(expiresIn)
      .sign(this.secret);
  }

  // TODO: Add verify method if needed
}
