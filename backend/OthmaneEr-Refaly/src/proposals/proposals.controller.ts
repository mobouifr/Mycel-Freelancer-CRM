import { Controller, Get, Post, Put, Patch, Body, Param, Delete } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalStatus } from '@prisma/client';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  create(@Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(createProposalDto);
  }

  @Get()
  findAll() {
    return this.proposalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto) {
    return this.proposalsService.update(id, updateProposalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proposalsService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ProposalStatus) {
    return this.proposalsService.updateStatus(id, status);
  }

  @Get(':id/pdf')
  generatePdf(@Param('id') id: string) {
    return this.proposalsService.generatePdf(id);
  }

  @Post(':id/convert-to-invoice')
  convertToInvoice(@Param('id') id: string, @Body('dueDate') dueDate: string) {
    return this.proposalsService.convertToInvoice(id, dueDate);
  }
}
