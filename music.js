// Original rendered fantasy lo-fi loop. Native audio provides simple playback
// and recovery on browsers that suspend sound until the next user gesture.
(() => {
  const button = document.querySelector('#music-toggle');
  const audio = new Audio('assets/fantasy-lofi.mp3?v=1');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.35;
  let enabled = true;
  let started = false;
  let starting = false;
  // Each visit starts with music enabled; an explicit mute lasts this visit.
  function label(waiting = false) {
    button.textContent = enabled ? (waiting ? '♫ Tap to play music' : '♫ Music on') : '♫ Music off';
    button.setAttribute('aria-pressed', String(enabled));
  }
  async function play() {
    if (!enabled || document.hidden || starting || !audio.paused) return;
    started = true;
    starting = true;
    try {
      if (audio.error) audio.load();
      await audio.play();
      label();
    } catch {
      // Keep the preference enabled and retry on the next click/tap.
      label(true);
    } finally { starting = false; }
  }
  button.addEventListener('click', () => {
    if (enabled && audio.paused) { play(); return; }
    enabled = !enabled;
    label();
    if (enabled) play(); else audio.pause();
  });
  document.querySelector('#start').addEventListener('click', play);
  document.querySelector('#world').addEventListener('pointerdown', play);
  document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !event.repeat && !event.target.closest('.characters')) play();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.pause();
    else if (started) play();
  });
  window.addEventListener('pagehide', () => audio.pause());
  window.addEventListener('pageshow', () => { if (started) play(); });
  audio.addEventListener('error', () => label(true));
  label();
})();
