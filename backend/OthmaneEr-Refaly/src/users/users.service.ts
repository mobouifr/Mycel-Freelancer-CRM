import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    private userbase: User[] = [];
    
    findByEmail(email: string): User | undefined {
        return this.userbase.find(user => user.email === email);
        //works on mac, not on session, i think i need to add the tsconfing file.
    }

    findByIntraId(intraId: string): User | undefined {
        return this.userbase.find(user => user.intraId === intraId);
    }

    createUser(username: string, email: string, passwordHash?: string, intraId?: string): User {
        const user: User = {
            id: Date.now(),
            username,
            email,
            createdAt: new Date(),
        };
        // Only attach these if they exist
        if (passwordHash) user.passwordHash = passwordHash;
        if (intraId) user.intraId = intraId;
        
        this.userbase.push(user);
        return user;
    }
}