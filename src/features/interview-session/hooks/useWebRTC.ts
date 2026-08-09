import { useRef, useEffect, useCallback } from 'react';
import { type Socket } from 'socket.io-client';
import { useSessionStore } from '../store/session.store';

/**
 * Shape of the forwarded signaling payloads coming from the server.
 * The server always includes `fromRole` even though the client used to ignore it.
 */
interface ForwardedSignal {
  sdp: RTCSessionDescriptionInit;
  fromRole?: string;
  timestamp?: number;
}

interface ForwardedIceSignal {
  candidate: RTCIceCandidateInit;
  fromRole?: string;
  timestamp?: number;
}

interface UseWebRTCOptions {
  socket: Socket | null;
  localStream: MediaStream | null;
  role: 'phone' | 'recruiter' | 'candidate';
  /**
   * The role of the peer we are signaling TO.
   * Incoming offers/answers/ICE are only handled when `fromRole` === remoteRole.
   */
  remoteRole: 'phone' | 'recruiter' | 'candidate';
  onRemoteStream?: (stream: MediaStream) => void;
}

/**
 * WebRTC peer connection manager.
 *
 * Creates a RTCPeerConnection, negotiates via Socket.IO signaling,
 * and bridges local → remote media streams.
 *
 * The phone creates the offer, the recruiter answers.
 * Media NEVER passes through the Node.js server — Socket.IO is signaling only.
 *
 * Signaling is role-aware: every forwarded event carries `fromRole`, and we
 * only act on events whose `fromRole` matches `remoteRole`. This lets the
 * recruiter run one peer connection per flow (phone vs candidate) without
 * the two flows fighting over a single PC.
 *
 * ICE candidates that arrive before a connection exists (or before
 * `setRemoteDescription`) are queued and flushed once the remote description
 * is applied — prevents dropped candidates on slower signaling paths.
 */
export function useWebRTC({
  socket,
  localStream,
  role,
  remoteRole,
  onRemoteStream,
}: UseWebRTCOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const { setWebRTCState } = useSessionStore();

  // Stored refs for stable callback references
  const onRemoteStreamRef = useRef(onRemoteStream);
  onRemoteStreamRef.current = onRemoteStream;

  // Logger prefix so phone / recruiter / candidate logs are distinguishable
  const tag = { phone: '[WebRTC][PHONE]', recruiter: '[WebRTC][RECRUITER]', candidate: '[WebRTC][CANDIDATE]' }[role];

  // ICE servers: STUN (always) + TURN (from env vars, required for cross-network)
  const ICE_SERVERS: RTCConfiguration = (() => {
    const servers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];

    const turnUrl = import.meta.env.VITE_TURN_URL;
    if (turnUrl) {
      const turnServer: RTCIceServer = { urls: [turnUrl] };
      const user = import.meta.env.VITE_TURN_USERNAME;
      const cred = import.meta.env.VITE_TURN_CREDENTIAL;
      if (user && cred) {
        turnServer.username = user;
        turnServer.credential = cred;
      }
      servers.push(turnServer);
      console.log(`${tag} TURN server configured:`, turnUrl);
    } else {
      console.warn(`${tag} No TURN server configured — cross-network ICE may fail`);
    }

    return { iceServers: servers };
  })();

  // ICE candidates that arrive before we can safely call addIceCandidate
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  /**
   * Apply every queued ICE candidate now that `remoteDescription` is set.
   */
  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) return;

    const pending = pendingCandidatesRef.current.splice(0);
    if (pending.length === 0) return;

    console.log(`${tag} Flushing ${pending.length} queued ICE candidate(s)`);
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
        console.log(`${tag} Added queued ICE candidate`);
      } catch (err) {
        console.warn(`${tag} Failed to add queued ICE candidate:`, err);
      }
    }
  }, [tag]);

  // Create the peer connection — stable identity via useRef tracking
  const createPeerConnection = useCallback(() => {
    // Close existing connection before creating a new one
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Drop any stale queued candidates on a fresh connection
    pendingCandidatesRef.current = [];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Forward ICE candidates through signaling with type classification
    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        const c = event.candidate;
        const type = c.type || 'unknown';
        const transport = c.protocol || 'unknown';
        const addr = c.address || 'unknown';
        console.log(
          `${tag} ICE candidate — type:${type} protocol:${transport} ` +
          `address:${addr}:${c.port}`
        );
        if (type === 'relay') {
          console.log(`${tag} ✅ Relay candidate gathered — TURN is reachable`);
        } else if (type === 'srflx') {
          console.log(`${tag} 🔄 srflx candidate (STUN OK, but may fail across NATs without relay)`);
        }
        socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate.toJSON(),
          toRole: remoteRole,
        });
      }
    };

    // When the remote peer adds a track, surface the stream
    pc.ontrack = (event) => {
      console.log(`${tag} ontrack fired — track kind: ${event.track?.kind}, stream count: ${event.streams.length}`);
      const [stream] = event.streams;
      if (stream) {
        console.log(`${tag} Remote stream received (tracks: ${stream.getTracks().map((t) => t.kind).join(',')}) — forwarding to consumer`);
        onRemoteStreamRef.current?.(stream);
      }
    };

    // Track connection state changes
    // RTCPeerConnection.connectionState can be: new|connecting|connected|disconnected|failed|closed
    pc.onconnectionstatechange = () => {
      console.log(`${tag} Connection state:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setWebRTCState('connected');
      } else if (pc.connectionState === 'failed') {
        setWebRTCState('failed');
        socket?.emit('webrtc:ice-failure');
      }
    };

    // ICE connection state — catches failures earlier than connectionstate
    pc.oniceconnectionstatechange = () => {
      console.log(`${tag} ICE connection state:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected') {
        console.log(`${tag} ✅ ICE negotiation succeeded — media path established`);
      } else if (pc.iceConnectionState === 'failed') {
        console.error(`${tag} ❌ ICE negotiation failed — no common candidate pair`);
        console.error(`${tag}    Likely cause: both peers behind restrictive NATs with no TURN relay`);
        setWebRTCState('failed');
        socket?.emit('webrtc:ice-failure');
      }
    };

    // Add local tracks to the connection
    if (localStream) {
      const tracks = localStream.getTracks();
      console.log(`${tag} Adding ${tracks.length} local track(s) to peer connection`);
      console.log(
        `${tag} Local stream tracks:`,
        tracks.map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
        })),
      );
      for (const track of tracks) {
        if (track.readyState !== 'ended') {
          console.log(`${tag} Adding track: ${track.kind} (${track.id.slice(0, 8)}...)`);
          pc.addTrack(track, localStream);
        }
      }
    } else {
      console.log(`${tag} No local stream — this peer sends no media (one-way receive)`);
    }

    // Log the peer senders after tracks are added (proves media is outbound)
    console.log(
      `${tag} Peer senders:`,
      pc.getSenders().map((sender) => ({
        kind: sender.track?.kind,
        id: sender.track?.id,
        readyState: sender.track?.readyState,
      })),
    );

    return pc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, socket, remoteRole, setWebRTCState]);

  // Stable offer creator — recreates when localStream or socket changes
  const createOffer = useCallback(async () => {
    try {
      console.log(`${tag} Creating offer...`);
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(
        `${tag} Offer created — m= sections: ${(offer.sdp?.match(/^m=/gm) ?? []).join(' ') || '(none!)'}`,
      );

      if (socket?.connected) {
        console.log(`${tag} Emitting webrtc:offer`);
        socket.emit('webrtc:offer', {
          sdp: pc.localDescription,
          toRole: remoteRole,
        });
      } else {
        console.warn(`${tag} Socket not connected — cannot emit offer`);
      }

      setWebRTCState('offering');
    } catch (err) {
      console.error(`${tag} Failed to create offer:`, err);
      setWebRTCState('failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPeerConnection, socket, remoteRole, setWebRTCState, tag]);

  // Answerer: handle an incoming offer from the remote peer, create answer
  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit, fromRole?: string) => {
      // If we already have a remote description, this is a duplicate/renegotiation
      // offer — ignore it to avoid churning the peer connection.
      if (pcRef.current?.remoteDescription) {
        console.warn(`${tag} Ignoring duplicate offer from ${fromRole ?? 'peer'} — connection already negotiated`);
        return;
      }

      try {
        console.log(`${tag} Offer received${fromRole ? ` from role \`${fromRole}\`` : ''} — creating answer`);
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`${tag} Remote description set from offer`);

        // Apply any ICE candidates that raced ahead of the offer
        await flushPendingCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`${tag} Answer created and set as local description`);

        socket?.emit('webrtc:answer', {
          sdp: pc.localDescription,
          toRole: remoteRole,
        });
        console.log(`${tag} Answer emitted`);

        setWebRTCState('answering');
      } catch (err) {
        console.error(`${tag} Failed to handle offer:`, err);
        setWebRTCState('failed');
      }
    },
    [createPeerConnection, flushPendingCandidates, socket, remoteRole, setWebRTCState, tag],
  );

  // Offerer: handle incoming answer
  const handleAnswer = useCallback(
    async (sdp: RTCSessionDescriptionInit, fromRole?: string) => {
      const pc = pcRef.current;
      if (!pc) {
        console.warn(`${tag} Answer received but no peer connection exists`);
        return;
      }

      try {
        console.log(`${tag} Answer received${fromRole ? ` from \`${fromRole}\`` : ''} — setting remote description`);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`${tag} Remote description set from answer`);

        // flush any candidates that arrived before we could set the remote description
        await flushPendingCandidates();

        setWebRTCState('connected');
      } catch (err) {
        console.error(`${tag} Failed to handle answer:`, err);
        setWebRTCState('failed');
      }
    },
    [flushPendingCandidates, setWebRTCState, tag],
  );

  // Handle an incoming ICE candidate — queue it if we can't apply it yet
  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!candidate) return;
      const pc = pcRef.current;

      // No connection yet — queue for when the offer/answer creates it
      if (!pc) {
        console.log(`${tag} ICE candidate queued (no peer connection yet)`);
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      // No remote description yet → applying now would throw InvalidStateError
      if (!pc.remoteDescription) {
        console.log(`${tag} ICE candidate queued (remote description pending)`);
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(candidate);
        console.log(`${tag} Added remote ICE candidate`);
      } catch (err) {
        console.error(`${tag} Failed to add ICE candidate:`, err);
      }
    },
    [tag],
  );

  // Listen for signaling events — stable listener refs prevent re-attach loops
  const stableOnOffer = useRef<(data: ForwardedSignal) => void>(() => {});
  const stableOnAnswer = useRef<(data: ForwardedSignal) => void>(() => {});
  const stableOnIce = useRef<(data: ForwardedIceSignal) => void>(() => {});

  stableOnOffer.current = (data) => handleOffer(data.sdp, data.fromRole);
  stableOnAnswer.current = (data) => handleAnswer(data.sdp, data.fromRole);
  stableOnIce.current = (data) => handleIceCandidate(data.candidate);

  useEffect(() => {
    if (!socket) return;

    console.log(`${tag} Attaching signaling listeners (expecting peer role: ${remoteRole})`);

    const onOffer = (data: ForwardedSignal) => {
      // Only answer offers coming from our intended remote role
      if (data.fromRole && data.fromRole !== remoteRole) {
        console.log(`${tag} Ignoring offer from \`${data.fromRole}\` (expecting \`${remoteRole}\`)`);
        return;
      }
      console.log(`${tag} Received webrtc:offer-forward${data.fromRole ? ` from \`${data.fromRole}\`` : ''}`);
      stableOnOffer.current?.(data);
    };
    const onAnswer = (data: ForwardedSignal) => {
      if (data.fromRole && data.fromRole !== remoteRole) {
        console.log(`${tag} Ignoring answer from \`${data.fromRole}\` (expecting \`${remoteRole}\`)`);
        return;
      }
      console.log(`${tag} Received webrtc:answer-forward${data.fromRole ? ` from \`${data.fromRole}\`` : ''}`);
      stableOnAnswer.current?.(data);
    };
    const onIce = (data: ForwardedIceSignal) => {
      if (data.fromRole && data.fromRole !== remoteRole) {
        console.log(`${tag} Ignoring ICE candidate from \`${data.fromRole}\` (expecting \`${remoteRole}\`)`);
        return;
      }
      console.log(`${tag} Received webrtc:ice-candidate-forward${data.fromRole ? ` from \`${data.fromRole}\`` : ''}`);
      stableOnIce.current?.(data);
    };

    socket.on('webrtc:offer-forward', onOffer);
    socket.on('webrtc:answer-forward', onAnswer);
    socket.on('webrtc:ice-candidate-forward', onIce);

    return () => {
      console.log(`${tag} Removing signaling listeners`);
      socket.off('webrtc:offer-forward', onOffer);
      socket.off('webrtc:answer-forward', onAnswer);
      socket.off('webrtc:ice-candidate-forward', onIce);
    };
  }, [socket, remoteRole, tag]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pcRef.current) {
        console.log(`${tag} Closing peer connection`);
        pcRef.current.close();
        pcRef.current = null;
      }
      pendingCandidatesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { createOffer };
}