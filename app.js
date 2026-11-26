/* Animal Diet 101 — Bilingual, Role-Separated (Student / Teacher) App Logic */
'use strict';

(() => {
  const { DIETS, FOODS, OMNI_DISTRACTORS, ANIMALS, VIDEOS } = window.DIET_DATA;
  const I = window.I18N;
  const DB = window.AD101_DB;
  const TTS = window.AD101_TTS;
  const AI = window.AD101_AI;

  // ───────── DOM & utility helpers ─────────
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
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────── app state ─────────
  let prefs = DB.getPrefs(); // { lang: 'en'|'ms', sound: true, animPaused: false }
  let lang = prefs.lang === 'ms' ? 'ms' : 'en';
  let user = null; // current logged-in user doc ({ id, username, role, best, bestStreak, seen, badges, personalNotes, totalScore })
  let allStudents = [];
  let customQuestions = [];
  let classNotes = [];
  let current = null;

  const t = (key, vars) => I.t(lang, key, vars);
  const foodList = (animal) => I.joinList(lang, animal.eats.map((k) => I.getFood(lang, k).n.toLowerCase()));
  const dietWord = (diet) => I.getDiet(lang, diet).label.toLowerCase();
  const withArticle = (word) => {
    const art = I.article(lang, word);
    return art ? `${art} ${word}` : word;
  };

  // ───────── live region & toast ─────────
  const live = $('#live');
  const announce = (msg) => {
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 60);
  };
  let toastTimer;
  const toast = (msg) => {
    const node = $('#toast');
    node.textContent = msg;
    node.hidden = false;
    announce(msg);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, 3200);
  };

  // ───────── sound (Web Audio) ─────────
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
    if (!prefs.sound) return;
    try {
      actx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const now = actx.currentTime;
      if (kind === 'good') { tone(660, now, 0.12, 'triangle'); tone(990, now + 0.09, 0.2, 'triangle'); }
      if (kind === 'bad') { tone(220, now, 0.18, 'square', 0.06); tone(165, now + 0.15, 0.25, 'square', 0.06); }
      if (kind === 'tick') tone(880, now, 0.05, 'sine', 0.08);
      if (kind === 'pop') tone(520, now, 0.08, 'triangle', 0.1);
      if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, now + i * 0.12, 0.25, 'triangle'));
    } catch { /* audio unsupported */ }
  };
  const soundBtn = $('#sound-toggle');
  const renderSound = () => {
    soundBtn.setAttribute('aria-pressed', String(prefs.sound));
    soundBtn.setAttribute('aria-label', t('soundLabel'));
    soundBtn.firstElementChild.textContent = prefs.sound ? '🔊' : '🔇';
  };
  soundBtn.addEventListener('click', () => {
    prefs = DB.savePrefs({ sound: !prefs.sound });
    renderSound();
    sfx('pop');
  });

  // ───────── homepage animation toggle (WCAG 2.2.2) ─────────
  const motionBtn = $('#motion-toggle');
  const renderMotion = () => {
    document.body.classList.toggle('animations-paused', Boolean(prefs.animPaused));
    motionBtn.textContent = prefs.animPaused ? t('playAnim') : t('pauseAnim');
  };
  motionBtn.addEventListener('click', () => {
    prefs = DB.savePrefs({ animPaused: !prefs.animPaused });
    renderMotion();
    announce(prefs.animPaused ? t('animPausedAnnounce') : t('animPlayingAnnounce'));
  });

  // ───────── save current user progress to Firestore / local ─────────
  async function persistUser() {
    if (!user) return;
    user.totalScore = DB.computeTotalScore(user.best, user.seen, user.badges);
    await DB.saveUserProgress(user.id, user);
  }

  // ───────── badges ─────────
  const BADGE_DEFS = [
    { id: 'explorer', icon: '🔍', test: (u) => (u?.seen?.length || 0) >= 10 },
    { id: 'zoologist', icon: '🎓', test: (u) => (u?.seen?.length || 0) >= ANIMALS.length },
    { id: 'sorter', icon: '⚡', test: (u) => (u?.best?.sort || 0) >= 150 },
    { id: 'streak', icon: '🔥', test: (u) => (u?.bestStreak || 0) >= 10 },
    { id: 'feeder', icon: '🍽️', test: (u) => (u?.best?.feed || 0) >= 10 },
    { id: 'whiz', icon: '🧠', test: (u) => (u?.best?.quiz || 0) >= 10 },
  ];
  const badgeText = (id) => {
    const [name, desc] = I.UI[lang].badges[id];
    return { name, desc: desc.replace('{total}', String(ANIMALS.length)) };
  };
  const checkBadges = () => {
    if (!user || user.role !== 'student') return [];
    const earned = BADGE_DEFS.filter((b) => !user.badges.includes(b.id) && b.test(user));
    if (earned.length) {
      user.badges.push(...earned.map((b) => b.id));
      persistUser();
    }
    return earned;
  };
  const renderBadgesInto = (container) => {
    const earnedIds = user?.badges || [];
    container.replaceChildren(...BADGE_DEFS.map((b) => {
      const got = earnedIds.includes(b.id);
      const { name, desc } = badgeText(b.id);
      return el('li', { className: `badge${got ? ' earned' : ''}` }, `
        <span class="b-icon" aria-hidden="true">${b.icon}</span>
        <span class="b-name">${name}</span>
        <span class="b-desc">${desc}</span>
        <span class="visually-hidden">${got ? t('earnedSr') : t('lockedSr')}</span>`);
    }));
  };

  // ───────── language switcher (EN <-> BM) ─────────
  const TAG_KEYS = ['herbivore', 'carnivore', 'omnivore', 'foodchain', 'fact', 'general'];
  const populateTagSelect = (sel) => {
    const prev = sel.value || 'herbivore';
    const tags = I.UI[lang].tags;
    sel.replaceChildren(...TAG_KEYS.map((k) => el('option', { value: k, textContent: tags[k] })));
    sel.value = TAG_KEYS.includes(prev) ? prev : 'herbivore';
  };

  const populateVideoSelect = () => {
    const sel = $('#tq-video');
    const prev = sel.value || 'herbivore-meadow';
    sel.replaceChildren(...Object.keys(VIDEOS).map((k) => {
      const v = I.getVideo(lang, k);
      return el('option', { value: k, textContent: `🎬 ${v.label}` });
    }));
    sel.value = VIDEOS[prev] ? prev : 'herbivore-meadow';
  };

  const renderDbBadges = () => {
    const isFb = DB.getMode() === 'firebase';
    const text = isFb ? t('dbFirebase') : t('dbLocal');
    $('#footer-db-status').textContent = text;
    $('#login-db-hint').textContent = isFb ? t('loginDbHintLive') : t('loginDbHintLocal');
    for (const id of ['#profile-db-pill', '#teacher-db-pill']) {
      const node = $(id);
      if (node) {
        node.textContent = text;
        node.className = `db-pill${isFb ? '' : ' local'}`;
      }
    }
  };

  const renderStaticLocalized = () => {
    document.documentElement.lang = lang;
    $$('#lang-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('#lang-switch').setAttribute('aria-label', t('langSwitchLabel'));

    // Translate all declarative [data-i18n] nodes
    $$('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      const val = t(key);
      if (typeof val === 'string') node.textContent = val;
    });

    // Placeholders & formatted copy
    $('#login-username').placeholder = t('loginNamePlaceholder');
    $('#login-email').placeholder = t('loginEmailPlaceholder');
    $('#login-password').placeholder = t('loginPassPlaceholder');
    $('#ai-input').placeholder = t('aiInputPlaceholder');
    $('#search').placeholder = t('searchPlaceholder');
    $('#note-title').placeholder = t('noteTitlePlaceholder');
    $('#note-body').placeholder = t('noteBodyPlaceholder');
    $('#teacher-student-search').placeholder = t('tSearchStudent');
    $('#hero-lead').textContent = t('heroLead', { count: ANIMALS.length });
    $('#sort-start-desc').innerHTML = t('sortStartDesc');
    $('#feed-start-desc').innerHTML = t('feedStartDesc');

    const qCount = Math.min(10, getActiveQuizPool().length);
    $('#quiz-sub').textContent = t('quizSub', { count: qCount });
    $('#quiz-start-desc').innerHTML = t('quizStartDesc', { count: qCount });
    renderDubButton();

    // Sort bin labels
    for (const dk of ['herbivore', 'carnivore', 'omnivore']) {
      $(`#bin-label-${dk}`).textContent = I.getDiet(lang, dk).label;
    }

    // Teacher quiz option labels
    for (let i = 1; i <= 4; i++) {
      $(`#lbl-opt${i}`).textContent = t('tqOptLabel', { n: i });
    }

    // Parade banner
    const items = I.UI[lang].parade;
    const makeGroup = () => {
      const g = el('div', { className: 'parade-group' });
      items.forEach(([cls, txt]) => g.append(el('span', { className: `p-item p-${cls}`, textContent: txt })));
      return g;
    };
    $('#parade-track').replaceChildren(makeGroup(), makeGroup());

    // Diet cards on Home (with TTS Listen button)
    $('#diet-cards').replaceChildren(...Object.keys(DIETS).map((key) => {
      const d = I.getDiet(lang, key);
      const count = ANIMALS.filter((a) => a.diet === key).length;
      const card = el('article', { className: `diet-card ${key}` }, `
        <div class="diet-card-head">
          <h3><span class="icon" aria-hidden="true">${d.icon}</span> ${d.label}</h3>
          <button type="button" class="tts-pill diet-tts">${t('ttsListen')}</button>
        </div>
        <p>${d.blurb}</p>
        <p class="teeth">🦷 ${d.teeth}</p>
        <p class="examples" aria-hidden="true">${d.examples}</p>
        <p class="teeth">${t('dietCountLine', { count, diet: d.label.toLowerCase() })}</p>`);
      card.querySelector('.diet-tts').addEventListener('click', () => {
        TTS.speak(`${d.label}. ${d.blurb} ${d.teeth}`, lang);
      });
      return card;
    }));

    // Diet dictionary, Core Study Sheet & Additional Enrichment Notes (with TTS)
    $('#dictionary').replaceChildren(...I.getDictionary(lang).map(([icon, term, def]) =>
      el('div', {}, `<dt><span aria-hidden="true">${icon}</span> ${term}</dt><dd>${def}</dd>`)));

    const renderNoteCards = (list, target) => {
      target.replaceChildren(...list.map((s) => {
        const card = el('article', { className: `study-card tag-${s.tag}` }, `
          <div class="study-card-head">
            <h3><span aria-hidden="true">${s.icon}</span> ${s.title}</h3>
            <button type="button" class="tts-pill card-tts">${t('ttsListen')}</button>
          </div>
          <ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>`);
        card.querySelector('.card-tts').addEventListener('click', () => {
          TTS.speak(`${s.title}. ${s.points.join(' ')}`, lang);
        });
        return card;
      }));
    };
    renderNoteCards(I.getStudyNotes(lang), $('#study-notes'));
    renderNoteCards(I.getExtraNotes(lang), $('#extra-notes'));

    // Tag selects & filters
    populateTagSelect($('#note-tag'));
    populateTagSelect($('#tn-tag'));
    populateVideoSelect();
    renderNoteFilterChips();

    renderSound();
    renderMotion();
    renderDbBadges();
    renderUserChrome();
    renderAiChrome();
    refreshActiveScreen();
  };

  $$('#lang-switch button').forEach((btn) => btn.addEventListener('click', () => {
    const next = btn.dataset.lang;
    if (next === lang) return;
    lang = next;
    prefs = DB.savePrefs({ lang });
    renderStaticLocalized();
    sfx('pop');
  }));

  // ───────── Auth & Role Chrome ─────────
  const renderUserChrome = () => {
    const loggedIn = Boolean(user);
    const isStudent = user?.role === 'student';
    const isTeacher = user?.role === 'teacher';

    $('#nav-student').hidden = !isStudent;
    $('#nav-teacher').hidden = !isTeacher;
    $('#user-bar').hidden = !loggedIn;
    $('#ai-fab').hidden = !loggedIn;
    $('#reset-progress').hidden = !isStudent;
    $('#brand-link').href = isTeacher ? '#teacher-home' : isStudent ? '#home' : '#login';

    if (loggedIn) {
      const pill = $('#user-pill');
      pill.textContent = `${isTeacher ? '👩‍🏫' : '🎓'} ${user.username}`;
      pill.className = `user-pill${isTeacher ? ' teacher' : ''}`;
    }
  };

  // Teacher email/password visibility & Sign-In vs Register tab
  let teacherAuthMode = 'signin';
  const syncLoginRoleUI = () => {
    const isTeacher = $('input[name="role"]:checked')?.value === 'teacher';
    $('#teacher-auth-box').hidden = !isTeacher;
    $('#login-email').required = isTeacher;
    $('#login-password').required = isTeacher;
    $('#login-username').required = !isTeacher || teacherAuthMode === 'register';
    $('#login-password').autocomplete = teacherAuthMode === 'register' ? 'new-password' : 'current-password';
    $('#login-error').hidden = true;
  };
  $$('input[name="role"]').forEach((r) => r.addEventListener('change', syncLoginRoleUI));
  $$('[data-teacher-mode]').forEach((btn) => btn.addEventListener('click', () => {
    teacherAuthMode = btn.dataset.teacherMode;
    $$('[data-teacher-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    syncLoginRoleUI();
  }));
  syncLoginRoleUI();

  const friendlyAuthError = (err) => {
    const code = err?.code || '';
    if (code === 'ad101/invalid-email' || code === 'auth/invalid-email') return t('loginErrorEmail');
    if (code === 'ad101/weak-password' || code === 'auth/weak-password') return t('loginErrorPass');
    if (code === 'auth/email-already-in-use') return t('loginErrorInUse');
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return t('loginErrorCred');
    if (code === 'auth/operation-not-allowed') return t('loginErrorProvider');
    return err?.message || String(err);
  };

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#login-username').value.trim();
    const role = ($('input[name="role"]:checked')?.value === 'teacher') ? 'teacher' : 'student';
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const errEl = $('#login-error');

    if (role === 'student' && name.length < 2) {
      errEl.textContent = t('loginErrorName');
      errEl.hidden = false;
      $('#login-username').focus();
      return;
    }
    if (role === 'teacher' && teacherAuthMode === 'register' && name.length < 2) {
      errEl.textContent = t('loginErrorName');
      errEl.hidden = false;
      $('#login-username').focus();
      return;
    }
    errEl.hidden = true;
    const submitBtn = $('.login-submit');
    submitBtn.disabled = true;
    try {
      const res = await DB.loginOrRegister(name, role, { email, password, authMode: teacherAuthMode });
      user = res.user;
      $('#login-password').value = '';
      renderUserChrome();
      renderAiChrome();
      sfx('win');
      toast(res.isNew ? t('welcomeNewToast', { name: user.username }) : t('welcomeBackToast', { name: user.username }));
      location.hash = role === 'teacher' ? 'teacher-home' : 'home';
      route(true);
    } catch (err) {
      errEl.textContent = friendlyAuthError(err);
      errEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
    }
  });

  $('#logout-btn').addEventListener('click', async () => {
    stopGames();
    TTS.stop();
    if ($('#ai-dialog').open) $('#ai-dialog').close();
    await DB.logout();
    user = null;
    renderUserChrome();
    toast(t('loggedOutToast'));
    location.hash = 'login';
    route(true);
  });

  // ───────── Leaderboard helpers (Student & Teacher) ─────────
  const getStudentRank = (userId) => {
    const idx = allStudents.findIndex((s) => s.id === userId);
    return idx >= 0 ? idx + 1 : null;
  };

  const renderLeaderboardTable = (tableId, headId, bodyId, emptyId, rows, highlightId = null) => {
    const table = $(tableId);
    const cols = [
      t('colRank'), t('colStudent'), t('colTotal'),
      t('colSort'), t('colFeed'), t('colQuiz'), t('colAnimals'),
    ];
    cols.forEach((lbl, i) => table.style.setProperty(`--label-${i + 1}`, JSON.stringify(lbl)));
    $(headId).replaceChildren(...cols.map((c) => el('th', { scope: 'col', textContent: c })));

    const tbody = $(bodyId);
    const emptyEl = $(emptyId);
    const wrapper = table.closest('.table-wrapper');
    if (!rows.length) {
      tbody.replaceChildren();
      emptyEl.hidden = false;
      wrapper.hidden = true;
      return;
    }
    emptyEl.hidden = true;
    wrapper.hidden = false;

    tbody.replaceChildren(...rows.map((s) => {
      const rank = getStudentRank(s.id) || 1;
      const medal = rank === 1 ? '🥇 ' : rank === 2 ? '🥈 ' : rank === 3 ? '🥉 ' : `#${rank}`;
      const isMe = highlightId && s.id === highlightId;
      const tr = el('tr', { className: isMe ? 'is-me' : '' });
      const tdRank = el('td', { textContent: medal });
      const thName = el('th', { scope: 'row' });
      thName.textContent = s.username;
      if (isMe) thName.append(el('span', { className: 'you-tag', textContent: t('youBadge') }));
      const tdTotal = el('td', { textContent: `${s.totalScore || 0}` });
      const tdSort = el('td', { textContent: `${s.best?.sort || 0}` });
      const tdFeed = el('td', { textContent: `${s.best?.feed || 0}/10` });
      const tdQuiz = el('td', { textContent: `${s.best?.quiz || 0}/10` });
      const tdAnimals = el('td', { textContent: `${s.seen?.length || 0}/${ANIMALS.length}` });
      tr.append(tdRank, thName, tdTotal, tdSort, tdFeed, tdQuiz, tdAnimals);
      return tr;
    }));
  };

  // ───────── STUDENT: Home ─────────
  const renderHome = () => {
    if (!user || user.role !== 'student') return;
    $('#best-learn').textContent = t('bestDiscovered', { seen: user.seen.length, total: ANIMALS.length });
    $('#best-sort').textContent = user.best.sort ? t('bestPts', { score: user.best.sort }) : t('bestNotPlayed');
    $('#best-feed').textContent = user.best.feed ? t('bestTen', { score: user.best.feed }) : t('bestNotPlayed');
    $('#best-quiz').textContent = user.best.quiz ? t('bestTen', { score: user.best.quiz }) : t('bestNotPlayed');
    const nc = user.personalNotes.length;
    $('#best-notes').textContent = nc === 0 ? t('bestNotesZero') : nc === 1 ? t('bestNotesOne') : t('bestNotes', { n: nc });
    const rank = getStudentRank(user.id);
    $('#best-rank').textContent = rank ? t('bestRank', { rank, pts: user.totalScore || 0 }) : t('bestRankUnranked');
    renderBadgesInto($('#badges'));
  };

  // ───────── STUDENT: Profile & Leaderboard ─────────
  const renderProfile = () => {
    if (!user || user.role !== 'student') return;
    $('#profile-username').textContent = user.username;
    $('#profile-role-pill').textContent = t('roleStudent');
    const rank = getStudentRank(user.id);
    $('#profile-rank-val').textContent = rank
      ? t('rankOf', { rank, total: allStudents.length })
      : '—';

    const stats = [
      ['🏆', user.totalScore || 0, t('statTotalScore')],
      ['🧺', `${user.best.sort || 0}`, t('statSortBest')],
      ['🍽️', `${user.best.feed || 0}/10`, t('statFeedBest')],
      ['🧠', `${user.best.quiz || 0}/10`, t('statQuizBest')],
      ['🔍', `${user.seen.length}/${ANIMALS.length}`, t('statDiscovered')],
      ['🔥', `${user.bestStreak || 0}`, t('hudStreak')],
    ];
    $('#profile-stats').replaceChildren(...stats.map(([icon, val, lbl]) =>
      el('div', { className: 'stat-card' }, `
        <span class="s-icon" aria-hidden="true">${icon}</span>
        <strong class="s-val">${val}</strong>
        <span class="s-lbl">${lbl}</span>`)));

    renderBadgesInto($('#profile-badges'));
    renderLeaderboardTable('#student-lb-table', '#student-lb-head', '#student-lb-body', '#student-lb-empty', allStudents, user.id);
  };

  // ───────── STUDENT: Encyclopedia ─────────
  let filter = 'all';
  let query = '';
  const renderGrid = () => {
    const seenList = user?.seen || [];
    const list = ANIMALS.map((a) => I.getAnimal(lang, a)).filter((a) =>
      (filter === 'all' || a.diet === filter) && a.name.toLowerCase().includes(query));
    $('#animal-grid').replaceChildren(...list.map((a) => {
      const seen = seenList.includes(a.id);
      const dietLbl = I.getDiet(lang, a.diet).label;
      const btn = el('button', { type: 'button', className: `animal-card diet-${a.diet}` }, `
        <span class="ac-emoji" aria-hidden="true">${a.emoji}</span>
        <span class="ac-name">${a.name}</span>
        <span class="diet-badge diet-${a.diet}">${dietLbl}</span>
        ${seen ? '<span class="ac-seen" aria-hidden="true">✓</span><span class="visually-hidden">(✓)</span>' : ''}`);
      btn.dataset.id = a.id;
      return el('li').appendChild(btn).parentNode;
    }));
    $('#no-results').hidden = list.length > 0;
    $('#seen-count').textContent = t('discoveredPill', { seen: seenList.length, total: ANIMALS.length });
  };

  $$('[data-filter]').forEach((chip) => chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    $$('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    renderGrid();
  }));
  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  const animalDialog = $('#animal-dialog');
  let pendingBadges = [];
  let activeAnimalId = null;

  const renderAnimalDialog = (animalId, resetExtras = true) => {
    const base = ANIMALS.find((x) => x.id === animalId);
    if (!base) return;
    const a = I.getAnimal(lang, base);
    const d = I.getDiet(lang, a.diet);
    $('#ad-emoji').textContent = a.emoji;
    $('#ad-title').textContent = a.name;
    const badge = $('#ad-diet');
    badge.className = `diet-badge diet-${a.diet}`;
    badge.textContent = `${d.icon} ${d.label}`;
    $('#ad-special').textContent = a.special;
    $('#ad-eats').replaceChildren(...a.eats.map((k) => {
      const f = I.getFood(lang, k);
      return el('li', {}, `<span aria-hidden="true">${f.e}</span>${f.n}`);
    }));
    $('#ad-fact').textContent = `💡 ${a.fact}`;
    $('#ad-note').textContent = t('animalDietNote', {
      name: a.name,
      article: I.article(lang, d.label),
      diet: d.label.toLowerCase(),
      blurb: `${d.blurb[0].toLowerCase()}${d.blurb.slice(1)}`,
    }).replace(/\s{2,}/g, ' ');
    if (resetExtras) {
      const saveBtn = $('#ad-save-note');
      saveBtn.disabled = false;
      saveBtn.textContent = t('dialogSaveNote');
      $('#ad-spelling').hidden = true;
    } else if (!$('#ad-spelling').hidden) {
      $('#ad-spelling').textContent = `🔤 ${TTS.spellLetters(a.name)}`;
    }
  };

  $('#ad-listen-btn').addEventListener('click', () => {
    if (!activeAnimalId) return;
    const a = I.getAnimal(lang, ANIMALS.find((x) => x.id === activeAnimalId));
    TTS.speak(a.name, lang);
  });
  $('#ad-spell-btn').addEventListener('click', () => {
    if (!activeAnimalId) return;
    const a = I.getAnimal(lang, ANIMALS.find((x) => x.id === activeAnimalId));
    const letters = TTS.spellWord(a.name, lang);
    const box = $('#ad-spelling');
    box.textContent = `🔤 ${letters}`;
    box.hidden = false;
  });
  $('#ad-read-all-btn').addEventListener('click', () => {
    if (!activeAnimalId) return;
    const a = I.getAnimal(lang, ANIMALS.find((x) => x.id === activeAnimalId));
    const d = I.getDiet(lang, a.diet);
    TTS.speak(`${a.name}. ${d.label}. ${t('dialogMenu')}: ${foodList(a)}. ${a.fact}`, lang);
  });

  $('#animal-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.animal-card');
    if (!btn) return;
    activeAnimalId = btn.dataset.id;
    renderAnimalDialog(activeAnimalId, true);
    animalDialog.showModal();
    sfx('pop');
    if (user && !user.seen.includes(activeAnimalId)) {
      user.seen.push(activeAnimalId);
      pendingBadges.push(...checkBadges());
      persistUser();
    }
  });

  $('#ad-save-note').addEventListener('click', () => {
    if (!activeAnimalId || !user) return;
    const a = I.getAnimal(lang, ANIMALS.find((x) => x.id === activeAnimalId));
    const d = I.getDiet(lang, a.diet);
    const added = addPersonalNote(
      `${a.emoji} ${a.name} (${d.label})`,
      a.diet,
      `${t('dialogMenu')}: ${foodList(a)}.\n${t('dialogFact')}: ${a.fact}`
    );
    const saveBtn = $('#ad-save-note');
    saveBtn.textContent = added ? t('dialogSavedNote') : t('dialogAlreadyNote');
    saveBtn.disabled = true;
    sfx('good');
  });

  animalDialog.addEventListener('close', () => {
    TTS.stop();
    renderGrid();
    if (pendingBadges.length) {
      sfx('win');
      toast(t('newTrophyToast', { names: pendingBadges.map((b) => `${b.icon} ${badgeText(b.id).name}`).join(', ') }));
      pendingBadges = [];
    }
  });

  // Light-dismiss fallback for <dialog closedby="any">
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

  // ───────── Results Dialog ─────────
  const STAR_RULES = { sort: [60, 150, 250], feed: [5, 8, 10], quiz: [5, 8, 10] };
  const resultDialog = $('#result-dialog');
  let lastMode = null;

  const endGame = (mode, score, scoreText, detail) => {
    stopGames();
    const prev = user?.best?.[mode] || 0;
    const isBest = score > prev;
    if (user && isBest) user.best[mode] = score;
    const newBadges = checkBadges();
    persistUser();

    const stars = STAR_RULES[mode].filter((min) => score >= min).length;
    $('#rd-stars').innerHTML = [0, 1, 2].map((i) => `<span class="${i < stars ? 'on' : 'off'}">⭐</span>`).join('');
    $('#rd-title').textContent = I.UI[lang].resultTitles[stars];
    $('#rd-score').textContent = scoreText;
    $('#rd-detail').textContent = t('resultStars', { detail, stars });
    const bestScore = user?.best?.[mode] || score;
    $('#rd-best').textContent = isBest && prev > 0
      ? t('resultNewBest')
      : mode === 'sort' ? t('resultBestPts', { score: bestScore }) : t('resultBestTen', { score: bestScore });
    const rb = $('#rd-badge');
    rb.hidden = !newBadges.length;
    rb.textContent = newBadges.length
      ? t('newTrophyToast', { names: newBadges.map((b) => `${b.icon} ${badgeText(b.id).name}`).join(', ') })
      : '';
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

  // ───────── STUDENT: Sort It! ─────────
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
    const loc = I.getAnimal(lang, sort.current);
    $('#sort-emoji').textContent = loc.emoji;
    $('#sort-name').textContent = loc.name;
    sortCard.style.transition = 'none';
    sortCard.classList.remove('dropped', 'enter');
    sortCard.style.translate = '';
    void sortCard.offsetWidth;
    sortCard.style.transition = '';
    sortCard.classList.add('enter');
    $$('.bin').forEach((b) => b.classList.remove('flash-good', 'flash-bad', 'flash-hint'));
    sort.locked = false;
  };
  const startSort = () => {
    Object.assign(sort, { score: 0, streak: 0, time: SORT_TIME, queue: shuffle(ANIMALS), right: 0, total: 0 });
    sortFeedback(t('sortPrompt'));
    sortHud();
    nextSort();
    sort.timer = setInterval(() => {
      sort.time -= 1;
      sortHud();
      if (sort.time > 0 && sort.time <= 5) sfx('tick');
      if (sort.time <= 0) {
        endGame('sort', sort.score, t('sortResultScore', { score: sort.score }),
          t('sortResultDetail', { right: sort.right, total: sort.total }));
      }
    }, 1000);
  };
  const answerSort = (diet) => {
    if (sort.locked || !sort.timer) return;
    sort.locked = true;
    sort.total += 1;
    const a = I.getAnimal(lang, sort.current);
    const ok = a.diet === diet;
    const bin = $(`.bin[data-diet="${diet}"]`);
    if (ok) {
      sort.streak += 1;
      sort.right += 1;
      const pts = 10 + Math.min(sort.streak - 1, 5) * 2;
      sort.score += pts;
      if (user) user.bestStreak = Math.max(user.bestStreak || 0, sort.streak);
      bin.classList.add('flash-good');
      sortFeedback(
        `${t('sortCorrect', { name: a.name, article: I.article(lang, dietWord(diet)), diet: dietWord(diet), pts }).replace(/\s{2,}/g, ' ')}${sort.streak >= 3 ? ` 🔥×${sort.streak}` : ''}`,
        'good'
      );
      sfx('good');
    } else {
      sort.streak = 0;
      bin.classList.add('flash-bad');
      $(`.bin[data-diet="${a.diet}"]`).classList.add('flash-hint');
      sortFeedback(
        t('sortWrong', { name: a.name, article: I.article(lang, dietWord(a.diet)), diet: dietWord(a.diet), foods: foodList(a) }).replace(/\s{2,}/g, ' '),
        'bad'
      );
      sfx('bad');
    }
    sortCard.classList.add('dropped');
    sortHud();
    sort.next = setTimeout(() => { if (sort.timer) nextSort(); }, ok ? 550 : 1800);
  };
  $$('.bin').forEach((bin) => bin.addEventListener('click', () => answerSort(bin.dataset.diet)));

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
    if (e.target.closest('button')) return;
    if (e.button !== 0 || sort.locked) return;
    drag = { x: e.clientX, y: e.clientY, moved: false, over: null };
    sortCard.setPointerCapture(e.pointerId);
  });
  $('#sort-speak-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!sort.current) return;
    TTS.speak(I.getAnimal(lang, sort.current).name, lang);
  });
  $('#sort-spell-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!sort.current) return;
    const letters = TTS.spellWord(I.getAnimal(lang, sort.current).name, lang);
    toast(t('spelledToast', { letters }));
  });
  $('#feed-speak-btn').addEventListener('click', () => {
    if (!feed.current) return;
    TTS.speak(I.getAnimal(lang, feed.current).name, lang);
  });
  $('#feed-spell-btn').addEventListener('click', () => {
    if (!feed.current) return;
    const letters = TTS.spellWord(I.getAnimal(lang, feed.current).name, lang);
    toast(t('spelledToast', { letters }));
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
    else sortCard.style.translate = '';
  });
  sortCard.addEventListener('lostpointercapture', () => {
    if (drag) { endDrag(); sortCard.style.translate = ''; }
  });
  document.addEventListener('keydown', (e) => {
    if (current !== 'sort' || !sort.timer || document.querySelector('dialog[open]')) return;
    if (e.target.matches('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
    const diet = { 1: 'herbivore', 2: 'carnivore', 3: 'omnivore' }[e.key];
    if (diet) { e.preventDefault(); answerSort(diet); }
  });

  // ───────── STUDENT: Feed Me! ─────────
  const ROUNDS = 10;
  const feed = { round: 0, score: 0, animals: [], current: null, options: [] };
  const distractorsFor = (a) => {
    const eats = new Set(a.eats);
    const pool = a.diet === 'herbivore'
      ? Object.keys(FOODS).filter((k) => FOODS[k].type === 'animal')
      : a.diet === 'carnivore'
        ? Object.keys(FOODS).filter((k) => FOODS[k].type === 'plant')
        : OMNI_DISTRACTORS;
    return shuffle(pool.filter((k) => !eats.has(k))).slice(0, 3);
  };
  const renderFeedRound = () => {
    const a = I.getAnimal(lang, feed.current);
    $('#feed-round').textContent = feed.round;
    $('#feed-score').textContent = feed.score;
    $('#feed-emoji').textContent = a.emoji;
    $('#feed-name').textContent = a.name;
    $('#feed-bubble').textContent = pick(I.UI[lang].bubbles);
    $('.feed-animal').classList.remove('happy');
    $('#food-grid').replaceChildren(...feed.options.map((k) => {
      const f = I.getFood(lang, k);
      const b = el('button', { type: 'button', className: 'food-btn' },
        `<span class="f-emoji" aria-hidden="true">${f.e}</span><span>${f.n}</span><span class="mark" aria-hidden="true"></span>`);
      b.dataset.food = k;
      return b;
    }));
    $('#feed-explain').hidden = true;
  };
  const nextFeed = () => {
    if (feed.round >= ROUNDS) {
      endGame('feed', feed.score, t('feedResultScore', { score: feed.score }),
        feed.score === ROUNDS ? t('feedResultFull') : t('feedResultTry'));
      return;
    }
    feed.current = feed.animals[feed.round];
    feed.round += 1;
    feed.options = shuffle([pick(feed.current.eats), ...distractorsFor(feed.current)]);
    renderFeedRound();
  };
  $('#food-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.food-btn');
    if (!btn || btn.disabled) return;
    const a = I.getAnimal(lang, feed.current);
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
      $('#feed-bubble').textContent = t('bubbleYum');
      sfx('good');
    } else {
      $('#feed-bubble').textContent = t('bubbleYuck');
      sfx('bad');
    }
    const ex = $('#feed-explain');
    ex.className = `explain ${ok ? 'good' : 'bad'}`;
    const vars = {
      name: a.name,
      food: I.getFood(lang, btn.dataset.food).n.toLowerCase(),
      article: I.article(lang, dietWord(a.diet)),
      diet: dietWord(a.diet),
      foods: foodList(a),
      fact: a.fact,
    };
    $('#feed-explain-text').textContent = (ok ? t('feedCorrect', vars) : t('feedWrong', vars)).replace(/\s{2,}/g, ' ');
    ex.hidden = false;
    $('#feed-next').textContent = feed.round >= ROUNDS ? t('seeResults') : t('feedNext');
    if (e.detail === 0) $('#feed-next').focus();
  });
  $('#feed-next').addEventListener('click', (e) => {
    nextFeed();
    if (e.detail === 0) $('.food-btn')?.focus();
  });
  const startFeed = () => {
    const pool = ANIMALS.filter((a) => a.id !== 'human');
    Object.assign(feed, { round: 0, score: 0, animals: shuffle(pool).slice(0, ROUNDS) });
    nextFeed();
  };

  // ───────── STUDENT: Video Diet Quiz (built-in + teacher custom questions + Audio & Dubbing) ─────────
  const quiz = { idx: 0, score: 0, questions: [], current: null };
  const quizVideo = $('#quiz-video');
  let trackBlobUrl = null;
  let dubEnabled = true;

  const renderDubButton = () => {
    const btn = $('#quiz-dub-toggle');
    if (!btn) return;
    btn.textContent = dubEnabled ? t('dubOn') : t('dubOff');
    btn.classList.toggle('active', dubEnabled);
  };

  const speakVideoDubbingMs = (videoKey) => {
    if (!dubEnabled || !prefs.sound || lang !== 'ms') return;
    const v = I.getVideo('ms', videoKey);
    const lines = v.cues.map((c) => c[2]).join(' ');
    TTS.speak(lines, 'ms', { rate: 0.92 });
  };

  $('#quiz-dub-toggle').addEventListener('click', () => {
    dubEnabled = !dubEnabled;
    renderDubButton();
    if (!dubEnabled) {
      quizVideo.muted = true;
      TTS.stop();
    } else if (quiz.current) {
      if (lang === 'en') {
        quizVideo.muted = false;
        quizVideo.currentTime = 0;
        quizVideo.play().catch(() => {});
      } else {
        quizVideo.muted = true;
        quizVideo.currentTime = 0;
        quizVideo.play().catch(() => {});
        speakVideoDubbingMs(quiz.current.video);
      }
    }
  });

  $('#quiz-read-btn').addEventListener('click', () => {
    if (!quiz.current) return;
    const opts = $$('#quiz-options .q-text').map((elNode, i) => `${'ABCD'[i]}: ${elNode.textContent}`).join('. ');
    quizVideo.muted = true;
    TTS.speak(`${quiz.current.q}. ${opts}`, lang, { rate: 0.9 });
  });

  const getActiveQuizPool = () => {
    const teacherQs = customQuestions
      .filter((cq) => cq.active !== false)
      .map((cq) => I.localizeCustomQuiz(lang, cq));
    return [...teacherQs, ...I.getBuiltInQuiz(lang)];
  };

  const fmtVttTime = (sec) => {
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const ms = Math.round((sec % 1) * 1000).toString().padStart(3, '0');
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    return `00:${m}:${s}.${ms}`;
  };

  const loadQuizVideo = (videoKey) => {
    const v = I.getVideo(lang, videoKey);
    if (trackBlobUrl) URL.revokeObjectURL(trackBlobUrl);
    const vtt = 'WEBVTT\n\n' + v.cues
      .map(([start, end, text]) => `${fmtVttTime(start)} --> ${fmtVttTime(end)}\n${text}`)
      .join('\n\n');
    trackBlobUrl = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
    TTS.stop();
    quizVideo.pause();
    quizVideo.querySelectorAll('track').forEach((tr) => tr.remove());
    quizVideo.src = v.src;
    quizVideo.append(el('track', {
      kind: 'captions', srclang: lang, label: lang === 'ms' ? 'Bahasa Melayu' : 'English',
      default: true, src: trackBlobUrl,
    }));
    // English uses baked-in MP4 voice + music track; BM plays synced Malay voice dubbing!
    quizVideo.muted = !(dubEnabled && prefs.sound && lang === 'en');
    quizVideo.load();
    $('#quiz-video-caption').textContent = t('videoCluePrefix', { label: v.label });
    $('#quiz-transcript-text').textContent = `${v.caption} ${t('videoCaptionsWord')} ${v.cues.map((c) => c[2]).join(' ')}`;
    $('#quiz-transcript-box').open = false;
    renderDubButton();
    if (!reducedMotion() && !prefs.animPaused) {
      quizVideo.play().then(() => {
        if (lang === 'ms') speakVideoDubbingMs(videoKey);
      }).catch(() => {
        // Fallback if browser blocks unmuted autoplay before gesture
        quizVideo.muted = true;
        quizVideo.play().catch(() => {});
      });
    }
  };

  const nextQuiz = () => {
    if (quiz.idx >= quiz.questions.length) {
      endGame('quiz', quiz.score, t('quizResultScore', { score: quiz.score, total: quiz.questions.length }),
        quiz.score >= 8 ? t('quizResultGood') : t('quizResultTry'));
      return;
    }
    const q = quiz.questions[quiz.idx];
    quiz.current = q;
    quiz.idx += 1;
    $('#quiz-num').textContent = quiz.idx;
    $('#quiz-total-num').textContent = quiz.questions.length;
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
    qSave.textContent = t('quizSaveNote');
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
    $('#quiz-explain-text').textContent = ok
      ? t('quizCorrect', { why: quiz.current.why })
      : t('quizWrong', { ans: quiz.current.a[0], why: quiz.current.why });
    ex.hidden = false;
    $('#quiz-next').textContent = quiz.idx >= quiz.questions.length ? t('seeResults') : t('quizNext');
    if (e.detail === 0) $('#quiz-next').focus();
  });

  $('#quiz-save-note').addEventListener('click', () => {
    if (!quiz.current || !user) return;
    const q = quiz.current;
    const added = addPersonalNote(q.q, 'fact', `${q.a[0]}\n${q.why}`);
    const btn = $('#quiz-save-note');
    btn.textContent = added ? t('quizSavedNote') : t('quizAlreadyNote');
    btn.disabled = true;
    sfx('good');
    toast(added ? t('quizSavedToast') : t('quizAlreadyToast'));
  });

  $('#quiz-next').addEventListener('click', (e) => {
    nextQuiz();
    if (e.detail === 0) $('.quiz-btn')?.focus();
  });

  const startQuiz = () => {
    // Prioritize teacher's custom active questions so students definitely see them, then fill to 10 with built-ins
    const teacherQs = shuffle(customQuestions.filter((cq) => cq.active !== false).map((cq) => I.localizeCustomQuiz(lang, cq)));
    const builtIns = shuffle(I.getBuiltInQuiz(lang));
    const picked = [...teacherQs, ...builtIns].slice(0, ROUNDS);
    Object.assign(quiz, { idx: 0, score: 0, questions: shuffle(picked) });
    nextQuiz();
  };

  // ───────── STUDENT: Notes (Teacher Class Notes + Personal Field Notes) ─────────
  let noteFilter = 'all';
  let editingNoteId = null;

  const renderNoteFilterChips = () => {
    const tags = I.UI[lang].tags;
    const chips = [
      ['all', t('filterAll'), ''],
      ['herbivore', tags.herbivore, 'chip-herbivore'],
      ['carnivore', tags.carnivore, 'chip-carnivore'],
      ['omnivore', tags.omnivore, 'chip-omnivore'],
      ['foodchain', tags.foodchain, ''],
      ['fact', tags.fact, ''],
      ['general', tags.general, ''],
    ];
    $('#student-note-filters').replaceChildren(...chips.map(([val, lbl, cls]) => {
      const b = el('button', { type: 'button', className: `chip ${cls}`.trim(), textContent: lbl });
      b.dataset.noteFilter = val;
      b.setAttribute('aria-pressed', String(noteFilter === val));
      b.addEventListener('click', () => {
        noteFilter = val;
        renderNoteFilterChips();
        renderStudentNotes();
      });
      return b;
    }));
  };

  function addPersonalNote(title, tag, body) {
    if (!user) return false;
    const exists = user.personalNotes.some((n) => n.title.toLowerCase() === title.toLowerCase());
    if (exists) return false;
    user.personalNotes.unshift({
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.slice(0, 80),
      tag: TAG_KEYS.includes(tag) ? tag : 'general',
      body: body.slice(0, 1000),
      pinned: false,
      updatedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    });
    persistUser();
    if (current === 'notes') renderStudentNotes();
    return true;
  }

  const resetNoteForm = () => {
    editingNoteId = null;
    $('#note-form').reset();
    $('#composer-title').textContent = t('addFieldNoteHead');
    $('#note-submit').textContent = t('noteSaveBtn');
    $('#note-cancel').hidden = true;
  };

  const renderStudentNotes = () => {
    const tags = I.UI[lang].tags;
    // 1. Teacher Class Notes (read-only for students)
    const cnList = $('#student-class-notes');
    $('#student-class-notes-empty').hidden = classNotes.length > 0;
    cnList.replaceChildren(...classNotes.map((cn) => {
      const title = (lang === 'ms' && cn.titleMs) ? cn.titleMs : cn.titleEn;
      const body = (lang === 'ms' && cn.bodyMs) ? cn.bodyMs : cn.bodyEn;
      const li = el('li', { className: `class-note-card${cn.pinned ? ' pinned' : ''}` });
      const head = el('div', { className: 'study-card-head' });
      const speakBtn = el('button', { type: 'button', className: 'tts-pill', textContent: t('ttsListen') });
      speakBtn.addEventListener('click', () => TTS.speak(`${title}. ${body}`, lang));
      head.append(el('h3', { textContent: `${cn.pinned ? '⭐ ' : ''}${title}` }), speakBtn);
      li.append(
        head,
        el('div', { className: 'note-meta' }, `
          <span class="note-tag-pill tag-${cn.tag}">${tags[cn.tag] || tags.general}</span>
          <span class="note-tag-pill">${t('teacherNoteBadge')} · ${cn.authorName || ''}</span>`),
        el('p', { className: 'note-body', textContent: body })
      );
      return li;
    }));

    // 2. Personal Field Notes
    const notes = user?.personalNotes || [];
    const filtered = notes
      .filter((n) => noteFilter === 'all' || n.tag === noteFilter)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
    $('#notes-count').textContent = notes.length;
    $('#export-notes').disabled = notes.length === 0;
    $('#notes-empty').hidden = filtered.length > 0;
    $('#notes-empty').textContent = notes.length === 0 ? t('notesEmptyNone') : t('notesEmptyFilter');

    $('#notes-list').replaceChildren(...filtered.map((n) => {
      const li = el('li', { className: `note-item${n.pinned ? ' pinned' : ''}` });
      const top = el('div', { className: 'note-top' });
      const actions = el('div', { className: 'note-actions' });
      const pinBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: n.pinned ? '⭐' : '☆', ariaLabel: `Pin: ${n.title}` });
      pinBtn.dataset.action = 'pin'; pinBtn.dataset.id = n.id;
      const editBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: '✏️', ariaLabel: `Edit: ${n.title}` });
      editBtn.dataset.action = 'edit'; editBtn.dataset.id = n.id;
      const delBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: '🗑️', ariaLabel: `Delete: ${n.title}` });
      delBtn.dataset.action = 'delete'; delBtn.dataset.id = n.id;
      actions.append(pinBtn, editBtn, delBtn);
      top.append(el('h3', { className: 'note-title', textContent: n.title }), actions);

      const meta = el('div', { className: 'note-meta' });
      meta.append(
        el('span', { className: `note-tag-pill tag-${n.tag}`, textContent: tags[n.tag] || tags.general }),
        el('span', { className: 'note-date', textContent: n.updatedAt || '' })
      );
      li.append(top, meta, el('p', { className: 'note-body', textContent: n.body }));
      return li;
    }));
  };

  $('#note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!user) return;
    const title = $('#note-title').value.trim();
    const tag = $('#note-tag').value;
    const body = $('#note-body').value.trim();
    if (!title || !body) return;
    const stamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (editingNoteId) {
      const target = user.personalNotes.find((n) => n.id === editingNoteId);
      if (target) Object.assign(target, { title, tag, body, updatedAt: stamp });
      toast(t('noteUpdatedToast'));
    } else {
      user.personalNotes.unshift({
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title, tag, body, pinned: false, updatedAt: stamp,
      });
      toast(t('noteSavedToast'));
    }
    persistUser();
    resetNoteForm();
    renderStudentNotes();
    sfx('good');
  });
  $('#note-cancel').addEventListener('click', () => { resetNoteForm(); $('#note-title').focus(); });

  $('#notes-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.note-icon-btn');
    if (!btn || !user) return;
    const note = user.personalNotes.find((n) => n.id === btn.dataset.id);
    if (!note) return;
    const act = btn.dataset.action;
    if (act === 'pin') {
      note.pinned = !note.pinned;
      persistUser();
      renderStudentNotes();
      sfx('pop');
    } else if (act === 'edit') {
      editingNoteId = note.id;
      $('#note-title').value = note.title;
      $('#note-tag').value = note.tag;
      $('#note-body').value = note.body;
      $('#composer-title').textContent = t('editFieldNoteHead');
      $('#note-submit').textContent = t('noteUpdateBtn');
      $('#note-cancel').hidden = false;
      $('#note-title').focus();
    } else if (act === 'delete') {
      user.personalNotes = user.personalNotes.filter((n) => n.id !== note.id);
      if (editingNoteId === note.id) resetNoteForm();
      persistUser();
      renderStudentNotes();
      sfx('pop');
      toast(t('noteDeletedToast'));
    }
  });

  $('#export-notes').addEventListener('click', () => {
    if (!user?.personalNotes?.length) return;
    const tags = I.UI[lang].tags;
    const lines = [
      'ANIMAL DIET 101 — MY FIELD NOTES',
      '================================',
      '',
      ...user.personalNotes.map((n) => `${n.pinned ? '[PINNED] ' : ''}${n.title} (${tags[n.tag] || n.tag})\n${n.body}\n`),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    el('a', { href: url, download: 'animal-diet-101-notes.txt' }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(t('noteExportToast'));
  });

  // ───────── TEACHER: Dashboard & Full Leaderboard ─────────
  let teacherStudentFilter = '';
  $('#teacher-student-search').addEventListener('input', (e) => {
    teacherStudentFilter = e.target.value.trim().toLowerCase();
    renderTeacherDashboard();
  });

  const renderTeacherDashboard = () => {
    const count = allStudents.length;
    const avg = count ? Math.round(allStudents.reduce((s, u) => s + (u.totalScore || 0), 0) / count) : 0;
    const top = count ? `${allStudents[0].username} (${allStudents[0].totalScore || 0})` : '—';
    const totalQ = window.DIET_DATA.QUIZ.length + customQuestions.filter((q) => q.active !== false).length;

    const kpis = [
      ['🎓', count, t('tStatStudents')],
      ['📈', avg, t('tStatAvg')],
      ['🥇', top, t('tStatTop')],
      ['🧠', totalQ, t('tStatQuestions')],
      ['📝', classNotes.length, t('tStatNotes')],
    ];
    $('#teacher-stats').replaceChildren(...kpis.map(([icon, val, lbl]) =>
      el('div', { className: 'stat-card' }, `
        <span class="s-icon" aria-hidden="true">${icon}</span>
        <strong class="s-val">${val}</strong>
        <span class="s-lbl">${lbl}</span>`)));

    const filtered = allStudents.filter((s) => (s.username || '').toLowerCase().includes(teacherStudentFilter));
    renderLeaderboardTable('#teacher-roster-table', '#teacher-roster-head', '#teacher-roster-body', '#teacher-roster-empty', filtered);
  };

  const renderTeacherLeaderboard = () => {
    const top3 = allStudents.slice(0, 3);
    const medals = ['🥇', '🥈', '🥉'];
    $('#teacher-podium').replaceChildren(...top3.map((s, i) =>
      el('div', { className: `podium-card rank-${i + 1}` }, `
        <span class="podium-medal" aria-hidden="true">${medals[i]}</span>
        <strong class="podium-name"></strong>
        <span class="podium-score">${s.totalScore || 0} pts · 🧠 ${s.best?.quiz || 0}/10 · 🧺 ${s.best?.sort || 0}</span>`)));
    $$('#teacher-podium .podium-name').forEach((n, i) => { n.textContent = top3[i].username; });
    $('#teacher-podium').hidden = top3.length === 0;
    renderLeaderboardTable('#teacher-lb-table', '#teacher-lb-head', '#teacher-lb-body', '#teacher-lb-empty', allStudents);
  };

  // ───────── TEACHER: Manage Quiz Questions ─────────
  let editingQuizId = null;

  const resetTeacherQuizForm = () => {
    editingQuizId = null;
    $('#tquiz-form').reset();
    $('#tquiz-form-title').textContent = t('tQuizAddHead');
    $('#tq-submit').textContent = t('tqSaveBtn');
    $('#tq-cancel').hidden = true;
  };

  const renderTeacherQuiz = () => {
    $('#tquiz-count').textContent = customQuestions.length;
    $('#tquiz-builtin-info').textContent = t('tqBuiltInInfo', { n: window.DIET_DATA.QUIZ.length });
    $('#tquiz-empty').hidden = customQuestions.length > 0;

    $('#tquiz-list').replaceChildren(...customQuestions.map((cq) => {
      const loc = I.localizeCustomQuiz(lang, cq);
      const v = I.getVideo(lang, cq.video);
      const li = el('li', { className: `note-item${cq.active === false ? '' : ' pinned'}` });
      const top = el('div', { className: 'note-top' });
      const actions = el('div', { className: 'note-actions' });

      const togBtn = el('button', {
        type: 'button', className: 'note-icon-btn',
        textContent: cq.active === false ? '🙈' : '👁️',
        ariaLabel: `Toggle visibility: ${loc.q}`,
      });
      togBtn.dataset.action = 'toggle'; togBtn.dataset.id = cq.id;
      const editBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: '✏️', ariaLabel: `Edit question: ${loc.q}` });
      editBtn.dataset.action = 'edit'; editBtn.dataset.id = cq.id;
      const delBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: '🗑️', ariaLabel: `Delete question: ${loc.q}` });
      delBtn.dataset.action = 'delete'; delBtn.dataset.id = cq.id;
      actions.append(togBtn, editBtn, delBtn);

      top.append(el('h3', { className: 'note-title', textContent: loc.q }), actions);
      const meta = el('div', { className: 'note-meta' });
      meta.append(
        el('span', { className: `note-tag-pill ${cq.active === false ? 'tag-carnivore' : 'tag-herbivore'}`, textContent: cq.active === false ? t('tqHiddenBadge') : t('tqActiveBadge') }),
        el('span', { className: 'note-tag-pill', textContent: `🎬 ${v.label}` })
      );
      const ul = el('ul', { className: 'q-opts-preview' });
      loc.a.forEach((opt, i) => ul.append(el('li', { textContent: `${i === 0 ? '✅ ' : ''}${opt}` })));
      li.append(top, meta, ul);
      if (loc.why) li.append(el('p', { className: 'field-hint', textContent: `💡 ${loc.why}` }));
      return li;
    }));
  };

  $('#tquiz-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const qEn = $('#tq-q-en').value.trim();
    const qMs = $('#tq-q-ms').value.trim();
    const aEn = [1, 2, 3, 4].map((i) => $(`#tq-opt${i}-en`).value.trim());
    const aMsRaw = [1, 2, 3, 4].map((i) => $(`#tq-opt${i}-ms`).value.trim());
    const aMs = aMsRaw.map((v, i) => v || aEn[i]);
    if (!qEn || aEn.some((v) => !v)) return;

    await DB.saveQuestion({
      qEn,
      qMs: qMs || qEn,
      aEn,
      aMs,
      whyEn: $('#tq-why-en').value.trim(),
      whyMs: $('#tq-why-ms').value.trim() || $('#tq-why-en').value.trim(),
      video: $('#tq-video').value || 'herbivore-meadow',
      active: true,
      createdBy: user?.username || 'Teacher',
    }, editingQuizId);

    const wasEdit = Boolean(editingQuizId);
    resetTeacherQuizForm();
    sfx('good');
    toast(wasEdit ? t('tqUpdatedToast') : t('tqSavedToast'));
  });

  $('#tq-cancel').addEventListener('click', () => { resetTeacherQuizForm(); $('#tq-q-en').focus(); });

  $('#tquiz-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('.note-icon-btn');
    if (!btn) return;
    const cq = customQuestions.find((x) => x.id === btn.dataset.id);
    if (!cq) return;
    const act = btn.dataset.action;
    if (act === 'toggle') {
      await DB.saveQuestion({ ...cq, active: cq.active === false }, cq.id);
      sfx('pop');
    } else if (act === 'edit') {
      editingQuizId = cq.id;
      $('#tq-q-en').value = cq.qEn || '';
      $('#tq-q-ms').value = cq.qMs || '';
      $('#tq-video').value = cq.video || 'herbivore-meadow';
      for (let i = 1; i <= 4; i++) {
        $(`#tq-opt${i}-en`).value = cq.aEn?.[i - 1] || '';
        $(`#tq-opt${i}-ms`).value = cq.aMs?.[i - 1] || '';
      }
      $('#tq-why-en').value = cq.whyEn || '';
      $('#tq-why-ms').value = cq.whyMs || '';
      $('#tquiz-form-title').textContent = t('tQuizEditHead');
      $('#tq-submit').textContent = t('tqUpdateBtn');
      $('#tq-cancel').hidden = false;
      $('#tq-q-en').focus();
    } else if (act === 'delete') {
      await DB.deleteQuestion(cq.id);
      if (editingQuizId === cq.id) resetTeacherQuizForm();
      sfx('pop');
      toast(t('tqDeletedToast'));
    }
  });

  // ───────── TEACHER: Manage Class Notes ─────────
  let editingClassNoteId = null;

  const resetTeacherNoteForm = () => {
    editingClassNoteId = null;
    $('#tnotes-form').reset();
    $('#tnotes-form-title').textContent = t('tNotesAddHead');
    $('#tn-submit').textContent = t('tnSaveBtn');
    $('#tn-cancel').hidden = true;
  };

  const renderTeacherNotes = () => {
    const tags = I.UI[lang].tags;
    $('#tnotes-count').textContent = classNotes.length;
    $('#tnotes-empty').hidden = classNotes.length > 0;

    $('#tnotes-list').replaceChildren(...classNotes.map((cn) => {
      const title = (lang === 'ms' && cn.titleMs) ? cn.titleMs : cn.titleEn;
      const body = (lang === 'ms' && cn.bodyMs) ? cn.bodyMs : cn.bodyEn;
      const li = el('li', { className: `note-item${cn.pinned ? ' pinned' : ''}` });
      const top = el('div', { className: 'note-top' });
      const actions = el('div', { className: 'note-actions' });

      const pinBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: cn.pinned ? '⭐' : '☆', ariaLabel: `Pin class note: ${title}` });
      pinBtn.dataset.action = 'pin'; pinBtn.dataset.id = cn.id;
      const editBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: '✏️', ariaLabel: `Edit class note: ${title}` });
      editBtn.dataset.action = 'edit'; editBtn.dataset.id = cn.id;
      const delBtn = el('button', { type: 'button', className: 'note-icon-btn', textContent: '🗑️', ariaLabel: `Delete class note: ${title}` });
      delBtn.dataset.action = 'delete'; delBtn.dataset.id = cn.id;
      actions.append(pinBtn, editBtn, delBtn);

      top.append(el('h3', { className: 'note-title', textContent: title }), actions);
      const meta = el('div', { className: 'note-meta' });
      meta.append(
        el('span', { className: `note-tag-pill tag-${cn.tag}`, textContent: tags[cn.tag] || tags.general }),
        el('span', { className: 'note-date', textContent: cn.authorName || '' })
      );
      li.append(top, meta, el('p', { className: 'note-body', textContent: body }));
      return li;
    }));
  };

  $('#tnotes-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleEn = $('#tn-title-en').value.trim();
    const bodyEn = $('#tn-body-en').value.trim();
    if (!titleEn || !bodyEn) return;
    await DB.saveClassNote({
      titleEn,
      titleMs: $('#tn-title-ms').value.trim() || titleEn,
      bodyEn,
      bodyMs: $('#tn-body-ms').value.trim() || bodyEn,
      tag: $('#tn-tag').value,
      pinned: $('#tn-pinned').checked,
      authorName: user?.username || 'Teacher',
    }, editingClassNoteId);
    const wasEdit = Boolean(editingClassNoteId);
    resetTeacherNoteForm();
    sfx('good');
    toast(wasEdit ? t('tnUpdatedToast') : t('tnSavedToast'));
  });

  $('#tn-cancel').addEventListener('click', () => { resetTeacherNoteForm(); $('#tn-title-en').focus(); });

  $('#tnotes-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('.note-icon-btn');
    if (!btn) return;
    const cn = classNotes.find((x) => x.id === btn.dataset.id);
    if (!cn) return;
    const act = btn.dataset.action;
    if (act === 'pin') {
      await DB.saveClassNote({ ...cn, pinned: !cn.pinned }, cn.id);
      sfx('pop');
    } else if (act === 'edit') {
      editingClassNoteId = cn.id;
      $('#tn-title-en').value = cn.titleEn || '';
      $('#tn-title-ms').value = cn.titleMs || '';
      $('#tn-tag').value = cn.tag || 'general';
      $('#tn-body-en').value = cn.bodyEn || '';
      $('#tn-body-ms').value = cn.bodyMs || '';
      $('#tn-pinned').checked = Boolean(cn.pinned);
      $('#tnotes-form-title').textContent = t('tNotesEditHead');
      $('#tn-submit').textContent = t('tnUpdateBtn');
      $('#tn-cancel').hidden = false;
      $('#tn-title-en').focus();
    } else if (act === 'delete') {
      await DB.deleteClassNote(cn.id);
      if (editingClassNoteId === cn.id) resetTeacherNoteForm();
      sfx('pop');
      toast(t('tnDeletedToast'));
    }
  });

  // ───────── Game Control & Role-Separated Routing ─────────
  const STARTERS = { sort: startSort, feed: startFeed, quiz: startQuiz };

  function stopGames() {
    clearInterval(sort.timer);
    clearTimeout(sort.next);
    sort.timer = null;
    sort.locked = true;
    quizVideo.pause();
    TTS.stop();
    endDrag();
  }

  // ───────── AI Assistant (Diet Buddy — Student + Teacher) ─────────
  const aiDialog = $('#ai-dialog');
  const aiMessages = $('#ai-messages');
  const aiInput = $('#ai-input');
  let aiChat = []; // { from: 'bot'|'me', text: string }

  const appendFormattedText = (container, text) => {
    const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        container.append(el('strong', { textContent: part.slice(2, -2) }));
      } else {
        container.append(document.createTextNode(part));
      }
    });
  };

  const renderAiMessages = () => {
    aiMessages.replaceChildren(...aiChat.map((m) => {
      const bubble = el('div', { className: `ai-msg ${m.from}` });
      appendFormattedText(bubble, m.text);
      if (m.from === 'bot') {
        const tools = el('div', { className: 'ai-msg-tools' });
        const speakBtn = el('button', { type: 'button', className: 'tts-pill', textContent: t('ttsListen') });
        speakBtn.addEventListener('click', () => TTS.speak(m.text.replace(/\*\*/g, ''), lang));
        tools.append(speakBtn);
        bubble.append(tools);
      }
      return bubble;
    }));
    aiMessages.scrollTop = aiMessages.scrollHeight;
  };

  function renderAiChrome() {
    if (!user) return;
    const isTeacher = user.role === 'teacher';
    $('#ai-subtitle').textContent = isTeacher ? t('aiSubtitleTeacher') : t('aiSubtitleStudent');
    const chips = isTeacher ? I.UI[lang].aiTeacherChips : I.UI[lang].aiStudentChips;
    $('#ai-chips').replaceChildren(...chips.map((qText) => {
      const b = el('button', { type: 'button', className: 'ai-chip', textContent: qText });
      b.addEventListener('click', () => submitAiQuestion(qText));
      return b;
    }));
    $('#ai-gemini-key').value = AI.getApiKey();
    if (!aiChat.length) {
      aiChat.push({
        from: 'bot',
        text: isTeacher ? t('aiWelcomeTeacher', { name: user.username }) : t('aiWelcomeStudent', { name: user.username }),
      });
    }
    renderAiMessages();
  }

  async function submitAiQuestion(raw) {
    const q = String(raw || '').trim();
    if (!q || !user) return;
    aiChat.push({ from: 'me', text: q });
    const thinking = { from: 'bot', text: t('aiThinking') };
    aiChat.push(thinking);
    renderAiMessages();
    const res = await AI.ask(q, { lang, role: user.role, userName: user.username });
    thinking.text = res.text;
    renderAiMessages();
    sfx('pop');
  }

  $('#ai-fab').addEventListener('click', () => {
    aiChat = [];
    AI.resetContext?.();
    renderAiChrome();
    aiDialog.showModal();
    sfx('pop');
  });
  aiDialog.addEventListener('close', () => TTS.stop());

  $('#ai-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = aiInput.value.trim();
    if (!val) return;
    aiInput.value = '';
    submitAiQuestion(val);
  });

  // IME-safe Enter-to-submit (per modern-web-guidance ime-safe-enter-submit)
  aiInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (event.isComposing || event.keyCode === 229) return;
      $('#ai-form').requestSubmit();
    }
  });

  $('#ai-save-key').addEventListener('click', () => {
    const key = $('#ai-gemini-key').value.trim();
    AI.setApiKey(key);
    toast(key ? t('aiKeySaved') : t('aiKeyCleared'));
  });

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
    if (viaKeyboard) {
      const first = { sort: '.bin', feed: '.food-btn', quiz: '.quiz-btn' }[mode];
      $(`#${mode}-game ${first}`)?.focus();
    }
  }

  $$('[data-start]').forEach((b) => b.addEventListener('click', (e) => startGame(b.dataset.start, e.detail === 0)));

  const STUDENT_SCREENS = ['home', 'learn', 'sort', 'feed', 'quiz', 'notes', 'profile'];
  const TEACHER_SCREENS = ['teacher-home', 'teacher-leaderboard', 'teacher-quiz', 'teacher-notes'];

  function refreshActiveScreen() {
    if (current === 'home') renderHome();
    else if (current === 'learn') renderGrid();
    else if (current === 'notes') renderStudentNotes();
    else if (current === 'profile') renderProfile();
    else if (current === 'teacher-home') renderTeacherDashboard();
    else if (current === 'teacher-leaderboard') renderTeacherLeaderboard();
    else if (current === 'teacher-quiz') renderTeacherQuiz();
    else if (current === 'teacher-notes') renderTeacherNotes();
    else if (current === 'sort' && sort.current && !$('#sort-game').hidden) {
      $('#sort-name').textContent = I.getAnimal(lang, sort.current).name;
    } else if (current === 'feed' && feed.current && !$('#feed-game').hidden && $('#feed-explain').hidden) {
      renderFeedRound();
    } else if (current === 'quiz' && quiz.current && !$('#quiz-game').hidden) {
      loadQuizVideo(quiz.current.video);
    }
    if (animalDialog.open && activeAnimalId) renderAnimalDialog(activeAnimalId, false);
  }

  const showScreen = (name, moveFocus = true) => {
    stopGames();
    resetPanels();
    $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    current = name;
    refreshActiveScreen();
    const h1 = $(`[data-screen="${name}"] h1`);
    document.title = name === 'home' || name === 'login'
      ? t('pageTitleHome')
      : `${h1.textContent.replace(/^\S+\s/, '')} · Animal Diet 101`;
    window.scrollTo({ top: 0 });
    if (moveFocus) h1?.focus({ preventScroll: true });
  };

  function resolveTargetScreen() {
    const hash = location.hash.slice(1);
    if (!user) return 'login';
    if (user.role === 'teacher') {
      return TEACHER_SCREENS.includes(hash) ? hash : 'teacher-home';
    }
    return STUDENT_SCREENS.includes(hash) ? hash : 'home';
  }

  function route(force = false) {
    const target = resolveTargetScreen();
    if (!force && target === current) return;
    if (document.startViewTransition && !reducedMotion() && current) {
      const vt = document.startViewTransition(() => showScreen(target));
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
      vt.updateCallbackDone.catch(() => {});
    } else {
      showScreen(target, current !== null);
    }
  }
  window.addEventListener('hashchange', () => route(false));

  // ───────── Reset Student Progress ─────────
  const resetDialog = $('#reset-dialog');
  $('#reset-progress').addEventListener('click', () => resetDialog.showModal());
  resetDialog.addEventListener('close', async () => {
    const choice = resetDialog.returnValue;
    resetDialog.returnValue = '';
    if (choice !== 'reset' || !user) return;
    Object.assign(user, { best: { sort: 0, feed: 0, quiz: 0 }, bestStreak: 0, seen: [], badges: [], personalNotes: [], totalScore: 0 });
    await persistUser();
    resetNoteForm();
    refreshActiveScreen();
    toast(t('resetDoneToast'));
  });

  // ───────── Boot ─────────
  (async function boot() {
    await DB.init();

    // Live subscriptions (Firestore onSnapshot or Local cross-tab sync)
    DB.subscribe('students', (list) => {
      allStudents = list;
      if (['home', 'profile', 'teacher-home', 'teacher-leaderboard'].includes(current)) refreshActiveScreen();
    });
    DB.subscribe('questions', (list) => {
      customQuestions = list;
      if (['quiz', 'teacher-home', 'teacher-quiz'].includes(current)) {
        const qCount = Math.min(10, getActiveQuizPool().length);
        $('#quiz-sub').textContent = t('quizSub', { count: qCount });
        $('#quiz-start-desc').innerHTML = t('quizStartDesc', { count: qCount });
        refreshActiveScreen();
      }
    });
    DB.subscribe('classNotes', (list) => {
      classNotes = list;
      if (['notes', 'teacher-home', 'teacher-notes'].includes(current)) refreshActiveScreen();
    });

    if (DB.getSession()) {
      user = await DB.getCurrentUser();
    }
    renderStaticLocalized();
    route(true);
  })();
})();
