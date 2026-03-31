import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { Transporter } from 'nodemailer';

import { env, hasSmtpConfig, smtpConfig } from '../config/env';
import { AppError } from '../errors/AppError';
import { logger } from './logger.service';

type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let cachedTransporter: Transporter<SMTPTransport.SentMessageInfo> | null | undefined;
let verifyPromise: Promise<void> | null = null;

const maskEmail = (value: string) => {
  const [localPart = '', domain = ''] = value.split('@');

  if (!domain) {
    return '[redacted-email]';
  }

  const maskedLocal =
    localPart.length <= 2 ? `${localPart[0] ?? '*'}*` : `${localPart.slice(0, 2)}***`;

  return `${maskedLocal}@${domain}`;
};

const mapMailError = (error: unknown) => {
  const candidate = error as
    | {
        code?: string;
        responseCode?: number;
        command?: string;
      }
    | undefined;

  if (candidate?.code === 'EAUTH' || candidate?.responseCode === 535) {
    return new AppError(
      'Email delivery is unavailable because the SMTP username or app password was rejected.',
      503,
      'EMAIL_AUTH_FAILED'
    );
  }

  if (candidate?.code === 'ESOCKET') {
    return new AppError(
      'Email delivery is unavailable because the SMTP connection settings are invalid.',
      503,
      'EMAIL_CONNECTION_FAILED'
    );
  }

  return new AppError(
    'Email delivery is temporarily unavailable. Please try again shortly.',
    503,
    'EMAIL_DELIVERY_FAILED'
  );
};

const createTransportOptions = (): SMTPTransport.Options | null => {
  if (!smtpConfig) {
    return null;
  }

  const auth =
    smtpConfig.user && smtpConfig.pass
      ? {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      : undefined;

  if (smtpConfig.service) {
    return {
      service: smtpConfig.service,
      secure: smtpConfig.secure,
      auth
    };
  }

  if (!smtpConfig.host || !smtpConfig.port) {
    return null;
  }

  return {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth
  };
};

const getTransporter = (): Transporter<SMTPTransport.SentMessageInfo> | null => {
  if (cachedTransporter !== undefined) {
    return cachedTransporter;
  }

  const transportOptions = createTransportOptions();
  cachedTransporter = transportOptions ? nodemailer.createTransport(transportOptions) : null;
  return cachedTransporter;
};

export const mailService = {
  async verifyConnection() {
    if (!hasSmtpConfig) {
      if (env.NODE_ENV !== 'production') {
        logger.warn('SMTP is not configured; email verification links will be logged locally');
        return;
      }

      throw new AppError(
        'Email delivery is not configured on the server',
        500,
        'EMAIL_DELIVERY_NOT_CONFIGURED'
      );
    }

    if (!verifyPromise) {
      const transporter = getTransporter();

      if (!transporter) {
        throw new AppError(
          'Email delivery is not configured on the server',
          500,
          'EMAIL_DELIVERY_NOT_CONFIGURED'
        );
      }

      verifyPromise = transporter.verify().then(() => {
        logger.info(
          {
            smtpHost: smtpConfig?.host ?? null,
            smtpService: smtpConfig?.service ?? null,
            smtpUser: smtpConfig?.user ? maskEmail(smtpConfig.user) : null
          },
          'SMTP transporter verified successfully'
        );
      }).catch((error: unknown) => {
        verifyPromise = null;
        logger.error(
          {
            error: {
              code: (error as { code?: string } | undefined)?.code,
              responseCode: (error as { responseCode?: number } | undefined)?.responseCode,
              command: (error as { command?: string } | undefined)?.command
            },
            smtpHost: smtpConfig?.host ?? null,
            smtpService: smtpConfig?.service ?? null,
            smtpUser: smtpConfig?.user ? maskEmail(smtpConfig.user) : null
          },
          'SMTP transporter verification failed'
        );
        throw mapMailError(error);
      });
    }

    await verifyPromise;
  },

  async send({ to, subject, html, text }: MailMessage) {
    if (!hasSmtpConfig) {
      if (env.NODE_ENV === 'production') {
        throw new AppError(
          'Email delivery is not configured on the server',
          500,
          'EMAIL_DELIVERY_NOT_CONFIGURED'
        );
      }

      logger.warn({ to: maskEmail(to), subject }, 'SMTP is not configured; logging email preview instead');
      logger.info({ to: maskEmail(to), subject, text }, 'Email preview');
      return;
    }

    await mailService.verifyConnection();

    const transporter = getTransporter();

    if (!transporter) {
      throw new AppError(
        'Email delivery is not configured on the server',
        500,
        'EMAIL_DELIVERY_NOT_CONFIGURED'
      );
    }

    try {
      await transporter.sendMail({
        from: smtpConfig?.from ?? env.MAIL_FROM,
        to,
        subject,
        html,
        text
      });
    } catch (error) {
      logger.error(
        {
          error: {
            code: (error as { code?: string } | undefined)?.code,
            responseCode: (error as { responseCode?: number } | undefined)?.responseCode,
            command: (error as { command?: string } | undefined)?.command
          },
          to: maskEmail(to),
          subject
        },
        'Email send failed'
      );
      throw mapMailError(error);
    }
  }
};
