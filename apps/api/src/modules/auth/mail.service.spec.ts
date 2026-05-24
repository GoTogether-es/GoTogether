import { MailService } from './mail.service';
import { createMockConfigService } from '../../test-utils/services';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getSession: jest.fn() },
  })),
}));

describe('MailService', () => {
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    configService = createMockConfigService();
  });

  it('does not throw when Resend is configured', () => {
    expect(() => new MailService(configService as any)).not.toThrow();
  });

  it('sends email when api key and from are configured', async () => {
    const service = new MailService(configService as any);
    await expect(service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>')).resolves.toBeUndefined();
  });

  it('skips sending when RESEND_API_KEY is missing', async () => {
    const noKeyConfig = createMockConfigService({ RESEND_API_KEY: '' });
    const service = new MailService(noKeyConfig as any);
    await expect(service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>')).resolves.toBeUndefined();
  });

  it('skips sending when RESEND_FROM is missing', async () => {
    const noFromConfig = createMockConfigService({ RESEND_FROM: '' });
    const service = new MailService(noFromConfig as any);
    await expect(service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>')).resolves.toBeUndefined();
  });
});
