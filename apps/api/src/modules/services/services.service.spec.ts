import { ServicesService } from './services.service';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockService } from '../../test-utils/factories';
import { NotFoundException } from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new ServicesService(prisma as any);
  });

  it('lists active services only', async () => {
    prisma.service.findMany.mockResolvedValue([mockService()]);
    await service.listActive();
    const call = prisma.service.findMany.mock.calls[0][0];
    expect(call.where.active).toBe(true);
  });

  it('lists all services', async () => {
    prisma.service.findMany.mockResolvedValue([mockService(), mockService({ active: false })]);
    await service.listAll();
    const call = prisma.service.findMany.mock.calls[0][0];
    expect(call.where).toBeUndefined();
  });

  it('creates a service', async () => {
    prisma.service.create.mockResolvedValue(mockService({ name: 'Nuevo' }));
    const result = await service.create({ name: 'Nuevo', price: 1000 });
    expect(result.name).toBe('Nuevo');
  });

  it('updates a service', async () => {
    prisma.service.findUnique.mockResolvedValue(mockService({ id: 'svc-1' }));
    prisma.service.update.mockResolvedValue(mockService({ id: 'svc-1', name: 'Updated' }));
    const result = await service.update('svc-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('throws NotFoundException when updating non-existent service', async () => {
    prisma.service.findUnique.mockResolvedValue(null);
    await expect(service.update('bad-id', { name: 'x' })).rejects.toThrow(NotFoundException);
  });
});
