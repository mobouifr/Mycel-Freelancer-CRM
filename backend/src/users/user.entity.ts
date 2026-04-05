

export class User {
    id: string;
    username: string;
    name?: string; // Un-commented this so TS knows it exists
    businessName?: string; //for future use, if we want to add business accounts
    businessAddress?: string; //for future use, if we want to add business accounts
    logoUrl?: string; //for future use, if we want to add profile pictures
    email: string;
    passwordHash?: string;
    createdAt: Date;
    intraId?: string;
    // added these two vars for gamification
    xp: number;
    level: number;
}

