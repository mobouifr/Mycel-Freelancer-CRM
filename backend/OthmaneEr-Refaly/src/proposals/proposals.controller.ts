import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  create(@Request() req: any, @Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(req.user.id, createProposalDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.proposalsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.proposalsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto) {
    return this.proposalsService.update(req.user.id, id, updateProposalDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.proposalsService.remove(req.user.id, id);
  }
}
