import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // We must tell Passport to use "email" instead of the default "username" field ???
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(email, pass); // <-- Notice the await
    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }
    return user; 
}
}
