import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    private userbase: User[] = [];
    
    findByEmail(email: string): User | undefined {
        return this.userbase.find(user => user.email === email);
    }

    createUser(username: string, email: string, passwordHash: string): User {
        const user: User = {
            id: Date.now(),
            username,
            email,
            passwordHash,
            createdAt: new Date(),
        };
        this.userbase.push(user);
        return user;
    }
}