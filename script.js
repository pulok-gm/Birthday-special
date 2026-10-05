(() => {
  const C = window.CONTENT;
  const $ = (s) => document.querySelector(s);
  const PASTEL = ["#ffafcc", "#ffc8dd", "#cdb4db", "#bde0fe", "#a2d2ff", "#fdffb6", "#caffbf"];

  /* ---------- Fill in personal text ---------- */
  document.title = `Happy Birthday, ${C.name}! 💖`;
  document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = C.name));
  $("#intro-hint").textContent = C.introHint;
  $("#finale-text").textContent = C.finale;
  $("#from-name").textContent = C.fromName;
  $("#signature").textContent = `— ${C.fromName} 💕`;

  /* ---------- Confetti helpers ---------- */
  const fire = (opts) => window.confetti && window.confetti({ colors: PASTEL, ...opts });

  function burst(opts = {}) {
    fire({ particleCount: 140, spread: 100, startVelocity: 45, origin: { y: 0.6 }, scalar: 1.1, ...opts });
  }
  function heartBurst(origin = { y: 0.5 }) {
    if (!window.confetti || !confetti.shapeFromText) return;
    const shapes = ["💖", "💕", "🎉"].map((text) => confetti.shapeFromText({ text, scalar: 2.2 }));
    confetti({ shapes, scalar: 2.2, particleCount: 30, spread: 140, startVelocity: 35, origin });
  }
  function bigCelebration() {
    const end = Date.now() + 2000;
    (function frame() {
      fire({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0, y: 0.75 } });
      fire({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.75 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    setTimeout(() => heartBurst(), 300);
  }

  /* ---------- Floating background ---------- */
  const floaties = $("#floaties");
  const EMOJIS = ["💖", "🎈", "✨", "🌸", "💕", "⭐", "🫧", "🎀", "🍰", "💗"];
  const count = window.innerWidth < 600 ? 14 : 24;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "floatie";
    s.textContent = EMOJIS[i % EMOJIS.length];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 16 + Math.random() * 22 + "px";
    const dur = 14 + Math.random() * 16;
    s.style.animationDuration = dur + "s";
    s.style.animationDelay = -Math.random() * dur + "s";
    floaties.appendChild(s);
  }

  /* ---------- Wavy title ---------- */
  const wave = $("#wave-title");
  const waveText = wave.textContent;
  wave.setAttribute("aria-label", waveText);
  wave.textContent = "";
  [...waveText].forEach((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch === " " ? "\u00A0" : ch;
    s.style.animationDelay = i * 0.08 + "s";
    s.setAttribute("aria-hidden", "true");
    wave.appendChild(s);
  });

  /* ---------- Music ---------- */
  // Plays assets/music.mp3 if present, otherwise the built-in music-box "Happy Birthday".
  const S = window.SFX;
  const audio = $("#bg-music");
  const musicBtn = $("#music-btn");
  const FILE_VOL = 0.6;
  audio.volume = FILE_VOL;
  let useFile = true;
  let soundOn = true;

  const setMusicUI = (on) => {
    musicBtn.textContent = on ? "🎵" : "🔇";
    musicBtn.classList.toggle("playing", on);
  };
  function playMusic() {
    if (useFile) {
      audio.play().then(() => setMusicUI(true)).catch(() => {
        useFile = false; // no mp3 (or blocked) → synth fallback
        S.music.start();
        setMusicUI(true);
      });
    } else {
      S.music.start();
      setMusicUI(true);
    }
  }
  function restartMusic() {
    if (!soundOn) return;
    if (useFile) { audio.currentTime = 0; audio.play().catch(() => {}); }
    else S.music.restart();
  }
  function duckMusic(on) {
    S.duck(on);
    audio.volume = on ? 0.08 : FILE_VOL;
  }
  musicBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    S.setMuted(!soundOn);
    if (soundOn) playMusic();
    else { audio.pause(); S.music.stop(); setMusicUI(false); }
  });

  /* ---------- 1. Gift intro ---------- */
  const intro = $("#intro");
  const main = $("#main");
  const gift = $("#gift-btn");
  let opened = false;
  gift.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    S.unlock(); // user gesture: browsers allow audio now
    S.pop();
    audio.play().then(() => audio.pause()).catch(() => {}); // unlock file audio on iOS
    setTimeout(playMusic, 1200);
    gift.classList.add("opening");
    setTimeout(() => burst({ origin: { y: 0.55 }, particleCount: 200, spread: 130 }), 250);
    setTimeout(() => heartBurst({ y: 0.55 }), 500);
    setTimeout(() => {
      intro.classList.add("fade-out");
      main.hidden = false;
      document.body.classList.remove("locked");
      requestAnimationFrame(() => main.classList.add("show"));
      musicBtn.hidden = false;
    }, 1100);
    setTimeout(() => intro.remove(), 2100);
  });

  /* ---------- 2. Cake & candles ---------- */
  const cake = $("#cake");
  const candlesEl = $("#candles");
  const micBtn = $("#mic-btn");
  const instruction = $("#cake-instruction");
  const wishMsg = $("#wish-msg");
  const scrollCue = $("#scroll-cue");
  let lit = 0;

  function buildCandles() {
    candlesEl.innerHTML = "";
    const n = Math.max(1, Math.min(C.candles, 12));
    for (let i = 0; i < n; i++) {
      const b = document.createElement("button");
      b.className = "candle-btn";
      b.setAttribute("aria-label", `Blow out candle ${i + 1}`);
      b.innerHTML = `<div class="candle"><span class="flame"></span><span class="smoke"></span><span class="smoke"></span></div>`;
      b.addEventListener("click", () => blowOut(b));
      candlesEl.appendChild(b);
    }
    lit = n;
  }

  function blowOut(btn) {
    if (btn.classList.contains("out")) return;
    btn.classList.add("out");
    btn.setAttribute("aria-label", "Candle blown out");
    S.whoosh();
    lit--;
    if (lit === 0) setTimeout(celebrate, 450);
  }

  function celebrate() {
    stopMic();
    instruction.textContent = "Make sure that wish was a good one 🤭";
    wishMsg.textContent = C.wishText;
    wishMsg.hidden = false;
    $("#cake-controls").hidden = true;
    scrollCue.hidden = false;
    cake.classList.remove("celebrate");
    void cake.offsetWidth;
    cake.classList.add("celebrate");
    bigCelebration();
    S.yay();
    setTimeout(restartMusic, 1800); // song starts over after the wish 🎶
  }

  function relight() {
    buildCandles();
    S.sparkle();
    instruction.textContent = "Make another wish & blow again 🕯️";
    wishMsg.hidden = true;
    $("#cake-controls").hidden = false;
    $("#cake-section").scrollIntoView({ behavior: "smooth" });
  }

  /* Mic blowing detection */
  let micStream = null, audioCtx = null, rafId = null;
  const MIC_LABEL = micBtn.textContent;

  async function startMic() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
    } catch (e) {
      micBtn.textContent = "🙈 Mic not available. Tap the flames instead!";
      micBtn.disabled = true;
      return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    audioCtx.createMediaStreamSource(micStream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    let frames = 0, baseline = 0, hot = 0, last = 0;
    micBtn.textContent = "🌬️ Blow now! (listening…)";
    micBtn.classList.add("listening");
    duckMusic(true); // quieter music so the mic doesn't hear it

    const loop = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      const bins = 48; // low frequencies, where a blow is loudest
      for (let i = 1; i < bins; i++) sum += data[i];
      const level = sum / (bins - 1);

      if (frames < 30) {
        baseline = Math.max(baseline, level); // calibrate ambient noise for ~0.5s
        frames++;
      } else {
        const threshold = Math.max(baseline + 30, 70);
        cake.classList.toggle("windy", level > threshold * 0.65);
        if (level > threshold) {
          hot++;
          const now = performance.now();
          if (hot > 3 && now - last > 220) {
            const litOnes = [...candlesEl.querySelectorAll(".candle-btn:not(.out)")];
            if (litOnes.length) blowOut(litOnes[Math.floor(Math.random() * litOnes.length)]);
            last = now;
          }
        } else hot = 0;
      }
      rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  function stopMic() {
    cancelAnimationFrame(rafId);
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    micStream = audioCtx = null;
    cake.classList.remove("windy");
    micBtn.classList.remove("listening");
    duckMusic(false);
    if (!micBtn.disabled) micBtn.textContent = MIC_LABEL;
  }

  micBtn.addEventListener("click", () => (micStream ? stopMic() : startMic()));
  buildCandles();

  /* ---------- 3. Letter ---------- */
  const envelope = $("#envelope");
  const letterCard = $("#letter-card");
  const letterText = $("#letter-text");
  const cursor = $("#cursor");
  const signature = $("#signature");
  const skipHint = $("#skip-hint");
  const fullLetter = C.letter.trim();
  let typing = false, skip = false;

  envelope.addEventListener("click", () => {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    S.paper();
    $("#env-hint").hidden = true;
    setTimeout(() => envelope.classList.add("gone"), 650);
    setTimeout(() => {
      envelope.hidden = true;
      letterCard.classList.add("show");
      heartBurst({ y: 0.4 });
      typeLetter();
    }, 1150);
  });

  function typeLetter() {
    typing = true;
    let i = 0;
    const step = () => {
      if (skip) i = fullLetter.length;
      else i++;
      letterText.textContent = fullLetter.slice(0, i);
      if (i >= fullLetter.length) return finishLetter();
      const ch = fullLetter[i - 1];
      if (ch === "\n") { if (fullLetter[i] === "\n") S.ding(); }
      else if (!skip) S.key(ch);
      let delay = 32;
      if (".!?".includes(ch)) delay = 420;
      else if (ch === ",") delay = 180;
      else if (ch === "\n") delay = 220;
      setTimeout(step, delay);
    };
    step();
  }
  function finishLetter() {
    typing = false;
    signature.classList.add("show");
    skipHint.hidden = true;
    setTimeout(() => (cursor.hidden = true), 2500);
  }
  letterCard.addEventListener("click", () => { if (typing) skip = true; });

  /* ---------- 4. Reasons flip cards ---------- */
  const grid = $("#reasons-grid");
  const CARD_COLORS = ["#ffc8dd", "#bde0fe", "#cdb4db", "#fdffb6", "#caffbf", "#ffd6a5"];
  C.reasons.forEach((r, i) => {
    const card = document.createElement("button");
    card.className = "card reveal";
    card.style.setProperty("--i", i);
    card.style.setProperty("--c", CARD_COLORS[i % CARD_COLORS.length]);
    card.setAttribute("aria-label", `Reason number ${i + 1}`);

    const inner = document.createElement("div");
    inner.className = "card-inner";
    const front = document.createElement("div");
    front.className = "card-face card-front";
    front.innerHTML = `<span class="card-emoji"></span><span class="card-num"></span><span class="card-hint">tap me</span>`;
    front.querySelector(".card-emoji").textContent = r.emoji;
    front.querySelector(".card-num").textContent = `#${i + 1}`;
    const back = document.createElement("div");
    back.className = "card-face card-back";
    back.textContent = r.text;

    inner.append(front, back);
    card.appendChild(inner);
    card.addEventListener("click", () => {
      const first = !card.dataset.seen;
      card.classList.toggle("flipped");
      S.flip();
      if (first) {
        card.dataset.seen = "1";
        const rect = card.getBoundingClientRect();
        burst({
          particleCount: 40, spread: 70, startVelocity: 25, scalar: 0.8,
          origin: { x: (rect.left + rect.width / 2) / innerWidth, y: (rect.top + rect.height / 2) / innerHeight },
        });
      }
    });
    grid.appendChild(card);
  });

  /* ---------- 5. Timeline ---------- */
  const timeline = $("#timeline");
  C.timeline.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "tl-item reveal";
    li.innerHTML = `
      <div class="polaroid" style="--r:${i % 2 ? 3 : -3}deg">
        <img loading="lazy" />
        <p class="polaroid-cap"></p>
      </div>
      <span class="tl-date"></span>
      <h3></h3>
      <p class="tl-text"></p>`;
    const img = li.querySelector("img");
    img.src = t.photo;
    img.alt = t.title;
    img.addEventListener("error", () => {
      const ph = document.createElement("div");
      ph.className = "photo-placeholder";
      ph.innerHTML = `📷<small></small>`;
      ph.querySelector("small").textContent = `add ${t.photo.split("/").pop()}`;
      img.replaceWith(ph);
    });
    li.querySelector(".polaroid-cap").textContent = t.caption || "";
    li.querySelector(".tl-date").textContent = t.date;
    li.querySelector("h3").textContent = t.title;
    li.querySelector(".tl-text").textContent = t.text;
    timeline.appendChild(li);
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Finale ---------- */
  $("#confetti-btn").addEventListener("click", () => { bigCelebration(); S.yay(); });
  $("#replay-btn").addEventListener("click", relight);

  /* ---------- Sparkle trail (desktop) ---------- */
  if (matchMedia("(pointer: fine)").matches) {
    let lastSpark = 0;
    const SPARKS = ["✨", "💖", "⭐", "💕"];
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastSpark < 45) return;
      lastSpark = now;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)];
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    });
  }
})();
