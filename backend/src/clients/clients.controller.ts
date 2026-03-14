import { Controller, Get } from '@nestjs/common';
import { ClientsService } from './clients.service';

// ---------------------------------------------------------------------------
// SECURITY FIX: In production, userId comes from @CurrentUser() decorator
// backed by JWT auth. For testing we hardcode the seeded demo user.
// ---------------------------------------------------------------------------
const DEMO_USER_ID = '00000000-0000-4000-a000-000000000001'; // demo@crm.com

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    async findAll() {
        // TODO: Replace DEMO_USER_ID with authenticated user from JWT
        const clients = await this.clientsService.findAll(DEMO_USER_ID);
        return {
            data: clients,
            count: clients.length,
            _meta: { userId: DEMO_USER_ID, note: 'Hardcoded for testing — replace with JWT auth' },
        };
    }
}
