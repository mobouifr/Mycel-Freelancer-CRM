import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.invoicesService.create(req.user.id, body);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.invoicesService.findAll(req.user.id);
  }
}