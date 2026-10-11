// Registration happens only after a completed run.
(() => {
  const config = window.leaderboardConfig;
  if (!config?.url || !config?.key) return;

  const board = document.querySelector('#leaderboard');
  const list = document.querySelector('#leaderboard-list');
  const status = document.querySelector('#leaderboard-status');
  const form = document.querySelector('#score-form');
  const message = document.querySelector('#score-message');
  const input = document.querySelector('#player-name');
  const notice = document.querySelector('#rank-notice');
  const save = document.querySelector('#save-score');
  const restart = document.querySelector('#start');
  const card = restart.closest('.card');
  const menuItems = [
    ...card.querySelectorAll('.characters, .mobile-orientation, small')
  ];
  const originalDisplays = menuItems.map(item => item.style.display);

  let run = null;
  let locked = false;
  let busy = false;

  // Put name entry inside the game-over screen.
  card.insertBefore(form, restart);
  form.style.order = '2';
  card.style.maxHeight = '100%';
  card.style.overflowY = 'auto';
  board.hidden = false;
  notice.hidden = true;

  async function rpc(name, body = {}) {
    const response = await fetch(
      `${config.url.replace(/\/$/, '')}/rest/v1/rpc/${name}`,
      {
        method: 'POST',
        headers: {
          apikey: config.key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      }
    );
    if (!response.ok) throw new Error('Leaderboard unavailable');
    return response.json();
  }

  function render(entries) {
    list.replaceChildren();

    entries.forEach(entry => {
      const row = document.createElement('li');
      const name = document.createElement('span');
      const points = document.createElement('strong');

      name.textContent = entry.player_name;
      points.textContent = Number(entry.score).toLocaleString();
      row.append(name, points);
      list.append(row);
    });

    status.textContent = entries.length
      ? ''
      : 'Be the first to set a score!';
  }

  const ordinal = rank =>
    ['1st', '2nd', '3rd', '4th', '5th'][rank - 1];

  function setLocked(value) {
    locked = value;
    restart.disabled = value;
  }

  function showNameForm() {
    form.hidden = false;
    menuItems.forEach(item => {
      item.style.display = 'none';
    });
    input.focus({ preventScroll: true });
  }

  function hideNameForm() {
    form.hidden = true;
    menuItems.forEach((item, index) => {
      item.style.display = originalDisplays[index];
    });
  }

  // Space cannot bypass mandatory registration.
  window.addEventListener('keydown', event => {
    if (!locked || event.code !== 'Space') return;
    if (event.target.closest('input, textarea, form')) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.hidden) input.focus({ preventScroll: true });
  }, true);

  window.addEventListener('quest-start', () => {
    run = {
      id: crypto.randomUUID(),
      finished: false,
      points: 0,
      saved: false
    };

    busy = false;
    input.value = '';
    input.setCustomValidity('');
    save.disabled = false;
    hideNameForm();
    setLocked(false);
    notice.hidden = true;
  });

  window.addEventListener('quest-end', async event => {
    if (!run || run.finished) return;

    const target = run;
    target.finished = true;
    target.points = event.detail.score;
    hideNameForm();

    if (target.points <= 0) return;

    // Prevent restarting while the ranking is being checked.
    setLocked(true);
    restart.textContent = 'Checking rankings…';

    try {
      const entries = await rpc('rune_top_five');
      if (target !== run) return;

      render(entries);

      const rank = 1 + entries.filter(
        entry => entry.score >= target.points
      ).length;

      restart.textContent = 'Restart quest';

      if (rank > 5) {
        setLocked(false);
        return;
      }

      message.textContent =
        `Congrats! You reached the ${ordinal(rank)} highest score ` +
        'across all players! Enter your name and register your score ' +
        'to start a new quest.';

      save.disabled = false;
      showNameForm();
    } catch {
      if (target !== run) return;

      // A ranking-service outage should not trap the player.
      status.textContent =
        'Could not check the leaderboard. You can start another quest.';
      restart.textContent = 'Restart quest';
      setLocked(false);
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!run?.finished || run.saved || busy || form.hidden) return;

    const name = input.value.trim();

    if (!name || /[\x00-\x1f\x7f]/.test(name)) {
      input.setCustomValidity('Please enter a name, not just spaces.');
      input.reportValidity();
      return;
    }

    input.setCustomValidity('');

    const target = run;
    busy = true;
    save.disabled = true;
    message.textContent = 'Registering your score…';

    try {
      const result = await rpc('rune_submit_score', {
        p_name: name,
        p_score: target.points,
        p_run: target.id
      });

      if (target !== run) return;

      render(result.entries);
      target.saved = true;
      hideNameForm();
      setLocked(false);

      status.textContent = result.rank
        ? `Score registered! ${name}, you’re ranked ${ordinal(result.rank)}.`
        : 'Another player just overtook your score. ' +
          'You can start a new quest.';

      document.querySelector('#message').textContent = status.textContent;
      restart.focus({ preventScroll: true });
    } catch {
      if (target !== run) return;

      message.textContent =
        'Could not register your score. Please try again.';
    } finally {
      if (target === run) {
        busy = false;
        save.disabled = false;
      }
    }
  });

  input.addEventListener('input', () => input.setCustomValidity(''));

  async function refresh() {
    const expected = run;

    try {
      const entries = await rpc('rune_top_five');
      if (expected === run && !run?.finished) render(entries);
    } catch {
      if (expected === run && !run?.finished) {
        status.textContent = 'Leaderboard temporarily unavailable.';
      }
    }
  }

  refresh();
  setInterval(() => {
    if (!run?.finished) refresh();
  }, 15000);
})();
