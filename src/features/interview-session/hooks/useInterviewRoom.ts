import { useEffect, useCallback } from 'react';
import { type Socket } from 'socket.io-client';

interface UseInterviewRoomOptions {
  socket: Socket | null;
  interviewId: string | null;
  role: 'recruiter' | 'candidate' | 'phone';
  onParticipantJoined?: (data: { role: string; userId: string }) => void;
  onParticipantLeft?: (data: { role: string; userId: string }) => void;
  onInterviewStarted?: (data: { startedAt: string }) => void;
  onInterviewEnded?: (data: { endedAt: string }) => void;
}

/**
 * Join and manage an interview room via Socket.IO.
 *
 * Handles joining/leaving rooms, participant tracking, and
 * interview lifecycle events.
 */
export function useInterviewRoom({
  socket,
  interviewId,
  role,
  onParticipantJoined,
  onParticipantLeft,
  onInterviewStarted,
  onInterviewEnded,
}: UseInterviewRoomOptions) {
  // Join the room when socket + interviewId are ready
  useEffect(() => {
    if (!socket || !interviewId) return;

    socket.emit('interview:join', { interviewId, role });

    return () => {
      socket.emit('interview:leave');
    };
  }, [socket, interviewId, role]);

  // Listen for room events
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data: { role: string; userId: string }) => {
      onParticipantJoined?.(data);
    };

    const handleParticipantLeft = (data: { role: string; userId: string }) => {
      onParticipantLeft?.(data);
    };

    const handleInterviewStarted = (data: { startedAt: string }) => {
      onInterviewStarted?.(data);
    };

    const handleInterviewEnded = (data: { endedAt: string }) => {
      onInterviewEnded?.(data);
    };

    socket.on('interview:participant-joined', handleParticipantJoined);
    socket.on('interview:participant-left', handleParticipantLeft);
    socket.on('interview:started', handleInterviewStarted);
    socket.on('interview:ended', handleInterviewEnded);

    return () => {
      socket.off('interview:participant-joined', handleParticipantJoined);
      socket.off('interview:participant-left', handleParticipantLeft);
      socket.off('interview:started', handleInterviewStarted);
      socket.off('interview:ended', handleInterviewEnded);
    };
  }, [socket, onParticipantJoined, onParticipantLeft, onInterviewStarted, onInterviewEnded]);

  // Actions
  const startInterview = useCallback(
    (id: string) => {
      socket?.emit('interview:start', { interviewId: id });
    },
    [socket],
  );

  const endInterview = useCallback(
    (id: string) => {
      socket?.emit('interview:end', { interviewId: id });
    },
    [socket],
  );

  return { startInterview, endInterview };
}
