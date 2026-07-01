import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLoginMutation } from '../hooks/useAuthMutations';

// ─── Schema ──────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ───────────────────────────────────────────────

export function LoginForm() {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="space-y-1.5">
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
