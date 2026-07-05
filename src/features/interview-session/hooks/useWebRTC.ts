import { useRef, useEffect, useCallback } from 'react';
import { type Socket } from 'socket.io-client';
import { useSessionStore } from '../store/session.store';

interface UseWebRTCOptions {
  socket: Socket | null;
  localStream: MediaStream | null;
  role: 'phone' | 'recruiter';
  remoteRole: 'phone' | 'recruiter';
  onRemoteStream?: (stream: MediaStream) => void;
}

/**
 * WebRTC peer connection manager.
 *
 * Creates a RTCPeerConnection, negotiates via Socket.IO signaling,
 * and bridges local → remote media streams.
 *
 * The phone creates the offer, the recruiter answers.
 */
export function useWebRTC({
  socket,
  localStream,
  role: _role,
  remoteRole,
  onRemoteStream,
}: UseWebRTCOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const { setWebRTCState } = useSessionStore();

  // Stored refs for stable callback references
  const onRemoteStreamRef = useRef(onRemoteStream);
  onRemoteStreamRef.current = onRemoteStream;

  // ICE servers: local STUN for development
  const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Create the peer connection — stable identity via useRef tracking
  const createPeerConnection = useCallback(() => {
    // Close existing connection before creating a new one
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Forward ICE candidates through signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate.toJSON(),
          toRole: remoteRole,
        });
      }
    };

    // When the remote peer adds a track, surface the stream
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        onRemoteStreamRef.current?.(stream);
      }
    };

    // Track connection state changes
    pc.onconnectionstatechange = () => {
      setWebRTCState(pc.connectionState as 'connected' | 'failed');

      if (pc.connectionState === 'failed') {
        socket?.emit('webrtc:ice-failure');
      }
    };

    // Add local tracks to the connection
    if (localStream) {
      for (const track of localStream.getTracks()) {
        if (track.readyState !== 'ended') {
          pc.addTrack(track, localStream);
        }
      }
    }

    return pc;
  }, [localStream, socket, remoteRole, setWebRTCState]);

  // Stable offer creator — recreates when localStream or socket changes
  const createOffer = useCallback(async () => {
    try {
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket?.connected) {
        socket.emit('webrtc:offer', {
          sdp: pc.localDescription,
          toRole: remoteRole,
        });
      }

      setWebRTCState('offering');
    } catch (err) {
      console.error('[WebRTC] Failed to create offer:', err);
      setWebRTCState('failed');
    }
  }, [createPeerConnection, socket, remoteRole, setWebRTCState]);

  // Recruiter: handle incoming offer, create answer
  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      try {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket?.emit('webrtc:answer', {
          sdp: pc.localDescription,
          toRole: remoteRole,
        });

        setWebRTCState('answering');
      } catch (err) {
        console.error('[WebRTC] Failed to handle offer:', err);
        setWebRTCState('failed');
      }
    },
    [createPeerConnection, socket, remoteRole, setWebRTCState],
  );

  // Phone: handle incoming answer
  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    try {
      const pc = pcRef.current;
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      setWebRTCState('connected');
    } catch (err) {
      console.error('[WebRTC] Failed to handle answer:', err);
      setWebRTCState('failed');
    }
  }, [setWebRTCState]);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        const pc = pcRef.current;
        if (!pc || !candidate) return;

        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[WebRTC] Failed to add ICE candidate:', err);
      }
    },
    [],
  );

  // Listen for signaling events — stable listener refs prevent re-attach loops
  const stableOnOffer = useRef<(data: { sdp: RTCSessionDescriptionInit }) => void>(() => {});
  const stableOnAnswer = useRef<(data: { sdp: RTCSessionDescriptionInit }) => void>(() => {});
  const stableOnIce = useRef<(data: { candidate: RTCIceCandidateInit }) => void>(() => {});

  stableOnOffer.current = (data) => handleOffer(data.sdp);
  stableOnAnswer.current = (data) => handleAnswer(data.sdp);
  stableOnIce.current = (data) => handleIceCandidate(data.candidate);

  useEffect(() => {
    if (!socket) return;

    const onOffer = (data: { sdp: RTCSessionDescriptionInit }) => stableOnOffer.current?.(data);
    const onAnswer = (data: { sdp: RTCSessionDescriptionInit }) => stableOnAnswer.current?.(data);
    const onIce = (data: { candidate: RTCIceCandidateInit }) => stableOnIce.current?.(data);

    socket.on('webrtc:offer-forward', onOffer);
    socket.on('webrtc:answer-forward', onAnswer);
    socket.on('webrtc:ice-candidate-forward', onIce);

    return () => {
      socket.off('webrtc:offer-forward', onOffer);
      socket.off('webrtc:answer-forward', onAnswer);
      socket.off('webrtc:ice-candidate-forward', onIce);
    };
  }, [socket]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  return { createOffer };
}
