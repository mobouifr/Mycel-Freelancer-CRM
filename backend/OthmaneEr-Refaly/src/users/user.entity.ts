export class User {
    id: number;
    username: string;
    //name: string; //what wrong here ??
    businessName?: string; //for future use, if we want to add business accounts
    businessAddress?: string; //for future use, if we want to add business accounts
    logoUrl?: string; //for future use, if we want to add profile pictures
    email: string;
    passwordHash?: string;
    createdAt: Date;
    updatedAt?: Date;
    intraId?: string; 
}

