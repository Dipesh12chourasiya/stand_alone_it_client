import type { ReactNode } from 'react';

interface InterviewSessionLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

/**
 * Split layout for the interview session page.
 * Sidebar contains QR/status, main area contains video stream.
 */
export function InterviewSessionLayout({
  sidebar,
  main,
}: InterviewSessionLayoutProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 lg:flex-row">
      {/* Sidebar — QR code, connection status, controls */}
      <aside className="w-full shrink-0 lg:w-80">
        {sidebar}
      </aside>

      {/* Main — video stream area */}
      <main className="flex min-w-0 flex-1 flex-col gap-4">
        {main}
      </main>
    </div>
  );
}
