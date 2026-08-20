import { AuthLayout } from '@/components/layout/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const ForgotPasswordPage = () => (
  <AuthLayout>
    <ForgotPasswordForm />
  </AuthLayout>
);
