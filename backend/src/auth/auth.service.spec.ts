import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

// ── otplib mock ──────────────────────────────────────────────────────────────
// We mock the CommonJS require() the service uses for otplib
jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(() => 'TESTSECRETBASE32'),
    keyuri: jest.fn(
      (email, issuer, secret) => `otpauth://totp/${issuer}:${email}?secret=${secret}`,
    ),
    verify: jest.fn(),
  },
}));

// ── qrcode mock ───────────────────────────────────────────────────────────────
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,FAKEQR')),
}));

const { authenticator } = require('otplib');

// ── service mocks ─────────────────────────────────────────────────────────────
const mockUsersService = {
  findOne:     jest.fn(),
  findByEmail: jest.fn(),
  update:      jest.fn(),
  createUser:  jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'signed.jwt.token'),
};

// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService — 2FA', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService,   useValue: mockJwtService   },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── generateTwoFactorSecret ───────────────────────────────────────────────

  describe('generateTwoFactorSecret', () => {
    it('generates a secret, saves it, and returns a QR code data URL', async () => {
      const user = { id: 'user-1', email: 'test@crm.com' };
      mockUsersService.update.mockResolvedValue({ ...user, twoFactorSecret: 'TESTSECRETBASE32' });

      const result = await service.generateTwoFactorSecret(user);

      expect(authenticator.generateSecret).toHaveBeenCalled();
      expect(authenticator.keyuri).toHaveBeenCalledWith(
        user.email, 'Mycel', 'TESTSECRETBASE32',
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(user.id, {
        twoFactorSecret: 'TESTSECRETBASE32',
      });
      expect(result).toBe('data:image/png;base64,FAKEQR');
    });
  });

  // ── verifyTwoFactorCode ───────────────────────────────────────────────────

  describe('verifyTwoFactorCode', () => {
    it('returns the user when the TOTP code is valid', async () => {
      const mockUser = { id: 'user-1', twoFactorSecret: 'REAL_SECRET' };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (authenticator.verify as jest.Mock).mockReturnValue(true);

      const result = await service.verifyTwoFactorCode('user-1', '123456');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
      expect(authenticator.verify).toHaveBeenCalledWith({
        secret: 'REAL_SECRET',
        token: '123456',
      });
      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedException when code is invalid', async () => {
      const mockUser = { id: 'user-1', twoFactorSecret: 'REAL_SECRET' };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (authenticator.verify as jest.Mock).mockReturnValue(false);

      await expect(
        service.verifyTwoFactorCode('user-1', '000000'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when 2FA is not configured (no secret)', async () => {
      const mockUser = { id: 'user-1', twoFactorSecret: null };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(
        service.verifyTwoFactorCode('user-1', '123456'),
      ).rejects.toThrow(UnauthorizedException);
      expect(authenticator.verify).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.verifyTwoFactorCode('ghost-user', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── turnOnTwoFactorAuth ───────────────────────────────────────────────────

  describe('turnOnTwoFactorAuth', () => {
    it('enables 2FA when the code is valid', async () => {
      const mockUser = { id: 'user-1', twoFactorSecret: 'SECRET' };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (authenticator.verify as jest.Mock).mockReturnValue(true);
      mockUsersService.update.mockResolvedValue({ ...mockUser, isTwoFactorEnabled: true });

      await service.turnOnTwoFactorAuth('user-1', '123456');

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', {
        isTwoFactorEnabled: true,
      });
    });

    it('does NOT enable 2FA when the code is wrong', async () => {
      const mockUser = { id: 'user-1', twoFactorSecret: 'SECRET' };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (authenticator.verify as jest.Mock).mockReturnValue(false);

      await expect(
        service.turnOnTwoFactorAuth('user-1', 'WRONG_CODE'),
      ).rejects.toThrow(UnauthorizedException);

      // isTwoFactorEnabled must NOT be set to true
      expect(mockUsersService.update).not.toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ isTwoFactorEnabled: true }),
      );
    });
  });

  // ── turnOffTwoFactorAuth ──────────────────────────────────────────────────

  describe('turnOffTwoFactorAuth', () => {
    it('disables 2FA and clears the secret', async () => {
      mockUsersService.update.mockResolvedValue({
        id: 'user-1',
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      });

      await service.turnOffTwoFactorAuth('user-1');

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      });
    });
  });

  // ── login (JWT generation) ────────────────────────────────────────────────

  describe('login', () => {
    it('generates a signed JWT token', async () => {
      const user = { id: 'user-1', email: 'test@crm.com' };
      const result = await service.login(user);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });
  });

  // ── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('throws ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'taken@crm.com', password: 'pass123' } as any),
      ).rejects.toThrow(ConflictException);

      expect(mockUsersService.createUser).not.toHaveBeenCalled();
    });

    it('creates a new user and returns result without passwordHash', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({
        id: 'new-user',
        email: 'new@crm.com',
        username: 'new',
        name: 'New User',
        passwordHash: 'hashed_pw',
      });

      const result = await service.register({
        email: 'new@crm.com',
        password: 'pass123',
      } as any);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('email', 'new@crm.com');
    });
  });

  // ── validateUser ─────────────────────────────────────────────────────────

  describe('validateUser', () => {
    it('returns user without passwordHash on valid credentials', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('password123', 1); // fast rounds for test
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@crm.com',
        passwordHash: hash,
      });

      const result = await service.validateUser('test@crm.com', 'password123');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('id', 'user-1');
    });

    it('returns null on wrong password', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('correct_password', 1);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@crm.com',
        passwordHash: hash,
      });

      const result = await service.validateUser('test@crm.com', 'wrong_password');
      expect(result).toBeNull();
    });

    it('returns null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('noone@crm.com', 'pass');
      expect(result).toBeNull();
    });
  });
});
