import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { UserRole } from '../../generated/client';

@Injectable()
export class SupervisionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupervision(supervisorId: string, dto: CreateSupervisionDto) {
    const supervisor = await this.prisma.user.findUnique({
      where: { id: supervisorId },
    });
    if (!supervisor) throw new NotFoundException('Supervisor no encontrado');

    const client = await this.prisma.user.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    if (client.id === supervisor.id) {
      throw new ForbiddenException('No puedes supervisarte a ti mismo');
    }

    if (client.role === UserRole.SUPERVISOR) {
      throw new ForbiddenException('Un supervisor no puede ser supervisado');
    }

    const existing = await this.prisma.supervision.findUnique({
      where: { clientId: dto.clientId },
    });
    if (existing) {
      throw new ConflictException('Este cliente ya tiene un supervisor asignado');
    }

    const supervision = await this.prisma.supervision.create({
      data: {
        supervisorId,
        clientId: dto.clientId,
      },
      include: {
        client: { include: { profile: true } },
      },
    });

    await this.prisma.user.update({
      where: { id: supervisorId },
      data: { role: UserRole.SUPERVISOR },
    });

    return supervision;
  }

  async getMyClients(supervisorId: string) {
    return this.prisma.supervision.findMany({
      where: { supervisorId },
      include: {
        client: { include: { profile: true } },
      },
    });
  }

  async getMySupervisor(clientId: string) {
    return this.prisma.supervision.findUnique({
      where: { clientId },
      include: {
        supervisor: { include: { profile: true } },
      },
    });
  }

  async removeSupervision(id: string, userId: string) {
    const supervision = await this.prisma.supervision.findUnique({
      where: { id },
    });
    if (!supervision) throw new NotFoundException('Supervisión no encontrada');

    if (supervision.supervisorId !== userId) {
      throw new ForbiddenException('Solo el supervisor puede eliminar la vinculación');
    }

    return this.prisma.supervision.delete({ where: { id } });
  }
}
