import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';

type Props = { call: { peer: { name: string; avatarUrl?: string | null }; direction: 'incoming' | 'outgoing'; phase: string; type: string } | null; remoteStream: MediaStream | null; muted: boolean; onAccept: () => void; onEnd: () => void; onMute: (muted: boolean) => void };
export const CallOverlay = ({ call, remoteStream, muted, onAccept, onEnd, onMute }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null); const [playBlocked, setPlayBlocked] = useState(false);
  useEffect(() => { const audio = audioRef.current; if (!audio) return; audio.srcObject = remoteStream; if (remoteStream) void audio.play().catch(() => setPlayBlocked(true)); return () => { audio.srcObject = null; }; }, [remoteStream]);
  if (!call) return null;
  const incoming = call.direction === 'incoming' && call.phase === 'incoming-ringing'; const connected = call.phase === 'connected';
  return <div role="dialog" aria-modal="true" aria-label="Voice call" className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"><audio ref={audioRef} autoPlay />
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 text-center text-white shadow-float">
      <div className="mx-auto w-fit scale-[1.65]"><Avatar src={call.peer.avatarUrl} alt={call.peer.name} /></div><h2 className="mt-7 text-xl font-semibold">{call.peer.name}</h2><p className="mt-2 text-sm text-slate-300">{incoming ? 'Incoming voice call' : connected ? 'Connected' : 'Calling…'}</p>
      {playBlocked ? <Button variant="secondary" className="mt-4" onClick={() => void audioRef.current?.play().then(() => setPlayBlocked(false))}>Tap to enable audio</Button> : null}
      <div className="mt-7 flex justify-center gap-3">{incoming ? <Button aria-label="Accept voice call" onClick={onAccept} className="h-12 rounded-full bg-emerald-500 px-5"><Phone className="mr-2 h-4 w-4" />Accept</Button> : null}{connected ? <Button aria-label={muted ? 'Unmute microphone' : 'Mute microphone'} variant="secondary" onClick={() => onMute(!muted)} className="h-12 w-12 rounded-full p-0">{muted ? <MicOff /> : <Mic />}</Button> : null}<Button aria-label={incoming ? 'Reject voice call' : 'End voice call'} onClick={onEnd} className="h-12 rounded-full bg-rose-500 px-5"><PhoneOff className="mr-2 h-4 w-4" />{incoming ? 'Reject' : 'End'}</Button></div>
    </div></div>;
};
