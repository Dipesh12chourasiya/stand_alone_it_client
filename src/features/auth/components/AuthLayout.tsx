import type { ReactNode } from 'react';

// ─── Props ───────────────────────────────────────────────────

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

// ─── Component ───────────────────────────────────────────────

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            IntegrityCam
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} IntegrityCam. All rights reserved.
        </p>
      </div>
    </div>
  );
}
