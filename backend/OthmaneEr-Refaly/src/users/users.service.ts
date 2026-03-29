import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    private userbase: User[] = [];

    //*?**********************My functions "Othmane Er-REfaly"**********************

    

    createUser(username: string, email: string, passwordHash?: string, intraId?: string): User {
        const user: User = {
            id: Date.now(),
            username,
            email,
            createdAt: new Date(),
            // added xp and level for gamification
            xp: 0,
            level: 1,
        };
        // Only attach these if they exist
        if (passwordHash) user.passwordHash = passwordHash;
        if (intraId) user.intraId = intraId;
        
        this.userbase.push(user);
        return user;
    }

    findByEmail(email: string): User | undefined {
        return this.userbase.find(user => user.email === email);
        //works on mac, not on session, i think i need to add the tsconfing file.
    }

    ////*?**********************Zouita functions"Bdal li biti all working fine now "**********************



    findByIntraId(intraId: string): User | undefined {
        return this.userbase.find(user => user.intraId === intraId);
    }

    // added this method for gamification to find the user by ID and update their XP and Level
    findOne(id: number): User | undefined {
        return this.userbase.find(user => user.id === id);
    }

    // added this method for gamification to save the newly calculated XP and Level
    update(id: number, updateData: Partial<User>): User | undefined {
        const userIndex = this.userbase.findIndex(u => u.id === id);
        if (userIndex > -1) {
            // Merges the existing user data with the new incoming data (like { xp: 250, level: 2 })
            this.userbase[userIndex] = { ...this.userbase[userIndex], ...updateData };
            return this.userbase[userIndex];
        }
        return undefined; 
    }

}