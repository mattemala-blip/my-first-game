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

  let entries = null;
  let run = null;
  let busy = false;
  board.hidden = false;

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

  function render(data) {
    entries = data;
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

  function consider() {
    if (!run || run.name || entries === null || busy) return;

    const rank =
      1 + entries.filter(entry => entry.score >= run.points).length;

    if (rank > 5 || run.points <= 0) {
      form.hidden = true;
      notice.hidden = true;
      return;
    }

    message.textContent =
      `Congrats! You reached the ${ordinal(rank)} highest score ` +
      'across all players! Enter your name to register it.';

    notice.textContent =
      `Congrats! You’re ranked ${ordinal(rank)} — enter your name ↓`;

    form.hidden = false;
    notice.hidden = false;
    save.disabled = false;
  }

  async function refresh(expectedRun = run) {
    try {
      const data = await rpc('rune_top_five');
      if (expectedRun !== run) return;
      render(data);
      consider();
    } catch {
      status.textContent =
        'Leaderboard temporarily unavailable. Your game can continue.';
    }
  }

  async function submit(name, target) {
    if (busy || target !== run) return;
    busy = true;
    save.disabled = true;
    const points = target.points;

    try {
      const result = await rpc('rune_submit_score', {
        p_name: name,
        p_score: points,
        p_run: target.id
      });

      if (target !== run) return;

      render(result.entries);
      target.name = name;
      form.hidden = true;
      notice.hidden = true;

      status.textContent = result.rank
        ? `Score registered! ${name}, you’re ranked ${ordinal(result.rank)}.`
        : 'Another player just beat this score. ' +
          'It no longer qualifies for the top five.';

      if (target.finished && target.points > points) {
        busy = false;
        await submit(name, target);
      }
    } catch {
      if (target !== run) return;
      message.textContent =
        'Could not register your score. Please try again.';
      input.value = name;
      form.hidden = false;
    } finally {
      if (target === run) {
        busy = false;
        save.disabled = false;
      }
    }
  }

  window.addEventListener('quest-start', () => {
    run = {
      id: crypto.randomUUID(),
      points: 0,
      name: '',
      finished: false
    };
    busy = false;
    input.value = '';
    form.hidden = true;
    notice.hidden = true;
    refresh(run);
  });

  window.addEventListener('quest-progress', event => {
    if (!run) return;
    run.points = event.detail.score;
    consider();
  });

  window.addEventListener('quest-end', async event => {
    if (!run) return;
    const target = run;
    target.points = event.detail.score;
    target.finished = true;

    if (target.name) await submit(target.name, target);
    else await refresh(target);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!run || busy) return;

    const name = input.value.trim();
    if (!name) {
      input.setCustomValidity('Please enter your name.');
      input.reportValidity();
      return;
    }

    input.setCustomValidity('');
    submit(name, run);
  });

  input.addEventListener('input', () => input.setCustomValidity(''));

  refresh();

  setInterval(() => {
    if (run && !run.finished && !busy) refresh(run);
  }, 15000);
})();
