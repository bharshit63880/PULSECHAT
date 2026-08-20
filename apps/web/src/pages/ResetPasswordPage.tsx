import { AuthLayout } from '@/components/layout/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const ResetPasswordPage = () => (
  <AuthLayout>
    <ResetPasswordForm />
  </AuthLayout>
);
