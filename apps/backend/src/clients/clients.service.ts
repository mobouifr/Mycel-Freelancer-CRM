import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * SECURITY FIX: Scope clients by userId so users can only see their own data.
     * In production this userId will come from the JWT token.
     * For now the controller passes a hardcoded test userId.
     */
    async findAll(userId: string) {
        return this.prisma.client.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                email: true,
                company: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
