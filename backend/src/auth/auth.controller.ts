import { Body, Controller, Post, UseGuards, Request, Res, HttpCode, HttpStatus, Get, Put, BadRequestException } from '@nestjs/common';
import { Response } from 'express'; // Ensure this is imported from 'express'
import { RegisterDto } from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard'; // Import your new guard
import { JwtAuthGuard } from './jwt-auth.guard'; // Add this import
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    // For now, we just return the data to test if validation works!
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard) // 🛡️ This triggers the LocalStrategy!
  @Post('login')
  @HttpCode(HttpStatus.OK) // Logins are usually 200 OK, not 201 Created
  async login(@Body() loginDto: LoginDto, @Request() req: any, @Res({ passthrough: true }) res: Response) {
    if (req.user.isTwoFactorEnabled) {
      return { 
        message: '2FA required', 
        isTwoFactorRequired: true,
        userId: req.user.id 
      };
    }

    // 1. Generate the JWT
    const { access_token } = await this.authService.login(req.user);

    // 2. Set the JWT in an HttpOnly cookie
    res.cookie('jwt', access_token, {
      httpOnly: true,     // This prevents XSS attacks (JS cannot read the cookie)
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS), false locally
      sameSite: 'lax',    // Good default for CSRF protection
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
    });

    // 3. Return the user info (so the frontend dashboard can say "Hello, Othmane!")
    return { message: 'Logged in successfully', user: req.user };
  }

  @UseGuards(JwtAuthGuard) // This ensures only authenticated users can access this route
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'Logged out successfully' };
  }


  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    // This route will ONLY run if the user has a valid 'jwt' cookie!
    // We use the ID from the payload to fetch the full fresh user from the database
    const user = await this.authService.validateUserById(req.user.id);
    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: any) {
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }
    await this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    // Allows the frontend settings page to update user information
    const allowedFields = ['name', 'username', 'email'];
    
    // Filter only allowed fields so they don't overwrite id, password, or intraId
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedUser = await this.authService.updateUser(req.user.id, updateData);
    if (updatedUser) {
      const { passwordHash, ...result } = updatedUser;
      return result;
    }
    return null;
  }

  // --- 42 Intra OAuth Routes ---
  
  // 1. This route redirects the user to the 42 login page
  @UseGuards(AuthGuard('42'))
  @Get('42')
  fortytwoAuth() {
    // Passport automatically handles the redirect, so this method body can be empty
  }

  // 2. 42 redirects back to this URL with the authorization code
  @UseGuards(AuthGuard('42'))
  @Get('42/callback')
  async fortytwoAuthRedirect(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'https://localhost';

    if (req.user.isTwoFactorEnabled) {
      return res.redirect(`${frontendUrl}/2fa?userId=${req.user.id}`);
    }

    // Generate our own JWT cookie for the rest of the application
    const { access_token } = await this.authService.login(req.user);

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // Redirect to the frontend OAuth callback page so it can handle the session
    return res.redirect(`${frontendUrl}/auth/callback`);
  }

  // --- 2FA Routes ---

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactorSecret(@Request() req: any) {
    const qrCodeUrl = await this.authService.generateTwoFactorSecret(req.user);
    return { qrCodeUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  @HttpCode(HttpStatus.OK)
  async turnOnTwoFactorAuth(@Request() req: any, @Body() body: any) {
    if (!body.code) throw new BadRequestException('2FA code is required');
    await this.authService.turnOnTwoFactorAuth(req.user.id, body.code);
    return { message: '2FA enabled successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-off')
  @HttpCode(HttpStatus.OK)
  async turnOffTwoFactorAuth(@Request() req: any) {
    await this.authService.turnOffTwoFactorAuth(req.user.id);
    return { message: '2FA disabled successfully' };
  }

  // This route is NOT guarded by JwtAuthGuard because the user is only partially logged in
  @Post('2fa/authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticateTwoFactor(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    if (!body.userId || !body.code) throw new BadRequestException('userId and code are required');
    
    // Validate 2FA
    await this.authService.verifyTwoFactorCode(body.userId, body.code);
    
    // Get user back to set the cookie
    const user = await this.authService.validateUserById(body.userId);
    if (!user) throw new BadRequestException('User not found');

    const { access_token } = await this.authService.login(user);
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return { message: 'Logged in successfully', user: safeUser };
  }
}
