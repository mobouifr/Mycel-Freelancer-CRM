import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.client.findMany({
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
