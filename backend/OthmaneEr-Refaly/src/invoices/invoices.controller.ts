import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Delete, Patch, Res } from '@nestjs/common';
import { Response } from 'express';
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
  async findAll(@Request() req: any) {
    const data = await this.invoicesService.findAll(req.user.id);
    return { data }; // Wrapped in data for ApiResponse
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.invoicesService.findOne(req.user.id, id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateInvoiceDto: any) {
    return this.invoicesService.update(req.user.id, id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.invoicesService.remove(req.user.id, id);
  }

  @Patch(':id/paid')
  async markAsPaid(@Request() req: any, @Param('id') id: string) {
    return this.invoicesService.update(req.user.id, id, { status: 'PAID' } as any);
  }

  @Get(':id/pdf')
  async generatePdf(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(req.user.id, id);
    // Dummy PDF generation for testing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    res.send(Buffer.from('Dummy PDF content'));
  }
}