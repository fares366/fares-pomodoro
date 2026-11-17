// Pleasant bell/chime generated with the Web Audio API (no audio files).

let ctx = null;

function getContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

// Browsers block audio until a user gesture — call this from a click handler
// (we call it when the timer starts) so the chime can play later.
export function unlockAudio() {
  const c = getContext();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function playChime() {
  const c = getContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});

  const now = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.28;
  master.connect(c.destination);

  // Rising E major arpeggio: E5, G#5, B5, E6
  const notes = [
    { freq: 659.25, at: 0 },
    { freq: 830.61, at: 0.2 },
    { freq: 987.77, at: 0.4 },
    { freq: 1318.51, at: 0.65 },
  ];
  // Slightly inharmonic partials give it a bell-like timbre.
  const partials = [
    { mult: 1, amp: 1 },
    { mult: 2.76, amp: 0.25 },
    { mult: 5.4, amp: 0.08 },
  ];

  notes.forEach(({ freq, at }) => {
    partials.forEach(({ mult, amp }) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const start = now + at;
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(amp, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 1.9);
    });
  });
}
