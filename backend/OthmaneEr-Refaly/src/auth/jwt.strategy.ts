import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Tell Passport how to find the token
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.cookies?.['jwt'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      ignoreExpiration: false,
      // The secret must match the one you put in auth.module.ts!
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-key-that-will-be-in-env-later',
    });
  }

  // If the signature is valid, Passport calls this method with the decoded JSON payload
  async validate(payload: any) {
    // We attach exactly what we need to the `req.user` object for upcoming routes
    return { id: payload.sub, email: payload.email };
  }
}