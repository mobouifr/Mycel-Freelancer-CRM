export class User {
    id: number;
    username: string;
    email: string;
    passwordHash?: string; // Add the question mark here!
    createdAt: Date;
    intraId?: string; 
}

