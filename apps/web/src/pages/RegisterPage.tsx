import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const RegisterPage = () => (
  <AuthLayout>
    <RegisterForm />
  </AuthLayout>
);
