

export class User {
    id: string;
    username: string;
    name?: string; // Un-commented this so TS knows it exists
    email: string;
    passwordHash?: string;
    createdAt: Date;
    intraId?: string;
    isTwoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    // added these two vars for gamification
    xp: number;
    level: number;
}

