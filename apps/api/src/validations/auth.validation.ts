import { loginSchema, registerSchema, resendVerificationSchema, verifyEmailSchema } from '@chat-app/shared';

export const authValidation = {
  register: registerSchema,
  login: loginSchema,
  verifyEmail: verifyEmailSchema,
  resendVerification: resendVerificationSchema
};
