import { Controller, Get } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    async findAll() {
        const clients = await this.clientsService.findAll();
        return {
            data: clients,
            count: clients.length,
        };
    }
}
