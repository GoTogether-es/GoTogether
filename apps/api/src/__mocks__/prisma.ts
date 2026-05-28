function deepFns(shape: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(shape)) {
    if (typeof value === 'function') {
      result[key] = jest.fn();
    } else if (value !== null && typeof value === 'object') {
      result[key] = deepFns(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const shape = {
  user: {
    findUnique: jest.fn,
    upsert: jest.fn,
    update: jest.fn,
    findMany: jest.fn,
    count: jest.fn,
  },
  profile: {
    findUnique: jest.fn,
    upsert: jest.fn,
    findMany: jest.fn,
    update: jest.fn,
    count: jest.fn,
  },
  companionProfile: {
    findUnique: jest.fn,
    findFirst: jest.fn,
    upsert: jest.fn,
    update: jest.fn,
    findMany: jest.fn,
    count: jest.fn,
  },
  booking: {
    create: jest.fn,
    findUnique: jest.fn,
    findMany: jest.fn,
    update: jest.fn,
    count: jest.fn,
  },
  report: {
    findUnique: jest.fn,
    findMany: jest.fn,
    create: jest.fn,
    update: jest.fn,
    delete: jest.fn,
    aggregate: jest.fn,
    count: jest.fn,
  },
  supervision: {
    findFirst: jest.fn,
    findUnique: jest.fn,
    create: jest.fn,
    delete: jest.fn,
    findMany: jest.fn,
  },
  supervisionInvite: {
    findUnique: jest.fn,
    create: jest.fn,
    update: jest.fn,
    findMany: jest.fn,
  },
  notification: {
    create: jest.fn,
    findMany: jest.fn,
    updateMany: jest.fn,
    count: jest.fn,
  },
  service: {
    findUnique: jest.fn,
    findMany: jest.fn,
    create: jest.fn,
    update: jest.fn,
    count: jest.fn,
  },
  payment: {
    findMany: jest.fn,
    aggregate: jest.fn,
    count: jest.fn,
    create: jest.fn,
    update: jest.fn,
  },
  chatRoom: {
    findUnique: jest.fn,
    create: jest.fn,
    upsert: jest.fn,
  },
  chatMessage: {
    create: jest.fn,
  },
  availabilitySlot: {
    findMany: jest.fn,
    findFirst: jest.fn,
    deleteMany: jest.fn,
    createMany: jest.fn,
  },
  clientLocation: {
    findMany: jest.fn,
    upsert: jest.fn,
  },

  $connect: jest.fn,
  $disconnect: jest.fn,
  $on: jest.fn,
  $transaction: jest.fn,
  $use: jest.fn,
} as const;

export function createMockPrismaService() {
  return deepFns(shape as unknown as Record<string, unknown>);
}
