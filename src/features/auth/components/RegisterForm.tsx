import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegisterMutation } from '../hooks/useAuthMutations';

// ─── Schema ──────────────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must not exceed 100 characters.'),
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  company: z
    .string()
    .min(1, 'Company name is required.')
    .max(200, 'Company name must not exceed 200 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Component ───────────────────────────────────────────────

export function RegisterForm() {
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Full name"
        placeholder="John Doe"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Company"
        placeholder="Acme Inc."
        autoComplete="organization"
        error={errors.company?.message}
        {...register('company')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        hint="Minimum 8 characters."
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
