import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    // private userbase: User[] = [];
    constructor(private readonly prisma: PrismaService) {}
    //*?**********************My functions "Othmane Er-REfaly"**********************

    async createUser(username: string, email: string, name: string, passwordHash?: string, intraId?: string): Promise<User> {
        const newUser = await this.prisma.user.create({
            data: {
                username,
                email,
                name: name || null,
                xp: 0,
                level: 0,
                passwordHash: passwordHash || null,
                intraId: intraId || null,
            }
        });
        return newUser;
    }

    // createUser(username: string, email: string, passwordHash?: string, intraId?: string): User {
    //     const user: User = {
    //         id: Date.now(),
    //         username,
    //         email,
    //         createdAt: new Date(),
    //         // added xp and level for gamification
    //         xp: 0,
    //         level: 1,
    //     };
    //     // Only attach these if they exist
    //     if (passwordHash) user.passwordHash = passwordHash;
    //     if (intraId) user.intraId = intraId;
        
    //     this.userbase.push(user);
    //     return user;
    // }
    
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    // findByIntraId(intraId: string): User | undefined {
    //     return this.userbase.find(user => user.intraId === intraId);
    // }

    async findByIntraId(intraId: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { intraId } });
    }


    ////*?**********************Zouita functions"Bdal li biti all working fine now "**********************
    //TODOD : "Souita" make sure to change these functions of yours to match the prisma shit.

    // added this method for gamification to find the user by ID and update their XP and Level
    async findOne(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    // added this method for gamification to save the newly calculated XP and Level
    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
}