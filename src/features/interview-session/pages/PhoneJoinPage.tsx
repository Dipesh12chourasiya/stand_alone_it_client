import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionApi } from '../api/session.api';
import { useMediaPermissions } from '../hooks/useMediaPermissions';
import { DevicePermissionCard } from '../components/DevicePermissionCard';
import { WaitingCard } from '../components/WaitingCard';
import { getBrowserInfo } from '../utils/media';

/**
 * Phone join page.
 *
 * The phone lands here after scanning the QR code.
 * Validates the session, requests permissions, then
 * navigates to the streaming session page.
 */
export function PhoneJoinPage() {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const navigate = useNavigate();
  const { permissions, requestBoth, requestCamera, requestMicrophone, isLoading, error } =
    useMediaPermissions();

  // Validate the session token
  const { data, isLoading: validating, error: validationError } = useQuery({
    queryKey: ['phone-session-validate', sessionToken],
    queryFn: () => sessionApi.validateSession(sessionToken!),
    enabled: !!sessionToken,
    retry: false,
    select: (response) => response.data.session,
  } as never);

  // Connect phone to session
  const { mutate: connect, isPending: connecting } = useMutation({
    mutationFn: () => {
      const { browser, os } = getBrowserInfo();
      return sessionApi.connectPhone(sessionToken!, {
        browser,
        os,
        camera: permissions.camera,
      });
    },
    onSuccess: () => {
      toast.success('Connected! Setting up camera...');
      navigate(`/phone/session/${sessionToken}`, { replace: true });
    },
    onError: () => {
      toast.error('Failed to connect phone.');
    },
  });

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <WaitingCard message="Validating session..." />
      </div>
    );
  }

  if (validationError || !data) {
    const errorMessage =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (validationError as any)?.message || 'Invalid or expired session.';

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="max-w-sm rounded-lg border border-red-200 bg-white p-6 text-center dark:border-red-800 dark:bg-gray-800">
          <p className="text-lg">🚫</p>
          <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            Cannot Connect
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {errorMessage}
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Please ask the recruiter to generate a new QR code.
          </p>
        </div>
      </div>
    );
  }

  const allGranted =
    permissions.camera === 'granted' && permissions.microphone === 'granted';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        {/* Interview info */}
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400">
            Phone Connection
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            Camera Monitor Setup
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Grant permissions below to start monitoring.
          </p>
        </div>

        <DevicePermissionCard
          permissions={permissions}
          onRequestCamera={requestCamera}
          onRequestMicrophone={requestMicrophone}
          onRequestBoth={requestBoth}
          isLoading={isLoading}
          error={error}
        />

        {allGranted && (
          <button
            onClick={() => connect()}
            disabled={connecting}
            className="mt-4 w-full cursor-pointer rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect & Start Streaming'}
          </button>
        )}
      </div>
    </div>
  );
}
