import { Test, TestingModule } from '@nestjs/testing';
import { MAILGUN_CONFIGURATION } from './constants';
import { MailgunService } from './mailgun.service';

jest.mock('mailgun.js', () => {
  return jest.fn().mockImplementation(() => ({
    client: () => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          id: 'mock-id',
          message: 'Queued. Thank you.',
        }),
      },
    }),
  }));
});

describe('MailgunService', () => {
  let service: MailgunService;
  const domain = 'example.com';
  const fromEmail = `postmaster@${domain}`;
  const toEmail = 'test@example.com';

  beforeAll(async () => {
    const username = 'api';
    const key = 'test-key';
    const url = 'https://api.mailgun.net';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailgunService,
        {
          provide: MAILGUN_CONFIGURATION,
          useValue: {
            username,
            key,
            url,
          },
        },
      ],
    }).compile();

    service = module.get<MailgunService>(MailgunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Send email', async () => {
    const createSpy = (service as any).mailgun.messages.create;

    const received = await service.createEmail(domain, {
      from: fromEmail,
      to: toEmail,
      subject: 'TEST',
      text: 'Test was successful',
    });

    expect(received).toEqual({
      id: 'mock-id',
      message: 'Queued. Thank you.',
    });
    expect(createSpy).toHaveBeenCalledWith(domain, expect.objectContaining({
      subject: 'TEST'
    }));
  });
});
