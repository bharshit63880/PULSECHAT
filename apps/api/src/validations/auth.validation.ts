import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@chat-app/shared';

export const authValidation = {
  register: registerSchema,
  login: loginSchema,
  googleLogin: googleLoginSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  verifyEmail: verifyEmailSchema,
  resendVerification: resendVerificationSchema,
};
