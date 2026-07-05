import { useEffect, useCallback, useRef } from 'react';
import { type Socket } from 'socket.io-client';

interface UseInterviewRoomOptions {
  socket: Socket | null;
  interviewId: string | null;
  role: 'recruiter' | 'candidate' | 'phone';
  onParticipantJoined?: (data: { role: string; userId: string }) => void;
  onParticipantLeft?: (data: { role: string; userId: string }) => void;
  onInterviewStarted?: (data: { startedAt: string }) => void;
  onInterviewEnded?: (data: { endedAt: string }) => void;
  onBothParticipantsReady?: (data: {
    recruiterSocketId: string;
    candidateSocketId: string;
    timestamp: string;
  }) => void;
  /** Emitted when the waiting room status changes (replaces REST polling) */
  onWaitingRoomStatusUpdate?: (data: { status: string; recruiterJoinedAt?: string }) => void;
}

/**
 * Join and manage an interview room via Socket.IO.
 *
 * Handles joining/leaving rooms, participant tracking, and
 * interview lifecycle events.
 *
 * CRITICAL: Socket.IO v4 does NOT preserve room membership across
 * reconnections. We listen for the socket's native 'connect' event
 * and rejoin the room every time the socket (re)connects.
 */
export function useInterviewRoom({
  socket,
  interviewId,
  role,
  onParticipantJoined,
  onParticipantLeft,
  onInterviewStarted,
  onInterviewEnded,
  onBothParticipantsReady,
  onWaitingRoomStatusUpdate,
}: UseInterviewRoomOptions) {
  // Stable refs so the connect handler always uses latest values
  const interviewIdRef = useRef(interviewId);
  interviewIdRef.current = interviewId;

  const roleRef = useRef(role);
  roleRef.current = role;

  // Join the room when socket + interviewId are ready, and REJOIN on reconnect
  useEffect(() => {
    if (!socket || !interviewId) return;

    const doJoin = () => {
      socket.emit('interview:join', {
        interviewId: interviewIdRef.current,
        role: roleRef.current,
      });
    };

    // Initial join
    doJoin();

    // Rejoin on reconnect — Socket.IO v4 does NOT preserve rooms across reconnect
    socket.on('connect', doJoin);

    return () => {
      socket.off('connect', doJoin);
      socket.emit('interview:leave');
    };
  }, [socket, interviewId, role]);

  // Stable refs for new callbacks
  const onBothParticipantsReadyRef = useRef(onBothParticipantsReady);
  onBothParticipantsReadyRef.current = onBothParticipantsReady;

  const onWaitingRoomStatusUpdateRef = useRef(onWaitingRoomStatusUpdate);
  onWaitingRoomStatusUpdateRef.current = onWaitingRoomStatusUpdate;

  // Listen for room events
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data: { role: string; userId: string }) => {
      console.log(`[InterviewRoom] Participant joined: ${data.role}`);
      onParticipantJoined?.(data);
    };

    const handleParticipantLeft = (data: { role: string; userId: string }) => {
      console.log(`[InterviewRoom] Participant left: ${data.role}`);
      onParticipantLeft?.(data);
    };

    const handleInterviewStarted = (data: { startedAt: string }) => {
      onInterviewStarted?.(data);
    };

    const handleInterviewEnded = (data: { endedAt: string }) => {
      onInterviewEnded?.(data);
    };

    const handleBothReady = (data: {
      recruiterSocketId: string;
      candidateSocketId: string;
      timestamp: string;
    }) => {
      console.log('[InterviewRoom] Both participants ready! Starting WebRTC...');
      onBothParticipantsReadyRef.current?.(data);
    };

    const handleWaitingRoomUpdate = (data: { status: string; recruiterJoinedAt?: string }) => {
      console.log(`[InterviewRoom] Waiting room status update: ${data.status}`);
      onWaitingRoomStatusUpdateRef.current?.(data);
    };

    socket.on('interview:participant-joined', handleParticipantJoined);
    socket.on('interview:participant-left', handleParticipantLeft);
    socket.on('interview:started', handleInterviewStarted);
    socket.on('interview:ended', handleInterviewEnded);
    socket.on('interview:both-ready', handleBothReady);
    socket.on('waiting-room:status-update', handleWaitingRoomUpdate);

    return () => {
      socket.off('interview:participant-joined', handleParticipantJoined);
      socket.off('interview:participant-left', handleParticipantLeft);
      socket.off('interview:started', handleInterviewStarted);
      socket.off('interview:ended', handleInterviewEnded);
      socket.off('interview:both-ready', handleBothReady);
      socket.off('waiting-room:status-update', handleWaitingRoomUpdate);
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
