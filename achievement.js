(() => {
  const emblem = `<svg viewBox="0 0 240 130" aria-hidden="true"><ellipse class="bat-oval" cx="120" cy="65" rx="113" ry="56"/><path class="bat-mark" d="M120 111C109 86 94 83 79 94C75 74 57 72 45 82C43 62 26 51 9 40L29 17C36 35 52 39 67 35L78 18C81 38 91 47 105 47L109 25L119 34L131 25L135 47C149 47 159 38 162 18L173 35C188 39 204 35 211 17L231 40C214 51 197 62 195 82C183 72 165 74 161 94C146 83 131 86 120 111Z"/></svg>`;
  const themes = {
    default: ['THE DARK KNIGHT', 'A symbol that endures.', 'Gotham remembers the ones who look closer.'],
    zelda: ['THE ANIMATED SERIES', 'The night has a new detective.', 'Every shadow held a clue. You followed them all.'],
    cyberpunk: ['THE BATMAN', 'You are the answer.', 'Seven clues. No loose ends. The city is listening.'],
    souls: ['GOTHAM / 1990s', 'A legend in the shadows.', 'Beyond the gargoyles and the neon, you found every secret.']
  };
  const notification = document.createElement('button');
  notification.className = 'detective-toast';
  notification.hidden = true;
  notification.setAttribute('aria-label', 'Achievement unlocked: Worlds Greatest Detective. View reward');
  notification.innerHTML = `<span class="detective-badge">${emblem}</span><span class="detective-toast-copy"><small>ACHIEVEMENT UNLOCKED</small><strong>Worlds Greatest Detective</strong><span>7 / 7 discoveries · View reward ↗</span></span>`;
  const dialog = document.createElement('dialog');
  dialog.id = 'detective-dialog';
  dialog.setAttribute('aria-labelledby', 'detective-title');
  dialog.setAttribute('aria-describedby', 'detective-description');
  dialog.innerHTML = `<button class="detective-close" aria-label="Close achievement">×</button><div class="gotham-scene" aria-hidden="true"><div class="gotham-beam"></div><div class="gotham-signal">${emblem}</div><div class="gotham-city"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="gotham-edition"></span></div><div class="detective-content"><div class="detective-kicker"><span>CASE CLOSED</span><span>07 / 07</span></div><h2 id="detective-title">Worlds Greatest<br>Detective</h2><p class="detective-tagline"></p><p id="detective-description">Congratulations! You found all seven Easter eggs and unlocked a secret game.</p><div class="detective-seals" aria-label="All seven worlds discovered"><span>△</span><span>✧</span><span>2077</span><span>✦</span><span>?</span><span>20</span><span>∞</span></div><button class="detective-game">Play the secret game <span>ZELDA · LEVEL 1</span></button><p class="detective-footnote"></p></div>`;
  const reward = document.createElement('button');
  reward.className = 'detective-reopen text-link';
  reward.hidden = true;
  reward.textContent = 'Worlds Greatest Detective · View achievement ↗';
  document.querySelector('#quest-dialog').insertBefore(reward, document.querySelector('#reset-quest'));
  const announce = document.createElement('span');
  announce.className = 'detective-announcement';
  announce.setAttribute('role', 'status');
  document.body.append(notification, dialog, announce);
  let unlocked = false, revealTimer, hideTimer, returnFocus;
  function syncTheme() {
    const [edition, tagline, footnote] = themes[document.body.dataset.world] || themes.default;
    dialog.querySelector('.gotham-edition').textContent = edition;
    dialog.querySelector('.detective-tagline').textContent = tagline;
    dialog.querySelector('.detective-footnote').textContent = footnote;
  }
  function hideToast() { clearTimeout(hideTimer); notification.hidden = true; }
  function scheduleHide() { clearTimeout(hideTimer); hideTimer = setTimeout(() => { if (!notification.matches(':hover, :focus')) hideToast(); }, 14000); }
  function openReward() {
    if (!unlocked) return;
    returnFocus = document.activeElement;
    hideToast();
    const existing = document.querySelector('dialog[open]');
    if (existing) existing.close();
    syncTheme();
    dialog.showModal();
    dialog.querySelector('.detective-close').focus();
  }
  notification.addEventListener('click', openReward);
  notification.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  notification.addEventListener('mouseleave', scheduleHide);
  notification.addEventListener('focus', () => clearTimeout(hideTimer));
  notification.addEventListener('blur', scheduleHide);
  reward.addEventListener('click', openReward);
  dialog.querySelector('.detective-game').addEventListener('click', () => { if (unlocked) window.location.href = 'game.html'; });
  dialog.querySelector('.detective-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (returnFocus === reward || returnFocus === notification) document.querySelector('footer .quest-open').focus();
    else returnFocus?.focus();
  });
  function checkAchievement(initial = false) {
    const complete = found.size === Object.keys(discoveries).length;
    reward.hidden = !complete;
    if (!complete) {
      unlocked = false;
      clearTimeout(revealTimer);
      hideToast();
      announce.textContent = '';
      if (dialog.open) dialog.close();
      try { localStorage.removeItem('vv-detective-achievement'); } catch {}
      return;
    }
    if (unlocked) return;
    unlocked = true;
    let previouslyShown = false;
    try { previouslyShown = localStorage.getItem('vv-detective-achievement') === 'unlocked'; } catch {}
    if (initial && previouslyShown) return;
    // Let the final world's animation finish before delivering the reward.
    revealTimer = setTimeout(() => {
      if (!unlocked) return;
      notification.hidden = false;
      announce.textContent = 'Achievement unlocked: Worlds Greatest Detective. All seven Easter eggs found. View your reward in the achievement notification or side quest log.';
      try { localStorage.setItem('vv-detective-achievement', 'unlocked'); } catch {}
      scheduleHide();
    }, initial ? 800 : 4700);
  }
  document.addEventListener('discoverieschange', () => checkAchievement());
  new MutationObserver(syncTheme).observe(document.body, {attributes: true, attributeFilter: ['data-world']});
  syncTheme();
  checkAchievement(true);
})();
