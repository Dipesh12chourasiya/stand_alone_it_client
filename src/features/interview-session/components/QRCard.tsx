import { QRCodeSVG } from 'qrcode.react';
import type { PhoneSession } from '../types/session.types';

interface QRCardProps {
  session: PhoneSession;
  sessionUrl: string;
  qrSize?: number;
}

/**
 * Displays a QR code that the phone scans to connect.
 *
 * Shows the QR code, a countdown based on session expiry,
 * and the current connection status.
 */
export function QRCard({ session, sessionUrl, qrSize = 256 }: QRCardProps) {
  const expired = session.status === 'Expired';
  const connected = session.status === 'Connected';

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Phone Connection
      </h3>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Scan this QR code with your phone to connect as a monitoring device.
      </p>

      {expired ? (
        <div className="flex h-[256px] w-[256px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">QR expired</p>
        </div>
      ) : connected ? (
        <div className="flex h-[256px] w-[256px] items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
              Phone Connected
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
          <QRCodeSVG
            value={sessionUrl}
            size={qrSize}
            level="L"
            includeMargin
          />
        </div>
      )}

      {!connected && !expired && (
        <CountdownTimer expiresAt={session.expiresAt} />
      )}

      {connected && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Connected at{' '}
          {session.phoneConnectedAt
            ? new Date(session.phoneConnectedAt).toLocaleTimeString()
            : 'now'}
        </p>
      )}
    </div>
  );
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const expiresDate = new Date(expiresAt);
  const now = new Date();
  const remaining = Math.max(0, Math.floor((expiresDate.getTime() - now.getTime()) / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <p className="text-xs text-gray-400 dark:text-gray-500">
      QR expires in {minutes}:{seconds.toString().padStart(2, '0')}
    </p>
  );
}
