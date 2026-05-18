import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { InviteSupervisionDto } from './dto/invite-supervision.dto';
import { UserRole } from '../../generated/client';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { getSupervisionInviteTemplate } from '../auth/mail.templates';

@Injectable()
export class SupervisionService {
  private resend: Resend | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  private getResend(): Resend {
    if (!this.resend) {
      const key = this.configService.get<string>('RESEND_API_KEY');
      if (key) this.resend = new Resend(key);
    }
    if (!this.resend) throw new InternalServerErrorException('Resend no configurado');
    return this.resend;
  }

  async createSupervision(supervisorId: string, dto: CreateSupervisionDto) {
    const supervisor = await this.prisma.user.findUnique({ where: { id: supervisorId } });
    if (!supervisor) throw new NotFoundException('Supervisor no encontrado');

    const client = await this.prisma.user.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    if (client.id === supervisor.id) throw new ForbiddenException('No puedes supervisarte a ti mismo');
    if (client.role === UserRole.SUPERVISOR) throw new ForbiddenException('Un supervisor no puede ser supervisado');

    const existing = await this.prisma.supervision.findUnique({ where: { clientId: dto.clientId } });
    if (existing) throw new ConflictException('Este cliente ya tiene un supervisor asignado');

    const supervision = await this.prisma.supervision.create({
      data: { supervisorId, clientId: dto.clientId },
      include: { client: { include: { profile: true } } },
    });

    await this.prisma.user.update({ where: { id: supervisorId }, data: { role: UserRole.SUPERVISOR } });
    return supervision;
  }

  async inviteSupervision(supervisorId: string, dto: InviteSupervisionDto) {
    const supervisor = await this.prisma.user.findUnique({ where: { id: supervisorId } });
    if (!supervisor) throw new NotFoundException('Supervisor no encontrado');

    const token = randomUUID();
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';

    const invite = await this.prisma.supervisionInvite.create({
      data: {
        supervisorId,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail || null,
        clientId: dto.clientId || null,
        token,
        status: 'PENDING',
      },
    });

    const supervisorProfile = await this.prisma.profile.findUnique({ where: { userId: supervisorId } });
    const supervisorName = supervisorProfile?.fullName || supervisor.email;

    const targetEmail = dto.clientEmail || '';
    if (targetEmail && this.configService.get<string>('RESEND_API_KEY')) {
      try {
        await this.getResend().emails.send({
          from: this.configService.get<string>('RESEND_FROM')!,
          to: [targetEmail],
          subject: `${supervisorName} te invita a conectar en GoTogether`,
          html: getSupervisionInviteTemplate({
            supervisorName,
            clientName: dto.clientName,
            acceptUrl: `${appUrl}/supervision/accept?token=${token}`,
          }),
        });
      } catch (err) {
        console.error('Failed to send supervision invite email:', err);
      }
    }

    await this.prisma.user.update({ where: { id: supervisorId }, data: { role: UserRole.SUPERVISOR } });
    return invite;
  }

  async acceptInvitation(token: string, userId: string) {
    const invite = await this.prisma.supervisionInvite.findUnique({ where: { token } });
    if (!invite) throw new NotFoundException('Invitación no encontrada');
    if (invite.status !== 'PENDING') {
      throw new ConflictException(invite.status === 'ACCEPTED' ? 'Ya fue aceptada' : 'Ya fue rechazada');
    }

    const existingSupervision = await this.prisma.supervision.findUnique({ where: { clientId: userId } });
    if (existingSupervision) throw new ConflictException('Ya tienes un supervisor asignado');

    await this.prisma.supervision.create({
      data: { supervisorId: invite.supervisorId, clientId: userId },
    });
    await this.prisma.supervisionInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', clientId: userId },
    });

    return { success: true, message: 'Supervisión aceptada correctamente' };
  }

  async getPendingInvites(supervisorId: string) {
    return this.prisma.supervisionInvite.findMany({
      where: { supervisorId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelInvitation(inviteId: string, userId: string) {
    const invite = await this.prisma.supervisionInvite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invitación no encontrada');
    if (invite.supervisorId !== userId) throw new ForbiddenException('No puedes cancelar esta invitación');

    return this.prisma.supervisionInvite.update({
      where: { id: inviteId },
      data: { status: 'CANCELLED' },
    });
  }

  async getMyClients(supervisorId: string) {
    return this.prisma.supervision.findMany({
      where: { supervisorId },
      include: { client: { include: { profile: true } } },
    });
  }

  async getMySupervisor(clientId: string) {
    return this.prisma.supervision.findUnique({
      where: { clientId },
      include: { supervisor: { include: { profile: true } } },
    });
  }

  async removeSupervision(id: string, userId: string) {
    const supervision = await this.prisma.supervision.findUnique({ where: { id } });
    if (!supervision) throw new NotFoundException('Supervisión no encontrada');
    if (supervision.supervisorId !== userId) throw new ForbiddenException('Solo el supervisor puede eliminar');
    return this.prisma.supervision.delete({ where: { id } });
  }
}
