import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AuthService {
    
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
        )
    {}

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(registerDto: RegisterDto) {
        if (await this.usersService.findByEmail(registerDto.email)) {
            // Throwing an Error here is okay for now, walakin in NestJS there us built-in HTTP Exceptions!
            throw new ConflictException('Email already in use'); 
        }
        
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const username = registerDto.username || registerDto.name || registerDto.email.split('@')[0];
        
        const newUser = await this.usersService.createUser(username, registerDto.email, registerDto.name || username, passwordHash);
        
        const { passwordHash: _, ...result } = newUser;
        return result;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if(user && user.passwordHash && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async validateUserById(id: string): Promise<any> {
        return this.usersService.findOne(id);
    }

    async updateUser(id: string, updateData: any): Promise<any> {
        return this.usersService.update(id, updateData);
    }

    async validateOAuthUser(provider: string, profile: any): Promise<any> {
        let user = await this.usersService.findByIntraId(profile.intraId);
        
        if (!user) {
            // User doesn't exist, create them
            // We pass undefined for passwordHash, and profile.intraId for the intraId
            user = await this.usersService.createUser(
                profile.username,
                profile.email,
                profile.name,
                undefined,
                profile.intraId
            );
        } else if (!user.name && profile.name) {
            // Existing user has a blank name (from an old login), update it now!
            user = await this.usersService.update(user.id, { name: profile.name });
        }

        const { passwordHash, ...result } = user;
        return result;
    }
}


