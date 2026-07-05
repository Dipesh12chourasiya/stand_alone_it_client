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
        console.log('[WebRTC] Sending ICE candidate');
        socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate.toJSON(),
          toRole: remoteRole,
        });
      }
    };

    // When the remote peer adds a track, surface the stream
    pc.ontrack = (event) => {
      console.log(`[WebRTC] ontrack fired — track kind: ${event.track?.kind}, stream count: ${event.streams.length}`);
      const [stream] = event.streams;
      if (stream) {
        console.log('[WebRTC] Remote stream received, forwarding to consumer');
        onRemoteStreamRef.current?.(stream);
      }
    };

    // Track connection state changes
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      setWebRTCState(pc.connectionState as 'connected' | 'failed');

      if (pc.connectionState === 'failed') {
        socket?.emit('webrtc:ice-failure');
      }
    };

    // ICE connection state — catches failures earlier than connectionstate
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.error('[WebRTC] ICE negotiation failed — check STUN/TURN');
        setWebRTCState('failed');
        socket?.emit('webrtc:ice-failure');
      }
    };

    // Add local tracks to the connection
    if (localStream) {
      const tracks = localStream.getTracks();
      console.log(`[WebRTC] Adding ${tracks.length} local track(s) to peer connection`);
      for (const track of tracks) {
        if (track.readyState !== 'ended') {
          console.log(`[WebRTC] Adding track: ${track.kind} (${track.id.slice(0, 8)}...)`);
          pc.addTrack(track, localStream);
        }
      }
    }

    return pc;
  }, [localStream, socket, remoteRole, setWebRTCState]);

  // Stable offer creator — recreates when localStream or socket changes
  const createOffer = useCallback(async () => {
    try {
      console.log('[WebRTC] Creating offer...');
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] Offer created, local description set');

      if (socket?.connected) {
        console.log('[WebRTC] Emitting webrtc:offer');
        socket.emit('webrtc:offer', {
          sdp: pc.localDescription,
          toRole: remoteRole,
        });
      } else {
        console.warn('[WebRTC] Socket not connected — cannot emit offer');
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
        console.log('[WebRTC] Offer received — creating answer');
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log('[WebRTC] Remote description set from offer');

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('[WebRTC] Answer created and set as local description');

        socket?.emit('webrtc:answer', {
          sdp: pc.localDescription,
          toRole: remoteRole,
        });
        console.log('[WebRTC] Answer emitted');

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
      if (!pc) {
        console.warn('[WebRTC] Answer received but no peer connection exists');
        return;
      }

      console.log('[WebRTC] Answer received — setting remote description');
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('[WebRTC] Remote description set from answer');
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

        console.log('[WebRTC] Adding remote ICE candidate');
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

    console.log('[WebRTC] Attaching signaling listeners');

    const onOffer = (data: { sdp: RTCSessionDescriptionInit }) => {
      console.log('[WebRTC] Received webrtc:offer-forward');
      stableOnOffer.current?.(data);
    };
    const onAnswer = (data: { sdp: RTCSessionDescriptionInit }) => {
      console.log('[WebRTC] Received webrtc:answer-forward');
      stableOnAnswer.current?.(data);
    };
    const onIce = (data: { candidate: RTCIceCandidateInit }) => {
      console.log('[WebRTC] Received webrtc:ice-candidate-forward');
      stableOnIce.current?.(data);
    };

    socket.on('webrtc:offer-forward', onOffer);
    socket.on('webrtc:answer-forward', onAnswer);
    socket.on('webrtc:ice-candidate-forward', onIce);

    return () => {
      console.log('[WebRTC] Removing signaling listeners');
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
