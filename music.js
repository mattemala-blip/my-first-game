// Original fantasy lo-fi soundtrack, synthesized locally. No audio downloads.
(() => {
  let audio, master, timer, nextBeat = 0, beat = 0;
  let enabled = true;
  const button = document.querySelector('#music-toggle');
  try { enabled = localStorage.getItem('rune-music') !== 'off'; } catch {}
  const notes = [0, 3, 7, 10, 7, 3, 5, 7, 0, 3, 12, 10, 7, 5, 3, 7,
    5, 8, 12, 15, 12, 8, 7, 5, 3, 7, 10, 14, 10, 7, 5, 3];
  const roots = [0, 5, 3, 7];
  const frequency = semitone => 220 * 2 ** (semitone / 12);
  function refreshButton() {
    button.textContent = enabled ? '♫ Music on' : '♫ Music off';
    button.setAttribute('aria-pressed', String(enabled));
  }
  function tone(time, pitch, duration, volume, type = 'sine') {
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency(pitch);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + 0.045);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope); envelope.connect(master);
    oscillator.start(time); oscillator.stop(time + duration + 0.02);
  }
  function percussion(time, kick) {
    if (kick) {
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.frequency.setValueAtTime(105, time);
      oscillator.frequency.exponentialRampToValueAtTime(43, time + 0.16);
      gain.gain.setValueAtTime(0.13, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.23);
      oscillator.connect(gain); gain.connect(master); oscillator.start(time); oscillator.stop(time + 0.25);
    } else {
      const length = Math.floor(audio.sampleRate * 0.11);
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
      source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = 1800; gain.gain.value = 0.045;
      source.connect(filter); filter.connect(gain); gain.connect(master); source.start(time);
    }
  }
  function schedule() {
    if (!audio || audio.state !== 'running' || !enabled || document.hidden) return;
    while (nextBeat < audio.currentTime + 0.18) {
      const step = beat % 64, root = roots[Math.floor(step / 16)];
      if (step % 8 === 0) {
        for (const interval of [0, 3, 7, 10]) tone(nextBeat, root + interval - 12, 2.6, 0.025, 'triangle');
        tone(nextBeat, root - 24, 1.5, 0.09);
      }
      // Slow, spacious pentatonic melody over a swung 72 BPM beat.
      if (step % 2 === 0) {
        const pitch = notes[Math.floor(step / 2)];
        tone(nextBeat, pitch + 12, 1.25, 0.06);
        tone(nextBeat + 0.012, pitch + 24, 0.8, 0.009);
      }
      if (step % 4 === 0) percussion(nextBeat, true);
      if (step % 4 === 2) percussion(nextBeat, false);
      nextBeat += (60 / 72 / 2) * (step % 2 === 0 ? 1.08 : 0.92);
      beat++;
    }
  }
  async function activate() {
    if (!enabled || document.hidden || (audio && audio.state === 'running')) return;
    try {
      if (!audio) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error('Audio unavailable');
        audio = new AudioContext(); master = audio.createGain(); master.gain.value = 0.38;
        // A gentle low-pass keeps the mix warm and unobtrusive.
        const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 3400;
        master.connect(filter); filter.connect(audio.destination);
        timer = setInterval(schedule, 80);
      }
      await audio.resume(); nextBeat = audio.currentTime + 0.06; schedule();
    } catch {
      enabled = false; refreshButton(); button.textContent = '♫ Audio unavailable';
    }
  }
  button.addEventListener('click', async () => {
    enabled = !enabled; refreshButton();
    try { localStorage.setItem('rune-music', enabled ? 'on' : 'off'); } catch {}
    if (enabled) await activate(); else if (audio) await audio.suspend();
  });
  document.querySelector('#start').addEventListener('click', activate);
  document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !event.repeat && !event.target.closest('.characters')) activate();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (audio) audio.suspend(); }
    else if (audio && enabled) activate();
  });
  window.addEventListener('pagehide', () => { clearInterval(timer); if (audio) audio.close(); });
  refreshButton();
})();
