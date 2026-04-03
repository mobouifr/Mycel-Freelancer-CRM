import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createProposalDto: CreateProposalDto) {
    return this.prisma.proposal.create({
      data: {
        ...createProposalDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.proposal.findMany({
      where: { userId },
      include: { project: true },
    });
  }

  async findOne(userId: string, id: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { id, userId },
      include: { project: true },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }
    return proposal;
  }

  async update(userId: string, id: string, updateProposalDto: UpdateProposalDto) {
    await this.findOne(userId, id); // Verify existence and ownership
    return this.prisma.proposal.update({
      where: { id },
      data: updateProposalDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Verify existence and ownership
    return this.prisma.proposal.delete({
      where: { id },
    });
  }
}
