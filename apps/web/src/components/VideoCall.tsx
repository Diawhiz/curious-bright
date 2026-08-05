import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTrackToggle,
  useLocalParticipant,
  useTracks,
  useParticipants,
  useIsSpeaking,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface VideoCallProps {
  roomId: string;
  token: string;
  onLeave: () => void;
  onPiP?: () => void;
  compact?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   AVATAR PLACEHOLDER — shown when cam is off
───────────────────────────────────────────────────────────────────────────── */
function AvatarPlaceholder({ name, isLocal }: { name: string; isLocal: boolean }) {
  const letter = (name || '?')[0]?.toUpperCase();
  return (
    <div className="vc-avatar">
      <div className={`vc-avatar-letter ${isLocal ? 'local' : 'remote'}`}>
        {letter}
      </div>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.04em' }}>
        Camera off
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SPEAKING RING — animated teal border when participant is speaking
───────────────────────────────────────────────────────────────────────────── */
function SpeakingRing({ participant }: { participant: any }) {
  const isSpeaking = useIsSpeaking(participant);
  if (!isSpeaking) return null;
  return <div className="vc-speaking-ring" />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARTICIPANT CARD
───────────────────────────────────────────────────────────────────────────── */
function ParticipantCard({
  trackRef,
  compact,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  compact?: boolean;
}) {
  const p = trackRef.participant;
  const isLocal = p.isLocal;
  const isPlaceholder = !trackRef.publication;
  const displayName = p.name || p.identity || 'Co-author';

  return (
    <div className="vc-tile" style={{ borderRadius: compact ? '6px 0 6px 6px' : '10px 0 10px 10px' }}>
      {/* Video feed or avatar */}
      {isPlaceholder ? (
        <AvatarPlaceholder name={displayName} isLocal={isLocal} />
      ) : (
        <VideoTrack
          trackRef={trackRef as any}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Animated speaking border */}
      <SpeakingRing participant={p} />

      {/* Name label */}
      <div
        className="vc-name-label"
        style={{
          bottom: compact ? 5 : 10,
          left: compact ? 5 : 10,
          fontSize: compact ? '0.57rem' : '0.7rem',
          padding: compact ? '2px 6px' : '3px 10px',
        }}
      >
        {isLocal && (
          <span
            className="vc-name-online-dot"
            style={{ width: compact ? 5 : 6, height: compact ? 5 : 6 }}
          />
        )}
        {isLocal ? 'You' : displayName}
      </div>

      {/* YOU corner badge — full layout only */}
      {isLocal && !compact && (
        <div className="vc-you-badge">YOU</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTROL BUTTON — uses .vc-ctrl-btn CSS class
───────────────────────────────────────────────────────────────────────────── */
function ControlBtn({
  icon,
  label,
  onClick,
  active = true,
  pending = false,
  title,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  pending?: boolean;
  title?: string;
}) {
  return (
    <button
      className={`vc-ctrl-btn${!active ? ' muted' : ''}`}
      onClick={onClick}
      title={title || label}
      disabled={pending}
    >
      <i className={`bx ${icon}`} />
      <span>{pending ? '…' : label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEAVE BUTTON — uses .vc-leave-btn CSS class
───────────────────────────────────────────────────────────────────────────── */
function LeaveButton({ onLeave }: { onLeave: () => void }) {
  return (
    <button className="vc-leave-btn" onClick={onLeave}>
      <i className="bx bx-phone-off" style={{ fontSize: '1.05rem' }} />
      Leave Call
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   INNER CALL UI — rendered inside LiveKitRoom context
───────────────────────────────────────────────────────────────────────────── */
function CallInner({
  onLeave,
  onPiP,
  compact,
}: {
  onLeave: () => void;
  onPiP?: () => void;
  compact?: boolean;
}) {
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const participants = useParticipants();

  const { toggle: toggleMic, pending: micPending } = useTrackToggle({
    source: Track.Source.Microphone,
  });
  const { toggle: toggleCam, pending: camPending } = useTrackToggle({
    source: Track.Source.Camera,
  });

  const trackRefs = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  /* ── COMPACT / PIP layout ─────────────────────────────────────── */
  if (compact) {
    return (
      <div className="video-call-shell">
        <RoomAudioRenderer />

        {/* Mini participant grid */}
        <div
          className="vc-grid"
          style={{
            gridTemplateColumns: trackRefs.length > 1 ? '1fr 1fr' : '1fr',
            padding: 2,
            gap: 2,
          }}
        >
          {trackRefs.slice(0, 4).map(ref => (
            <ParticipantCard
              key={ref.participant.sid + (ref.source ?? '')}
              trackRef={ref}
              compact
            />
          ))}
        </div>

        {/* Mini controls — icon-only */}
        <div className="vc-controls" style={{ padding: '4px 6px', gap: 5 }}>
          <button
            className={`vc-ctrl-btn${!isMicrophoneEnabled ? ' muted' : ''}`}
            onClick={() => toggleMic()}
            disabled={micPending}
            title={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
            style={{ minWidth: 'unset', padding: '4px 9px', flexDirection: 'row', gap: 4 }}
          >
            <i className={`bx ${isMicrophoneEnabled ? 'bx-microphone' : 'bx-microphone-off'}`} style={{ fontSize: '0.85rem' }} />
          </button>
          <button
            className={`vc-ctrl-btn${!isCameraEnabled ? ' muted' : ''}`}
            onClick={() => toggleCam()}
            disabled={camPending}
            title={isCameraEnabled ? 'Camera Off' : 'Camera On'}
            style={{ minWidth: 'unset', padding: '4px 9px', flexDirection: 'row', gap: 4 }}
          >
            <i className={`bx ${isCameraEnabled ? 'bx-video' : 'bx-video-off'}`} style={{ fontSize: '0.85rem' }} />
          </button>
        </div>
      </div>
    );
  }

  /* ── FULL layout ──────────────────────────────────────────────── */
  const count = trackRefs.length;
  const gridCols = count <= 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 2 : 3;

  return (
    <div className="video-call-shell">
      <RoomAudioRenderer />

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="vc-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="vc-live-badge">
            <span className="vc-live-dot" />
            LIVE
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 500 }}>
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        {onPiP && (
          <button className="vc-pip-btn" onClick={onPiP} title="Float as overlay while using whiteboard">
            <i className="bx bx-windows" style={{ fontSize: '0.9rem' }} />
            Float on Whiteboard
          </button>
        )}
      </div>

      {/* ── PARTICIPANT GRID ─────────────────────────────────────── */}
      <div
        className="vc-grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridAutoRows: count <= 2 ? '1fr' : 'auto',
        }}
      >
        {trackRefs.map(ref => (
          <ParticipantCard
            key={ref.participant.sid + (ref.source ?? '')}
            trackRef={ref}
          />
        ))}

        {/* Empty / waiting state */}
        {trackRefs.length === 0 && (
          <div className="vc-waiting">
            <div className="vc-waiting-icon">
              <i className="bx bx-group" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Waiting for co-authors to join…</span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)' }}>Share the room link so others can connect</span>
          </div>
        )}
      </div>

      {/* ── CONTROLS BAR ─────────────────────────────────────────── */}
      <div className="vc-controls">
        {/* Microphone */}
        <ControlBtn
          icon={isMicrophoneEnabled ? 'bx-microphone' : 'bx-microphone-off'}
          label={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
          onClick={() => toggleMic()}
          active={isMicrophoneEnabled}
          pending={micPending}
          title={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
        />

        {/* Camera */}
        <ControlBtn
          icon={isCameraEnabled ? 'bx-video' : 'bx-video-off'}
          label={isCameraEnabled ? 'Camera Off' : 'Camera On'}
          onClick={() => toggleCam()}
          active={isCameraEnabled}
          pending={camPending}
          title={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
        />

        <div className="vc-controls-divider" />

        <LeaveButton onLeave={onLeave} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT EXPORT — wraps with LiveKitRoom provider
───────────────────────────────────────────────────────────────────────────── */
export function VideoCall({ roomId: _roomId, token, onLeave, onPiP, compact }: VideoCallProps) {
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880';

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      style={{ height: '100%', width: '100%' }}
      onDisconnected={onLeave}
    >
      <CallInner onLeave={onLeave} onPiP={onPiP} compact={compact} />
    </LiveKitRoom>
  );
}
