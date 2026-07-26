import { env, hasSmtpConfig } from '../src/config/env';
import { mailService } from '../src/services/mail.service';
import { logger } from '../src/services/logger.service';

const parseToArg = () => {
  const toFlag = process.argv.find((argument) => argument.startsWith('--to='));
  return toFlag ? toFlag.split('=').slice(1).join('=').trim() : env.SMTP_USER ?? undefined;
};

const run = async () => {
  if (!hasSmtpConfig) {
    throw new Error('SMTP is not fully configured. Set SMTP_HOST/SMTP_SERVICE, SMTP_USER, SMTP_PASS, and MAIL_FROM.');
  }

  const to = parseToArg();

  await mailService.verifyConnection();
  logger.info('SMTP verification completed successfully');

  if (!to) {
    logger.info('No --to recipient provided. Skipping message send.');
    return;
  }

  await mailService.send({
    to,
    subject: 'Pulse Chat SMTP self-test',
    text: 'This is a test email from Pulse Chat SMTP diagnostics.',
    html: '<p>This is a test email from <strong>Pulse Chat SMTP diagnostics</strong>.</p>'
  });

  logger.info({ to }, 'SMTP self-test email sent successfully');
};

run().catch((error) => {
  logger.error(
    {
      error: {
        message: (error as Error).message,
        code: (error as { code?: string } | undefined)?.code
      }
    },
    'SMTP self-test failed'
  );
  process.exit(1);
});
