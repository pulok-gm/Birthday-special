/* =========================================================
   🔊 Sounds: all generated live with the Web Audio API.
   - Music-box "Happy Birthday" waltz (used if assets/music.mp3 is missing)
   - Cute sound effects: gift pop, candle whoosh, party horn, flips…
   ========================================================= */
window.SFX = (() => {
  let ctx, master, sfxBus, musicBus, noiseBuf;
  let muted = false;
  const MUSIC_VOL = 0.38;

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.8;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = MUSIC_VOL;
      musicBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  const ok = () => ctx && !muted;
  const now = () => ctx.currentTime;

  /* ---------- building blocks ---------- */
  function tone({ freq, type = "sine", at = now(), dur = 0.3, vol = 0.3, slideTo, attack = 0.005, bus = sfxBus }) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(bus);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  function noise({ at = now(), dur = 0.3, vol = 0.3, type = "bandpass", f1 = 1000, f2 = f1, q = 1 }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f1, at);
    f.frequency.exponentialRampToValueAtTime(f2, at + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f).connect(g).connect(sfxBus);
    src.start(at, Math.random() * 0.5);
    src.stop(at + dur + 0.05);
  }

  // Music-box style bell
  function chime(freq, at = now(), vol = 0.2, dur = 1.1, bus = sfxBus) {
    tone({ freq, at, vol, dur, bus });
    tone({ freq: freq * 2, at, vol: vol * 0.35, dur: dur * 0.6, bus });
    tone({ freq: freq * 3, at, vol: vol * 0.12, dur: dur * 0.35, bus });
  }

  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = (n) => {
    const midi = 12 * (parseInt(n.slice(-1)) + 1) + NOTE[n[0]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  /* ---------- sound effects ---------- */
  function pop() {
    if (!ok()) return;
    noise({ dur: 0.1, vol: 0.5, type: "highpass", f1: 1200 });
    tone({ freq: 220, slideTo: 1100, type: "triangle", dur: 0.18, vol: 0.35 });
    ["C5", "E5", "G5", "C6"].forEach((n, i) => chime(hz(n), now() + 0.15 + i * 0.09, 0.18));
  }

  // Soft breath of air: slow fade-in, low filtered noise, no clicks
  let lastWhoosh = 0;
  function whoosh() {
    if (!ok()) return;
    const t = now();
    if (t - lastWhoosh < 0.15) return; // don't stack when many candles go out together
    lastWhoosh = t;
    const dur = 0.75;
    const layers = [
      { type: "bandpass", q: 0.6, f: [450, 1100, 380], vol: 0.32 },
      { type: "lowpass", q: 0.3, f: [300, 700, 250], vol: 0.22 },
    ];
    layers.forEach(({ type, q, f, vol }) => {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.Q.value = q;
      filt.frequency.setValueAtTime(f[0], t);
      filt.frequency.linearRampToValueAtTime(f[1], t + 0.18);
      filt.frequency.exponentialRampToValueAtTime(f[2], t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.12);       // gentle swell
      g.gain.setTargetAtTime(0, t + 0.22, 0.16);           // smooth fade
      src.connect(filt).connect(g).connect(sfxBus);
      src.start(t, Math.random() * 0.5);
      src.stop(t + dur + 0.3);
    });
  }

  // Warm, slowly swelling chord
  function pad(freq, at, vol, dur) {
    [-6, 6].forEach((detune) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.detune.value = detune;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + 0.5);
      g.gain.setTargetAtTime(0, at + dur * 0.45, dur * 0.25);
      o.connect(g).connect(sfxBus);
      o.start(at);
      o.stop(at + dur + 0.5);
    });
  }

  // Magical, gentle celebration: soft harp run over a warm chord
  function yay() {
    if (!ok()) return;
    const t = now();
    ["C4", "E4", "G4", "C5"].forEach((n) => pad(hz(n), t, 0.045, 3));
    ["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6", "G6", "C7"].forEach((n, i) =>
      chime(hz(n), t + 0.1 + i * 0.07, 0.07 - i * 0.004, 1.4)
    );
    ["E6", "G6", "C7"].forEach((n, i) => chime(hz(n), t + 1.0 + i * 0.12, 0.04, 1.8));
  }

  function flip() {
    if (!ok()) return;
    tone({ freq: 380, slideTo: 900, type: "triangle", dur: 0.14, vol: 0.18 });
    chime(1320, now() + 0.1, 0.08, 0.5);
  }

  function paper() {
    if (!ok()) return;
    noise({ dur: 0.22, vol: 0.22, type: "highpass", f1: 2500, f2: 4500 });
    noise({ at: now() + 0.25, dur: 0.3, vol: 0.18, type: "bandpass", f1: 3000, f2: 1500, q: 0.6 });
  }

  // Soft keyboard / typewriter click
  function key(ch = "a") {
    if (!ok()) return;
    const t = now();
    const isSpace = ch === " ";
    const v = 0.8 + Math.random() * 0.4; // each press slightly different

    // the "click": tiny burst of filtered noise
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = isSpace ? 1800 : 2800 + Math.random() * 1600;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime((isSpace ? 0.22 : 0.28) * v, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (isSpace ? 0.06 : 0.035));
    src.connect(f).connect(g).connect(sfxBus);
    src.start(t, Math.random() * 0.8);
    src.stop(t + 0.08);

    // the "thock": small body resonance
    tone({ freq: (isSpace ? 110 : 160) + Math.random() * 40, type: "sine", at: t, dur: isSpace ? 0.07 : 0.045, vol: 0.12 * v, attack: 0.002 });
  }

  // Gentle typewriter bell for new paragraphs
  function ding() {
    if (!ok()) return;
    chime(hz("A6"), now(), 0.05, 0.9);
  }

  function sparkle() {
    if (!ok()) return;
    ["E6", "G6", "C6", "E6"].forEach((n, i) => chime(hz(n.slice(0, -1) + (i === 3 ? 7 : 6)) / 2, now() + i * 0.07, 0.1, 0.7));
  }

  /* ---------- Music box "Happy Birthday" waltz ---------- */
  const BEAT = 0.52; // seconds per beat
  const LOOP = 27;   // beats per loop (incl. a breath at the end)
  // [beat, note, lengthInBeats]
  const MELODY = [
    [0, "G4", .75], [.75, "G4", .25], [1, "A4", 1], [2, "G4", 1], [3, "C5", 1], [4, "B4", 2],
    [6, "G4", .75], [6.75, "G4", .25], [7, "A4", 1], [8, "G4", 1], [9, "D5", 1], [10, "C5", 2],
    [12, "G4", .75], [12.75, "G4", .25], [13, "G5", 1], [14, "E5", 1], [15, "C5", 1], [16, "B4", 1], [17, "A4", 1],
    [18, "F5", .75], [18.75, "F5", .25], [19, "E5", 1], [20, "C5", 1], [21, "D5", 1], [22, "C5", 3],
  ];
  // oom-pah-pah: [barStartBeat, root, chord tones]
  const BASS = [
    [1, "C3", ["E3", "G3"]], [4, "G2", ["B2", "F3"]], [7, "G2", ["B2", "F3"]], [10, "C3", ["E3", "G3"]],
    [13, "C3", ["E3", "G3"]], [16, "F2", ["A2", "C3"]], [19, "C3", ["E3", "G3"]], [22, "C3", ["E3", "G3"]],
    [25, "G2", ["B2", "D3"]],
  ];

  let session = null, loopTimer = null, playing = false;

  function scheduleLoop(t0) {
    if (!session) return;
    const bus = session;
    MELODY.forEach(([b, n, len]) => chime(hz(n), t0 + b * BEAT, 0.22, len * BEAT + 0.8, bus));
    BASS.forEach(([b, root, chord]) => {
      const t = t0 + b * BEAT;
      tone({ freq: hz(root), type: "triangle", at: t, dur: BEAT * 1.4, vol: 0.2, attack: 0.01, bus });
      [1, 2].forEach((k) => chord.forEach((n) =>
        tone({ freq: hz(n), at: t + k * BEAT, dur: BEAT * 0.6, vol: 0.06, attack: 0.01, bus })
      ));
    });
    const next = t0 + LOOP * BEAT;
    loopTimer = setTimeout(() => scheduleLoop(next), (next - now() - 0.4) * 1000);
  }

  const music = {
    start() {
      unlock();
      if (!ctx || playing) return;
      playing = true;
      session = ctx.createGain();
      session.gain.value = 1;
      session.connect(musicBus);
      scheduleLoop(now() + 0.15);
    },
    stop() {
      if (!playing) return;
      playing = false;
      clearTimeout(loopTimer);
      const s = session;
      session = null;
      s.gain.setTargetAtTime(0, now(), 0.08);
      setTimeout(() => s.disconnect(), 600);
    },
    restart() {
      music.stop();
      setTimeout(() => music.start(), 450);
    },
    get playing() { return playing; },
  };

  function duck(on) {
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(on ? 0.06 : MUSIC_VOL, now(), 0.2);
  }

  function setMuted(m) {
    muted = m;
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, now(), 0.05);
  }

  return { unlock, pop, whoosh, yay, flip, paper, key, ding, sparkle, music, duck, setMuted };
})();
