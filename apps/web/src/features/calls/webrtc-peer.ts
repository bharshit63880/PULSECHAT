/* eslint-disable no-undef -- WebRTC interfaces are browser-provided TypeScript globals. */
export type WebRtcCallbacks = {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionState: (state: RTCPeerConnectionState) => void;
};

const splitUrls = (value?: string) => value?.split(',').map((url) => url.trim()).filter(Boolean) ?? [];

export class WebRtcPeer {
  private peer: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private seenCandidates = new Set<string>();

  async start(type: 'audio' | 'video', callbacks: WebRtcCallbacks) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) throw new Error('Calling requires a secure, supported browser.');
    this.localStream = await navigator.mediaDevices.getUserMedia(type === 'video' ? { audio: true, video: true } : { audio: true, video: false });
    const stun = splitUrls(import.meta.env.VITE_WEBRTC_STUN_URLS);
    const turn = splitUrls(import.meta.env.VITE_WEBRTC_TURN_URLS);
    this.peer = new RTCPeerConnection({ iceServers: [...(stun.length ? [{ urls: stun }] : []), ...(turn.length ? [{ urls: turn, username: import.meta.env.VITE_WEBRTC_TURN_USERNAME, credential: import.meta.env.VITE_WEBRTC_TURN_CREDENTIAL }] : [])] });
    this.localStream.getTracks().forEach((track) => this.peer?.addTrack(track, this.localStream!));
    this.peer.onicecandidate = ({ candidate }) => candidate && callbacks.onIceCandidate(candidate.toJSON());
    this.peer.ontrack = ({ streams, track }) => callbacks.onRemoteStream(streams[0] ?? new MediaStream([track]));
    this.peer.onconnectionstatechange = () => callbacks.onConnectionState(this.peer?.connectionState ?? 'closed');
    return this.localStream;
  }
  async createOffer() { if (!this.peer) throw new Error('Peer is not ready'); const offer = await this.peer.createOffer(); await this.peer.setLocalDescription(offer); return offer; }
  async createAnswer() { if (!this.peer) throw new Error('Peer is not ready'); const answer = await this.peer.createAnswer(); await this.peer.setLocalDescription(answer); return answer; }
  async setRemoteDescription(description: RTCSessionDescriptionInit) { if (!this.peer) throw new Error('Peer is not ready'); await this.peer.setRemoteDescription(description); for (const candidate of this.pendingCandidates.splice(0)) await this.peer.addIceCandidate(candidate); }
  async addIceCandidate(candidate: RTCIceCandidateInit) { const key = JSON.stringify(candidate); if (!this.peer || this.seenCandidates.has(key)) return; this.seenCandidates.add(key); if (!this.peer.remoteDescription) { this.pendingCandidates.push(candidate); return; } await this.peer.addIceCandidate(candidate); }
  setMuted(muted: boolean) { this.localStream?.getAudioTracks().forEach((track) => { track.enabled = !muted; }); }
  setCameraOff(off: boolean) { this.localStream?.getVideoTracks().forEach((track) => { track.enabled = !off; }); }
  cleanup() { this.localStream?.getTracks().forEach((track) => track.stop()); this.localStream = null; this.peer?.close(); this.peer = null; this.pendingCandidates = []; this.seenCandidates.clear(); }
}
