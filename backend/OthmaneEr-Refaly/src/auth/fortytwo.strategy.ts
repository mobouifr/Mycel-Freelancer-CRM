import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { AuthService } from './auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID || 'u-s4t2ud-b39311d0f71a7d46fc52e9ada2758e98720c98c324596ade751c6e36f020c584',
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET || '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',
      callbackURL: 'http://localhost:3000/auth/42/callback',
      scope: ['public'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, emails } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : `${username}@student.42.fr`;

    return this.authService.validateOAuthUser('42', {
      intraId: id,
      username: username,
      email: email,
    });
  }
}
