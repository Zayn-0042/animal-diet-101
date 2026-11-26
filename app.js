/* Animal Diet 101 — game logic */
'use strict';

(() => {
  const { DIETS, FOODS, OMNI_DISTRACTORS, ANIMALS, DICTIONARY, VIDEOS, STUDY_NOTES, QUIZ } = window.DIET_DATA;

  // ───────── helpers ─────────
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const el = (tag, props = {}, html = '') => {
    const node = Object.assign(document.createElement(tag), props);
    if (html) node.innerHTML = html;
    return node;
  };
  const joinList = (items) =>
    items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
  const foodList = (animal) => joinList(animal.eats.map((k) => FOODS[k].n.toLowerCase()));
  const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
  const dietWord = (diet) => DIETS[diet].label.toLowerCase();
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────── saved progress ─────────
  const STORE_KEY = 'animal-diet-101';
  const fresh = () => ({
    best: { sort: 0, feed: 0, quiz: 0 },
    bestStreak: 0,
    seen: [],
    badges: [],
    notes: [],
    sound: true,
    animPaused: false,
  });
  let save = fresh();
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    save = {
      ...save,
      ...stored,
      best: { ...save.best, ...stored.best },
      notes: Array.isArray(stored.notes) ? stored.notes : [],
    };
  } catch { /* storage unavailable: play without saving */ }
  const persist = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch { /* ignore */ }
  };

  // ───────── announcements & toast ─────────
  const live = $('#live');
  const announce = (msg) => {
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 60);
  };
  let toastTimer;
  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    announce(msg);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  };

  // ───────── sound (Web Audio, no files) ─────────
  let actx;
  const tone = (freq, at, dur, type = 'sine', vol = 0.14) => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  };
  const sfx = (kind) => {
    if (!save.sound) return;
    try {
      actx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime;
      if (kind === 'good') { tone(660, t, 0.12, 'triangle'); tone(990, t + 0.09, 0.2, 'triangle'); }
      if (kind === 'bad') { tone(220, t, 0.18, 'square', 0.06); tone(165, t + 0.15, 0.25, 'square', 0.06); }
      if (kind === 'tick') tone(880, t, 0.05, 'sine', 0.08);
      if (kind === 'pop') tone(520, t, 0.08, 'triangle', 0.1);
      if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.25, 'triangle'));
    } catch { /* audio unsupported */ }
  };
  const soundBtn = $('#sound-toggle');
  const renderSound = () => {
    soundBtn.setAttribute('aria-pressed', String(save.sound));
    soundBtn.firstElementChild.textContent = save.sound ? '🔊' : '🔇';
  };
  soundBtn.addEventListener('click', () => {
    save.sound = !save.sound;
    persist();
    renderSound();
    sfx('pop');
  });

  // ───────── homepage animation toggle (WCAG 2.2.2) ─────────
  const motionBtn = $('#motion-toggle');
  const renderMotion = () => {
    document.body.classList.toggle('animations-paused', save.animPaused);
    motionBtn.textContent = save.animPaused ? '▶ Play animations' : '⏸ Pause animations';
  };
  motionBtn.addEventListener('click', () => {
    save.animPaused = !save.animPaused;
    persist();
    renderMotion();
    announce(save.animPaused ? 'Homepage animations paused.' : 'Homepage animations playing.');
  });

  // ───────── trophies ─────────
  const BADGES = [
    { id: 'explorer', icon: '🔍', name: 'Explorer', desc: 'Discover 10 animals', test: () => save.seen.length >= 10 },
    { id: 'zoologist', icon: '🎓', name: 'Zoologist', desc: `Discover all ${ANIMALS.length} animals`, test: () => save.seen.length >= ANIMALS.length },
    { id: 'sorter', icon: '⚡', name: 'Speedy Sorter', desc: 'Score 150+ in Sort It!', test: () => save.best.sort >= 150 },
    { id: 'streak', icon: '🔥', name: 'Hot Streak', desc: 'Sort 10 in a row', test: () => save.bestStreak >= 10 },
    { id: 'feeder', icon: '🍽️', name: 'Master Feeder', desc: 'Feed 10/10 animals', test: () => save.best.feed >= 10 },
    { id: 'whiz', icon: '🧠', name: 'Quiz Whiz', desc: 'Score 10/10 in the quiz', test: () => save.best.quiz >= 10 },
  ];
  const checkBadges = () => {
    const earned = BADGES.filter((b) => !save.badges.includes(b.id) && b.test());
    if (earned.length) {
      save.badges.push(...earned.map((b) => b.id));
      persist();
    }
    return earned;
  };

  // ───────── home ─────────
  const renderStatic = () => {
    $('#animal-total').textContent = ANIMALS.length;
    $('#diet-cards').replaceChildren(...Object.entries(DIETS).map(([key, d]) => {
      const count = ANIMALS.filter((a) => a.diet === key).length;
      return el('article', { className: `diet-card ${key}` }, `
        <h3><span class="icon" aria-hidden="true">${d.icon}</span> ${d.label}</h3>
        <p>${d.blurb}</p>
        <p class="teeth">🦷 ${d.teeth}</p>
        <p class="examples" aria-hidden="true">${d.examples}</p>
        <p class="teeth">${count} ${d.label.toLowerCase()}s to discover</p>`);
    }));
    $('#dictionary').replaceChildren(...DICTIONARY.map(([icon, term, def]) =>
      el('div', {}, `<dt><span aria-hidden="true">${icon}</span> ${term}</dt><dd>${def}</dd>`)));
    $('#study-notes').replaceChildren(...STUDY_NOTES.map((s) =>
      el('article', { className: `study-card tag-${s.tag}` }, `
        <h3><span aria-hidden="true">${s.icon}</span> ${s.title}</h3>
        <ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>`)));
  };

  const renderHome = () => {
    $('#best-learn').textContent = `🔍 ${save.seen.length}/${ANIMALS.length} discovered`;
    $('#best-sort').textContent = save.best.sort ? `🏆 Best: ${save.best.sort} pts` : '🆕 Not played yet';
    $('#best-feed').textContent = save.best.feed ? `🏆 Best: ${save.best.feed}/10` : '🆕 Not played yet';
    $('#best-quiz').textContent = save.best.quiz ? `🏆 Best: ${save.best.quiz}/10` : '🆕 Not played yet';
    const nc = save.notes.length;
    $('#best-notes').textContent = nc ? `📒 ${nc} saved ${nc === 1 ? 'note' : 'notes'}` : '✍️ Start your notebook';
    $('#badges').replaceChildren(...BADGES.map((b) => {
      const got = save.badges.includes(b.id);
      return el('li', { className: `badge${got ? ' earned' : ''}` }, `
        <span class="b-icon" aria-hidden="true">${b.icon}</span>
        <span class="b-name">${b.name}</span>
        <span class="b-desc">${b.desc}</span>
        <span class="visually-hidden">${got ? '(earned)' : '(locked)'}</span>`);
    }));
  };

  // ───────── encyclopedia ─────────
  let filter = 'all';
  let query = '';
  const renderGrid = () => {
    const list = ANIMALS.filter((a) =>
      (filter === 'all' || a.diet === filter) && a.name.toLowerCase().includes(query));
    $('#animal-grid').replaceChildren(...list.map((a) => {
      const seen = save.seen.includes(a.id);
      const btn = el('button', { type: 'button', className: `animal-card diet-${a.diet}` }, `
        <span class="ac-emoji" aria-hidden="true">${a.emoji}</span>
        <span class="ac-name">${a.name}</span>
        <span class="diet-badge diet-${a.diet}">${DIETS[a.diet].label}</span>
        ${seen ? '<span class="ac-seen" aria-hidden="true">✓</span><span class="visually-hidden">(discovered)</span>' : ''}`);
      btn.dataset.id = a.id;
      return el('li').appendChild(btn).parentNode;
    }));
    $('#no-results').hidden = list.length > 0;
    $('#seen-count').textContent = `Discovered ${save.seen.length} / ${ANIMALS.length}`;
  };

  $$('.filters .chip').forEach((chip) => chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    $$('.filters .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    renderGrid();
  }));
  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  const animalDialog = $('#animal-dialog');
  let pendingBadges = [];
  let activeAnimal = null;
  $('#animal-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.animal-card');
    if (!btn) return;
    const a = ANIMALS.find((x) => x.id === btn.dataset.id);
    activeAnimal = a;
    $('#ad-emoji').textContent = a.emoji;
    $('#ad-title').textContent = a.name;
    const badge = $('#ad-diet');
    badge.className = `diet-badge diet-${a.diet}`;
    badge.textContent = `${DIETS[a.diet].icon} ${DIETS[a.diet].label}`;
    $('#ad-special').textContent = a.special;
    $('#ad-eats').replaceChildren(...a.eats.map((k) =>
      el('li', {}, `<span aria-hidden="true">${FOODS[k].e}</span>${FOODS[k].n}`)));
    $('#ad-fact').textContent = `💡 ${a.fact}`;
    const art = article(a.name);
    const blurb = DIETS[a.diet].blurb;
    $('#ad-note').textContent = `${art[0].toUpperCase()}${art.slice(1)} ${a.name.toLowerCase()} is ${article(dietWord(a.diet))} ${dietWord(a.diet)} — it ${blurb[0].toLowerCase()}${blurb.slice(1)}`;
    const saveBtn = $('#ad-save-note');
    saveBtn.disabled = false;
    saveBtn.textContent = '📝 Save to Notes';
    animalDialog.showModal();
    sfx('pop');
    if (!save.seen.includes(a.id)) {
      save.seen.push(a.id);
      persist();
      pendingBadges.push(...checkBadges());
    }
  });
  $('#ad-save-note').addEventListener('click', () => {
    if (!activeAnimal) return;
    const a = activeAnimal;
    const added = addQuickNote(
      `${a.emoji} ${a.name} (${DIETS[a.diet].label})`,
      a.diet,
      `Menu: ${foodList(a)}.\nFun fact: ${a.fact}`
    );
    const saveBtn = $('#ad-save-note');
    saveBtn.textContent = added ? '✅ Saved to Notes' : '📌 Already in Notes';
    saveBtn.disabled = true;
    sfx('good');
  });
  animalDialog.addEventListener('close', () => {
    renderGrid();
    if (pendingBadges.length) {
      sfx('win');
      toast(`🏅 New trophy: ${pendingBadges.map((b) => `${b.icon} ${b.name}`).join(', ')}!`);
      pendingBadges = [];
    }
  });

  // Light-dismiss fallback where <dialog closedby> is not supported
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, d) => {
      const r = d.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const d of $$('dialog[closedby="any"]')) {
      let pressedOutside = false;
      d.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, d); });
      d.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, d)) d.close(); });
    }
  }

  // ───────── results ─────────
  const STAR_RULES = { sort: [60, 150, 250], feed: [5, 8, 10], quiz: [5, 8, 10] };
  const TITLES = ['Nice try!', 'Good job!', 'Great work!', 'Amazing — diet expert!'];
  const resultDialog = $('#result-dialog');
  let lastMode = null;

  const endGame = (mode, score, scoreText, detail) => {
    stopGames();
    const prev = save.best[mode];
    const isBest = score > prev;
    if (isBest) save.best[mode] = score;
    persist();
    const stars = STAR_RULES[mode].filter((min) => score >= min).length;
    const newBadges = checkBadges();

    $('#rd-stars').innerHTML = [0, 1, 2].map((i) => `<span class="${i < stars ? 'on' : 'off'}">⭐</span>`).join('');
    $('#rd-title').textContent = TITLES[stars];
    $('#rd-score').textContent = scoreText;
    $('#rd-detail').textContent = `${detail} You earned ${stars} of 3 stars.`;
    $('#rd-best').textContent = isBest && prev > 0 ? '🎉 New best score!' : `🏆 Best: ${save.best[mode]}${mode === 'sort' ? ' pts' : '/10'}`;
    const rb = $('#rd-badge');
    rb.hidden = !newBadges.length;
    rb.textContent = newBadges.length ? `🏅 New trophy: ${newBadges.map((b) => `${b.icon} ${b.name}`).join(', ')}` : '';
    lastMode = mode;
    sfx('win');
    resultDialog.showModal();
  };

  resultDialog.addEventListener('close', () => {
    const choice = resultDialog.returnValue;
    resultDialog.returnValue = '';
    if (choice === 'again') startGame(lastMode);
    else if (choice === 'home') location.hash = 'home';
    else resetPanels();
  });

  // ───────── Sort It! ─────────
  const SORT_TIME = 60;
  const sort = { score: 0, streak: 0, time: 0, timer: null, next: null, queue: [], current: null, locked: true, right: 0, total: 0 };
  const sortCard = $('#sort-card');

  const sortHud = () => {
    $('#sort-score').textContent = sort.score;
    $('#sort-streak').textContent = sort.streak;
    $('#sort-time').textContent = sort.time;
    const bar = $('#sort-timebar');
    bar.style.transform = `scaleX(${sort.time / SORT_TIME})`;
    bar.classList.toggle('low', sort.time <= 10);
  };

  const sortFeedback = (msg, kind = '') => {
    const f = $('#sort-feedback');
    f.textContent = msg;
    f.className = `feedback ${kind}`;
  };

  const nextSort = () => {
    if (!sort.queue.length) sort.queue = shuffle(ANIMALS);
    sort.current = sort.queue.pop();
    $('#sort-emoji').textContent = sort.current.emoji;
    $('#sort-name').textContent = sort.current.name;
    sortCard.style.transition = 'none'; // jump straight back to the centre
    sortCard.classList.remove('dropped', 'enter');
    sortCard.style.translate = '';
    void sortCard.offsetWidth; // apply instantly + restart entry animation
    sortCard.style.transition = '';
    sortCard.classList.add('enter');
    $$('.bin').forEach((b) => b.classList.remove('flash-good', 'flash-bad', 'flash-hint'));
    sort.locked = false;
  };

  const startSort = () => {
    Object.assign(sort, { score: 0, streak: 0, time: SORT_TIME, queue: shuffle(ANIMALS), right: 0, total: 0 });
    sortFeedback('Where does this animal belong?');
    sortHud();
    nextSort();
    sort.timer = setInterval(() => {
      sort.time -= 1;
      sortHud();
      if (sort.time > 0 && sort.time <= 5) sfx('tick');
      if (sort.time <= 0) {
        endGame('sort', sort.score, `${sort.score} points`,
          `You sorted ${sort.right} of ${sort.total} animals correctly.`);
      }
    }, 1000);
  };

  const answerSort = (diet) => {
    if (sort.locked || !sort.timer) return;
    sort.locked = true;
    sort.total += 1;
    const a = sort.current;
    const ok = a.diet === diet;
    const bin = $(`.bin[data-diet="${diet}"]`);
    if (ok) {
      sort.streak += 1;
      sort.right += 1;
      const pts = 10 + Math.min(sort.streak - 1, 5) * 2;
      sort.score += pts;
      save.bestStreak = Math.max(save.bestStreak, sort.streak);
      bin.classList.add('flash-good');
      sortFeedback(`✅ Yes! The ${a.name.toLowerCase()} is ${article(dietWord(diet))} ${dietWord(diet)}. +${pts}${sort.streak >= 3 ? ` 🔥×${sort.streak}` : ''}`, 'good');
      sfx('good');
    } else {
      sort.streak = 0;
      bin.classList.add('flash-bad');
      $(`.bin[data-diet="${a.diet}"]`).classList.add('flash-hint');
      sortFeedback(`❌ Oops! The ${a.name.toLowerCase()} is ${article(dietWord(a.diet))} ${dietWord(a.diet)} — it eats ${foodList(a)}.`, 'bad');
      sfx('bad');
    }
    sortCard.classList.add('dropped');
    sortHud();
    sort.next = setTimeout(() => { if (sort.timer) nextSort(); }, ok ? 550 : 1800);
  };

  $$('.bin').forEach((bin) => bin.addEventListener('click', () => answerSort(bin.dataset.diet)));

  // Drag the animal card onto a bin (pointer events work for mouse, touch and pen)
  let drag = null;
  const binAt = (x, y) => $$('.bin').find((b) => {
    const r = b.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }) ?? null;
  const endDrag = () => {
    drag?.over?.classList.remove('over');
    drag = null;
    sortCard.classList.remove('dragging');
  };
  sortCard.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || sort.locked) return;
    drag = { x: e.clientX, y: e.clientY, moved: false, over: null };
    sortCard.setPointerCapture(e.pointerId);
  });
  sortCard.addEventListener('pointermove', (e) => {
    if (!drag || !sortCard.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    sortCard.classList.add('dragging');
    sortCard.style.translate = `${dx}px ${dy}px`;
    const over = binAt(e.clientX, e.clientY);
    if (over !== drag.over) {
      drag.over?.classList.remove('over');
      over?.classList.add('over');
      drag.over = over;
    }
  });
  sortCard.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const target = drag.moved ? binAt(e.clientX, e.clientY) : null;
    endDrag();
    if (target) answerSort(target.dataset.diet);
    else sortCard.style.translate = ''; // snap back
  });
  sortCard.addEventListener('lostpointercapture', () => {
    if (drag) { endDrag(); sortCard.style.translate = ''; }
  });

  document.addEventListener('keydown', (e) => {
    if (current !== 'sort' || !sort.timer || document.querySelector('dialog[open]')) return;
    if (e.target.matches('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    const diet = { 1: 'herbivore', 2: 'carnivore', 3: 'omnivore' }[e.key];
    if (diet) { e.preventDefault(); answerSort(diet); }
  });

  // ───────── Feed Me! ─────────
  const ROUNDS = 10;
  const BUBBLES = ["I'm hungry!", 'Feed me, please!', "What's for dinner?", 'My tummy is rumbling!', 'Snack time?', 'Yum… what have you got?'];
  const feed = { round: 0, score: 0, animals: [], current: null };

  const distractorsFor = (a) => {
    const eats = new Set(a.eats);
    let pool;
    if (a.diet === 'herbivore') pool = Object.keys(FOODS).filter((k) => FOODS[k].type === 'animal');
    else if (a.diet === 'carnivore') pool = Object.keys(FOODS).filter((k) => FOODS[k].type === 'plant');
    else pool = OMNI_DISTRACTORS;
    return shuffle(pool.filter((k) => !eats.has(k))).slice(0, 3);
  };

  const nextFeed = () => {
    if (feed.round >= ROUNDS) {
      endGame('feed', feed.score, `${feed.score} / ${ROUNDS} fed`,
        feed.score === ROUNDS ? 'Every animal is full and happy!' : 'Keep exploring the encyclopedia to learn more menus.');
      return;
    }
    const a = feed.animals[feed.round];
    feed.current = a;
    feed.round += 1;
    $('#feed-round').textContent = feed.round;
    $('#feed-score').textContent = feed.score;
    $('#feed-emoji').textContent = a.emoji;
    $('#feed-name').textContent = a.name;
    $('#feed-bubble').textContent = pick(BUBBLES);
    $('.feed-animal').classList.remove('happy');
    const correct = pick(a.eats);
    const options = shuffle([correct, ...distractorsFor(a)]);
    $('#food-grid').replaceChildren(...options.map((k) => {
      const b = el('button', { type: 'button', className: 'food-btn' },
        `<span class="f-emoji" aria-hidden="true">${FOODS[k].e}</span><span>${FOODS[k].n}</span><span class="mark" aria-hidden="true"></span>`);
      b.dataset.food = k;
      return b;
    }));
    $('#feed-explain').hidden = true;
    announce(`Round ${feed.round}. Feed the ${a.name.toLowerCase()}.`);
  };

  $('#food-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.food-btn');
    if (!btn || btn.disabled) return;
    const a = feed.current;
    const ok = a.eats.includes(btn.dataset.food);
    $$('.food-btn').forEach((b) => {
      const right = a.eats.includes(b.dataset.food);
      b.disabled = true;
      if (right) { b.classList.add('correct'); b.querySelector('.mark').textContent = '✅'; }
      else if (b === btn) { b.classList.add('wrong'); b.querySelector('.mark').textContent = '❌'; }
      else b.classList.add('dim');
    });
    if (ok) {
      feed.score += 1;
      $('#feed-score').textContent = feed.score;
      $('.feed-animal').classList.add('happy');
      $('#feed-bubble').textContent = 'Yum yum! 😋';
      sfx('good');
    } else {
      $('#feed-bubble').textContent = 'Yuck! 🤢';
      sfx('bad');
    }
    const ex = $('#feed-explain');
    ex.className = `explain ${ok ? 'good' : 'bad'}`;
    $('#feed-explain-text').textContent =
      `${ok ? 'Correct!' : `Not quite — the ${a.name.toLowerCase()} doesn\u2019t eat ${FOODS[btn.dataset.food].n.toLowerCase()}.`} ` +
      `The ${a.name.toLowerCase()} is ${article(dietWord(a.diet))} ${dietWord(a.diet)} and eats ${foodList(a)}. 💡 ${a.fact}`;
    ex.hidden = false;
    $('#feed-next').textContent = feed.round >= ROUNDS ? 'See my results ➜' : 'Next animal ➜';
    if (e.detail === 0) $('#feed-next').focus();
  });
  $('#feed-next').addEventListener('click', (e) => {
    nextFeed();
    if (e.detail === 0) $('.food-btn')?.focus();
  });

  const startFeed = () => {
    // Humans eat almost everything, so they'd make unfair Feed Me rounds
    const pool = ANIMALS.filter((a) => a.id !== 'human');
    Object.assign(feed, { round: 0, score: 0, animals: shuffle(pool).slice(0, ROUNDS) });
    nextFeed();
  };

  // ───────── Quiz (with video clues + WebVTT captions) ─────────
  const quiz = { idx: 0, score: 0, questions: [], current: null };
  const quizVideo = $('#quiz-video');
  let trackBlobUrl = null;

  const fmtVttTime = (sec) => {
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    return `00:${m}:${s}.000`;
  };

  const loadQuizVideo = (videoKey) => {
    const v = VIDEOS[videoKey] || VIDEOS['herbivore-meadow'];
    if (trackBlobUrl) URL.revokeObjectURL(trackBlobUrl);
    const vtt = 'WEBVTT\n\n' + v.cues
      .map(([start, end, text]) => `${fmtVttTime(start)} --> ${fmtVttTime(end)}\n${text}`)
      .join('\n\n');
    trackBlobUrl = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
    quizVideo.pause();
    // Replace the <track> element cleanly so Chrome discards previous video's VTT cues
    quizVideo.querySelectorAll('track').forEach((t) => t.remove());
    quizVideo.src = v.src;
    const track = el('track', {
      kind: 'captions',
      srclang: 'en',
      label: 'English',
      default: true,
      src: trackBlobUrl,
    });
    quizVideo.append(track);
    quizVideo.load();
    $('#quiz-video-caption').textContent = `🎬 Video clue: ${v.label}`;
    $('#quiz-transcript-text').textContent = `${v.caption} Captions: ${v.cues.map((c) => c[2]).join(' ')}`;
    $('#quiz-transcript-box').open = false;
    if (!reducedMotion() && !save.animPaused) {
      quizVideo.play().catch(() => {});
    }
  };

  const nextQuiz = () => {
    if (quiz.idx >= quiz.questions.length) {
      endGame('quiz', quiz.score, `${quiz.score} / ${ROUNDS} correct`,
        quiz.score >= 8 ? 'You really know your animal diets!' : 'Every question teaches something new — try again!');
      return;
    }
    const q = quiz.questions[quiz.idx];
    quiz.current = q;
    quiz.idx += 1;
    $('#quiz-num').textContent = quiz.idx;
    $('#quiz-score').textContent = quiz.score;
    $('#quiz-q').textContent = q.q;
    loadQuizVideo(q.video);
    const options = shuffle(q.a);
    $('#quiz-options').replaceChildren(...options.map((text, i) => {
      const b = el('button', { type: 'button', className: 'quiz-btn' },
        `<span class="letter" aria-hidden="true">${'ABCD'[i]}</span><span class="q-text"></span><span class="mark" aria-hidden="true"></span>`);
      b.querySelector('.q-text').textContent = text;
      b.dataset.correct = String(text === q.a[0]);
      return b;
    }));
    $('#quiz-explain').hidden = true;
    const qSave = $('#quiz-save-note');
    qSave.disabled = false;
    qSave.textContent = '📝 Save to Notes';
  };

  $('#quiz-options').addEventListener('click', (e) => {
    const btn = e.target.closest('.quiz-btn');
    if (!btn || btn.disabled) return;
    const ok = btn.dataset.correct === 'true';
    $$('.quiz-btn').forEach((b) => {
      b.disabled = true;
      if (b.dataset.correct === 'true') { b.classList.add('correct'); b.querySelector('.mark').textContent = '✅'; }
      else if (b === btn) { b.classList.add('wrong'); b.querySelector('.mark').textContent = '❌'; }
      else b.classList.add('dim');
    });
    if (ok) { quiz.score += 1; sfx('good'); } else sfx('bad');
    $('#quiz-score').textContent = quiz.score;
    const ex = $('#quiz-explain');
    ex.className = `explain ${ok ? 'good' : 'bad'}`;
    $('#quiz-explain-text').textContent = `${ok ? '✅ Correct!' : `❌ The answer is "${quiz.current.a[0]}".`} ${quiz.current.why}`;
    ex.hidden = false;
    $('#quiz-next').textContent = quiz.idx >= quiz.questions.length ? 'See my results ➜' : 'Next question ➜';
    if (e.detail === 0) $('#quiz-next').focus();
  });
  $('#quiz-save-note').addEventListener('click', () => {
    if (!quiz.current) return;
    const q = quiz.current;
    const added = addQuickNote(q.q, 'fact', `Answer: ${q.a[0]}\n${q.why}`);
    const btn = $('#quiz-save-note');
    btn.textContent = added ? '✅ Saved!' : '📌 Already saved';
    btn.disabled = true;
    sfx('good');
    toast(added ? '📝 Saved quiz fact to Notes!' : '📌 Already in your Notes.');
  });
  $('#quiz-next').addEventListener('click', (e) => {
    nextQuiz();
    if (e.detail === 0) $('.quiz-btn')?.focus();
  });

  const startQuiz = () => {
    Object.assign(quiz, { idx: 0, score: 0, questions: shuffle(QUIZ).slice(0, ROUNDS) });
    nextQuiz();
  };

  // ───────── Notes Section ─────────
  const NOTE_TAGS = {
    herbivore: '🌿 Herbivore',
    carnivore: '🥩 Carnivore',
    omnivore: '🍽️ Omnivore',
    foodchain: '🔗 Food Chain',
    fact: '💡 Fun Fact',
    general: '📝 General',
  };
  let noteFilter = 'all';
  let editingNoteId = null;

  function addQuickNote(title, tag, body) {
    const exists = save.notes.some((n) => n.title.toLowerCase() === title.toLowerCase());
    if (exists) return false;
    save.notes.unshift({
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.slice(0, 80),
      tag: NOTE_TAGS[tag] ? tag : 'general',
      body: body.slice(0, 1000),
      pinned: false,
      updatedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    });
    persist();
    if (current === 'notes') renderNotes();
    return true;
  }

  const resetNoteForm = () => {
    editingNoteId = null;
    $('#note-form').reset();
    $('#composer-title').textContent = '✍️ Add a Field Note';
    $('#note-submit').textContent = '💾 Save note';
    $('#note-cancel').hidden = true;
  };

  const renderNotes = () => {
    const filtered = save.notes
      .filter((n) => noteFilter === 'all' || n.tag === noteFilter)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
    $('#notes-count').textContent = save.notes.length;
    $('#export-notes').disabled = save.notes.length === 0;
    $('#notes-empty').hidden = filtered.length > 0;
    $('#notes-empty').textContent = save.notes.length === 0
      ? 'No personal notes yet! Write your first note on the left, or tap "Save to Notes" while exploring animals or playing the quiz.'
      : 'No notes match this topic filter yet.';

    $('#notes-list').replaceChildren(...filtered.map((n) => {
      const li = el('li', { className: `note-item${n.pinned ? ' pinned' : ''}` });
      const top = el('div', { className: 'note-top' });
      const titleEl = el('h3', { className: 'note-title', textContent: n.title });
      const actions = el('div', { className: 'note-actions' });

      const pinBtn = el('button', {
        type: 'button',
        className: 'note-icon-btn',
        textContent: n.pinned ? '⭐' : '☆',
        ariaLabel: `${n.pinned ? 'Unpin' : 'Pin'} note: ${n.title}`,
      });
      pinBtn.dataset.action = 'pin';
      pinBtn.dataset.id = n.id;

      const editBtn = el('button', {
        type: 'button',
        className: 'note-icon-btn',
        textContent: '✏️',
        ariaLabel: `Edit note: ${n.title}`,
      });
      editBtn.dataset.action = 'edit';
      editBtn.dataset.id = n.id;

      const delBtn = el('button', {
        type: 'button',
        className: 'note-icon-btn',
        textContent: '🗑️',
        ariaLabel: `Delete note: ${n.title}`,
      });
      delBtn.dataset.action = 'delete';
      delBtn.dataset.id = n.id;

      actions.append(pinBtn, editBtn, delBtn);
      top.append(titleEl, actions);

      const meta = el('div', { className: 'note-meta' });
      meta.append(
        el('span', { className: `note-tag-pill tag-${n.tag}`, textContent: NOTE_TAGS[n.tag] || NOTE_TAGS.general }),
        el('span', { className: 'note-date', textContent: n.updatedAt || '' })
      );
      const bodyEl = el('p', { className: 'note-body', textContent: n.body });
      li.append(top, meta, bodyEl);
      return li;
    }));
  };

  $('#note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#note-title').value.trim();
    const tag = $('#note-tag').value;
    const body = $('#note-body').value.trim();
    if (!title || !body) return;
    const stamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (editingNoteId) {
      const target = save.notes.find((n) => n.id === editingNoteId);
      if (target) Object.assign(target, { title, tag, body, updatedAt: `${stamp} (edited)` });
      toast('✏️ Note updated!');
    } else {
      save.notes.unshift({
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        tag,
        body,
        pinned: false,
        updatedAt: stamp,
      });
      toast('💾 Note saved!');
    }
    persist();
    resetNoteForm();
    renderNotes();
    sfx('good');
  });

  $('#note-cancel').addEventListener('click', () => {
    resetNoteForm();
    $('#note-title').focus();
  });

  $$('[data-note-filter]').forEach((chip) => chip.addEventListener('click', () => {
    noteFilter = chip.dataset.noteFilter;
    $$('[data-note-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    renderNotes();
  }));

  $('#notes-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.note-icon-btn');
    if (!btn) return;
    const note = save.notes.find((n) => n.id === btn.dataset.id);
    if (!note) return;
    const act = btn.dataset.action;
    if (act === 'pin') {
      note.pinned = !note.pinned;
      persist();
      renderNotes();
      sfx('pop');
      announce(note.pinned ? `Pinned note ${note.title}` : `Unpinned note ${note.title}`);
    } else if (act === 'edit') {
      editingNoteId = note.id;
      $('#note-title').value = note.title;
      $('#note-tag').value = note.tag;
      $('#note-body').value = note.body;
      $('#composer-title').textContent = '✏️ Edit Field Note';
      $('#note-submit').textContent = '💾 Update note';
      $('#note-cancel').hidden = false;
      $('#note-title').focus();
    } else if (act === 'delete') {
      save.notes = save.notes.filter((n) => n.id !== note.id);
      if (editingNoteId === note.id) resetNoteForm();
      persist();
      renderNotes();
      sfx('pop');
      toast('🗑️ Note deleted.');
    }
  });

  $('#export-notes').addEventListener('click', () => {
    if (!save.notes.length) return;
    const lines = [
      'ANIMAL DIET 101 — MY FIELD NOTES',
      '================================',
      '',
      ...save.notes.map((n) => `${n.pinned ? '[PINNED] ' : ''}${n.title} (${NOTE_TAGS[n.tag] || n.tag})\n${n.body}\n`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: 'animal-diet-101-notes.txt' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('⬇️ Exported animal-diet-101-notes.txt');
  });

  // ───────── game control ─────────
  const STARTERS = { sort: startSort, feed: startFeed, quiz: startQuiz };

  function stopGames() {
    clearInterval(sort.timer);
    clearTimeout(sort.next);
    sort.timer = null;
    sort.locked = true;
    quizVideo.pause();
    endDrag();
  }

  function resetPanels() {
    for (const mode of Object.keys(STARTERS)) {
      $(`#${mode}-start`).hidden = false;
      $(`#${mode}-game`).hidden = true;
    }
  }

  function startGame(mode, viaKeyboard = false) {
    stopGames();
    $(`#${mode}-start`).hidden = true;
    $(`#${mode}-game`).hidden = false;
    STARTERS[mode]();
    // Move focus into the game when started via keyboard, without pre-highlighting a choice for pointer users
    if (viaKeyboard) {
      const first = { sort: '.bin', feed: '.food-btn', quiz: '.quiz-btn' }[mode];
      $(`#${mode}-game ${first}`)?.focus();
    }
  }

  $$('[data-start]').forEach((b) => b.addEventListener('click', (e) => startGame(b.dataset.start, e.detail === 0)));

  // ───────── navigation (hash based, so Back works) ─────────
  const SCREENS = ['home', 'learn', 'sort', 'feed', 'quiz', 'notes'];
  let current = null;

  const showScreen = (name, moveFocus = true) => {
    stopGames();
    resetPanels();
    $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    current = name;
    if (name === 'home') renderHome();
    if (name === 'learn') renderGrid();
    if (name === 'notes') renderNotes();
    document.title = name === 'home' ? 'Animal Diet 101 — Who eats what?' : `${$(`[data-screen="${name}"] h1`).textContent.replace(/^\S+\s/, '')} · Animal Diet 101`;
    window.scrollTo({ top: 0 });
    if (moveFocus) $(`[data-screen="${name}"] h1`).focus({ preventScroll: true });
  };

  const route = () => {
    const name = location.hash.slice(1);
    const target = SCREENS.includes(name) ? name : 'home';
    if (target === current) return;
    if (document.startViewTransition && !reducedMotion() && current) {
      const vt = document.startViewTransition(() => showScreen(target));
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
      vt.updateCallbackDone.catch(() => {});
    } else {
      showScreen(target, current !== null);
    }
  };
  window.addEventListener('hashchange', route);

  // ───────── reset progress ─────────
  const resetDialog = $('#reset-dialog');
  $('#reset-progress').addEventListener('click', () => resetDialog.showModal());
  resetDialog.addEventListener('close', () => {
    const choice = resetDialog.returnValue;
    resetDialog.returnValue = '';
    if (choice !== 'reset') return;
    const sound = save.sound;
    const animPaused = save.animPaused;
    save = { ...fresh(), sound, animPaused };
    persist();
    resetNoteForm();
    renderHome();
    renderGrid();
    renderNotes();
    toast('Progress reset. Fresh start! 🌱');
  });

  // ───────── boot ─────────
  renderStatic();
  renderSound();
  renderMotion();
  route();
})();
