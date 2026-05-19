import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive() {
    return this.prisma.service.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async listAll() {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; description?: string; price?: number; category?: string }) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string; price?: number; category?: string; active?: boolean }) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return this.prisma.service.update({ where: { id }, data });
  }
}
