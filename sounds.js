// Quiet original jump sounds, independent of the music player.
(() => {
  const pools = {};
  for (const hero of ['wizard','elf','warrior','accountant']) {
    pools[hero] = Array.from({length:2}, () => {
      const sound = new Audio(`assets/sounds/${hero}.wav?v=3`);
      sound.volume = 0.35;
      sound.preload = 'auto';
      return sound;
    });
  }
  let voice = 0;
  window.playJumpSound = (hero, variant) => {
    // The Warrior's eighth move is a flip rather than a sword hack.
    if (hero === 'warrior' && variant === 7) return;
    const sound = pools[hero]?.[voice++ % 2];
    if (!sound || document.hidden) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) Object.values(pools).flat().forEach(sound => sound.pause());
  });
})();
