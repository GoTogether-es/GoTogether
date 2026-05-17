import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import jwksClient from 'jwks-rsa';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    }

    const client = jwksClient({
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_request, rawJwtToken, done) => {
        const [headerB64] = rawJwtToken.split('.');
        const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
        if (!header.kid) return done(new Error('Invalid JWT: missing kid'));
        client.getSigningKey(header.kid, (err, key) => {
          if (err) return done(err);
          if (!key) return done(new Error('Signing key not found'));
          const publicKey = key.getPublicKey();
          done(null, publicKey);
        });
      },
      algorithms: ['RS256', 'ES256'],
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
