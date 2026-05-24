import { NotificationsService } from './notifications.service';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockNotification } from '../../test-utils/factories';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new NotificationsService(prisma as any);
  });

  it('creates a notification', async () => {
    prisma.notification.create.mockResolvedValue(mockNotification({ id: 'n-1' }));

    const result = await service.create({
      userId: 'user-1',
      type: 'booking_requested',
      title: 'Test',
      body: 'Body',
    });

    expect(result).toHaveProperty('id', 'n-1');
  });

  it('finds notifications by user with max 50', async () => {
    prisma.notification.findMany.mockResolvedValue([]);

    await service.findByUser('user-1');

    const call = prisma.notification.findMany.mock.calls[0][0];
    expect(call.where.userId).toBe('user-1');
    expect(call.take).toBe(50);
  });

  it('counts unread notifications', async () => {
    prisma.notification.count.mockResolvedValue(3);
    const result = await service.countUnread('user-1');
    expect(result).toBe(3);
  });

  it('marks a notification as read scoped to user', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });

    await service.markRead('notif-1', 'user-1');

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notif-1', userId: 'user-1' },
      data: { read: true },
    });
  });

  it('marks all unread notifications as read', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 5 });

    await service.markAllRead('user-1');

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', read: false },
      data: { read: true },
    });
  });
});
