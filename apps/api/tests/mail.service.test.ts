import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const nodemailerMock = vi.hoisted(() => {
  const transporter = {
    verify: vi.fn(),
    sendMail: vi.fn(),
  };

  return {
    createTransport: vi.fn(() => transporter),
    transporter,
  };
});

vi.mock('nodemailer', () => ({
  default: {
    createTransport: nodemailerMock.createTransport,
  },
}));

const smtpEnvironment = {
  SMTP_HOST: 'smtp.example.test',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'mailer@example.test',
  SMTP_PASS: 'test-only-password',
  MAIL_FROM: 'Pulse Chat <mailer@example.test>',
};

const originalEnvironment = { ...process.env };

describe('mail service SMTP transport', () => {
  beforeEach(() => {
    vi.resetModules();
    nodemailerMock.createTransport.mockClear();
    nodemailerMock.transporter.verify.mockResolvedValue(true);
    nodemailerMock.transporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

    Object.assign(process.env, smtpEnvironment);
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_FROM;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  it('creates a verified SMTP transport and sends the expected message envelope', async () => {
    const { mailService } = await import('../src/services/mail.service');

    await mailService.send({
      to: 'recipient@example.test',
      subject: 'Verify your Pulse Chat account',
      html: '<p>Verify your account</p>',
      text: 'Verify your account',
    });

    expect(nodemailerMock.createTransport).toHaveBeenCalledWith({
      host: smtpEnvironment.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: smtpEnvironment.SMTP_USER,
        pass: smtpEnvironment.SMTP_PASS,
      },
    });
    expect(nodemailerMock.transporter.verify).toHaveBeenCalledOnce();
    expect(nodemailerMock.transporter.sendMail).toHaveBeenCalledWith({
      from: smtpEnvironment.MAIL_FROM,
      to: 'recipient@example.test',
      subject: 'Verify your Pulse Chat account',
      html: '<p>Verify your account</p>',
      text: 'Verify your account',
    });
  });
});
