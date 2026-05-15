import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.booking.findMany({
      include: { payment: true, report: true, chatRoom: true },
    });
  }
}
