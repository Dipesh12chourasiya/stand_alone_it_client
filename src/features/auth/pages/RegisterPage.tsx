import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free trial — no credit card required."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
