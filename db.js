/* Animal Diet 101 — Database Layer (Google Firebase Cloud Firestore + Local Fallback) */
'use strict';

window.AD101_DB = (() => {
  const SESSION_KEY = 'ad101-session-v2';
  const LOCAL_DB_KEY = 'ad101-local-db-v2';
  const PREFS_KEY = 'ad101-prefs-v2';

  let mode = 'local'; // 'firebase' | 'local'
  let fb = null; // { db, auth, uid, fns }
  let activeSession = null; // { userDocId, username, role }
  const listeners = { students: new Set(), questions: new Set(), classNotes: new Set() };
  let fbUnsubs = [];

  const readJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
  };
  const writeJson = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  };

  const getLocalDb = () => {
    const raw = readJson(LOCAL_DB_KEY, null);
    if (raw && typeof raw === 'object') {
      return {
        users: raw.users || {},
        quizQuestions: raw.quizQuestions || {},
        classNotes: raw.classNotes || {},
      };
    }
    return { users: {}, quizQuestions: {}, classNotes: {} };
  };
  const setLocalDb = (data) => writeJson(LOCAL_DB_KEY, data);

  const getPrefs = () => ({
    lang: 'en',
    sound: true,
    animPaused: false,
    ...readJson(PREFS_KEY, {}),
  });
  const savePrefs = (patch) => {
    const next = { ...getPrefs(), ...patch };
    writeJson(PREFS_KEY, next);
    return next;
  };

  const normalizeName = (name) =>
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 32) || 'user';

  const makeUserDocId = (role, username) => `${role}_${normalizeName(username)}`;

  const computeTotalScore = (best = {}, seen = [], badges = []) =>
    (Number(best.sort) || 0) +
    (Number(best.feed) || 0) * 15 +
    (Number(best.quiz) || 0) * 20 +
    (Array.isArray(seen) ? seen.length : 0) * 2 +
    (Array.isArray(badges) ? badges.length : 0) * 25;

  const freshUserDoc = (username, role, ownerUid = 'local') => ({
    username: username.trim().slice(0, 40),
    usernameLower: username.trim().toLowerCase().slice(0, 40),
    role,
    totalScore: 0,
    best: { sort: 0, feed: 0, quiz: 0 },
    bestStreak: 0,
    seen: [],
    badges: [],
    personalNotes: [],
    ownerUid,
    updatedAt: Date.now(),
  });

  const sortStudents = (list) =>
    [...list].sort((a, b) =>
      (b.totalScore || 0) - (a.totalScore || 0) ||
      ((b.best?.quiz || 0) - (a.best?.quiz || 0)) ||
      ((b.best?.sort || 0) - (a.best?.sort || 0)) ||
      (a.username || '').localeCompare(b.username || '')
    );

  const notifyLocal = (channel) => {
    const local = getLocalDb();
    if (channel === 'students' || channel === 'all') {
      const students = sortStudents(
        Object.entries(local.users)
          .map(([id, u]) => ({ id, ...u }))
          .filter((u) => u.role === 'student')
      );
      listeners.students.forEach((cb) => cb(students));
    }
    if (channel === 'questions' || channel === 'all') {
      const qs = Object.entries(local.quizQuestions)
        .map(([id, q]) => ({ id, ...q }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      listeners.questions.forEach((cb) => cb(qs));
    }
    if (channel === 'classNotes' || channel === 'all') {
      const notes = Object.entries(local.classNotes)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.updatedAt || 0) - (a.updatedAt || 0));
      listeners.classNotes.forEach((cb) => cb(notes));
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_DB_KEY && mode === 'local') notifyLocal('all');
  });

  const hasValidFirebaseConfig = () => {
    const cfg = window.FIREBASE_CONFIG;
    return Boolean(cfg && cfg.apiKey && cfg.projectId && cfg.appId);
  };

  async function init() {
    activeSession = readJson(SESSION_KEY, null);
    if (!hasValidFirebaseConfig()) {
      mode = 'local';
      return { mode };
    }
    try {
      const base = 'https://www.gstatic.com/firebasejs/11.10.0';
      const [appMod, authMod, fsMod] = await Promise.all([
        import(`${base}/firebase-app.js`),
        import(`${base}/firebase-auth.js`),
        import(`${base}/firebase-firestore.js`),
      ]);
      const cfg = {
        ...window.FIREBASE_CONFIG,
        authDomain: window.FIREBASE_CONFIG.authDomain || `${window.FIREBASE_CONFIG.projectId}.firebaseapp.com`,
        storageBucket: window.FIREBASE_CONFIG.storageBucket || `${window.FIREBASE_CONFIG.projectId}.firebasestorage.app`,
      };
      const app = appMod.initializeApp(cfg);
      const auth = authMod.getAuth(app);
      const db = fsMod.getFirestore(app);
      // Wait for Firebase Auth to restore any existing persisted Teacher/Student session
      const existingUser = await new Promise((resolve) => {
        const unsub = authMod.onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
      });
      const currentAuthUser = existingUser || (await authMod.signInAnonymously(auth)).user;
      fb = { app, auth, db, uid: currentAuthUser.uid, authMod, fns: fsMod };
      mode = 'firebase';

      // If stored session claims teacher, ensure Firebase Auth is actually email/password authenticated
      if (activeSession?.role === 'teacher' && currentAuthUser.isAnonymous) {
        activeSession = null;
        try { localStorage.removeItem(SESSION_KEY); } catch {}
      } else if (activeSession?.userDocId) {
        await writeSessionDoc(activeSession);
      }
      startFirebaseRealtime();
      return { mode };
    } catch (err) {
      console.warn('Firebase unavailable, falling back to Local Mode:', err?.message || err);
      mode = 'local';
      fb = null;
      return { mode, error: err?.message || String(err) };
    }
  }

  async function writeSessionDoc(sess) {
    if (mode !== 'firebase' || !fb) return;
    const { doc, setDoc } = fb.fns;
    await setDoc(doc(fb.db, 'sessions', fb.uid), {
      uid: fb.uid,
      role: sess.role,
      username: sess.username,
      userDocId: sess.userDocId,
      updatedAt: Date.now(),
    });
  }

  function startFirebaseRealtime() {
    fbUnsubs.forEach((u) => { try { u(); } catch {} });
    fbUnsubs = [];
    if (mode !== 'firebase' || !fb) return;
    const { collection, query, where, onSnapshot } = fb.fns;

    fbUnsubs.push(onSnapshot(
      query(collection(fb.db, 'users'), where('role', '==', 'student')),
      (snap) => {
        const list = sortStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        listeners.students.forEach((cb) => cb(list));
      },
      (err) => console.warn('Students snapshot error:', err?.message)
    ));

    fbUnsubs.push(onSnapshot(
      collection(fb.db, 'quizQuestions'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        listeners.questions.forEach((cb) => cb(list));
      },
      (err) => console.warn('Quiz snapshot error:', err?.message)
    ));

    fbUnsubs.push(onSnapshot(
      collection(fb.db, 'classNotes'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.updatedAt || 0) - (a.updatedAt || 0));
        listeners.classNotes.forEach((cb) => cb(list));
      },
      (err) => console.warn('Class notes snapshot error:', err?.message)
    ));
  }

  const simpleHash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  };

  const TEACHER_EMAIL_CACHE_KEY = 'ad101-teacher-emails';
  const getTeacherEmailCache = () => readJson(TEACHER_EMAIL_CACHE_KEY, {});
  const cacheTeacherEmail = (nameKey, email) => {
    if (!nameKey || !email) return;
    const map = getTeacherEmailCache();
    map[nameKey] = email;
    writeJson(TEACHER_EMAIL_CACHE_KEY, map);
  };

  async function resolveTeacherEmail(nameInput) {
    const raw = String(nameInput || '').trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return raw;
    const nameKey = normalizeName(raw);
    const cached = getTeacherEmailCache()[nameKey];
    if (cached) return cached;
    if (mode === 'firebase' && fb) {
      try {
        const { doc, getDoc } = fb.fns;
        const snap = await getDoc(doc(fb.db, 'teacherDirectory', nameKey));
        if (snap.exists() && snap.data()?.email) {
          cacheTeacherEmail(nameKey, snap.data().email);
          return snap.data().email;
        }
      } catch { /* fall through */ }
    }
    return '';
  }

  async function loginOrRegister(username, role, opts = {}) {
    const cleanRole = role === 'teacher' ? 'teacher' : 'student';
    let cleanEmail = String(opts.email || '').trim().toLowerCase().slice(0, 120);
    const password = String(opts.password || '');
    const authMode = opts.authMode === 'register' ? 'register' : 'signin';
    const rawName = String(username || '').trim().slice(0, 40);
    const cleanName = rawName || (cleanEmail.split('@')[0] || 'Teacher');

    if (cleanRole === 'teacher') {
      if (password.length < 6) {
        const err = new Error('WEAK_PASSWORD');
        err.code = 'ad101/weak-password';
        throw err;
      }
      if (authMode === 'register') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          const err = new Error('INVALID_EMAIL');
          err.code = 'ad101/invalid-email';
          throw err;
        }
      } else {
        // Teacher Sign In uses Name + Password (no email box needed!)
        cleanEmail = await resolveTeacherEmail(rawName);
        if (!cleanEmail) {
          const err = new Error('TEACHER_NOT_FOUND');
          err.code = 'ad101/teacher-not-found';
          throw err;
        }
      }
    }

    if (mode === 'firebase' && fb) {
      const { doc, getDoc, setDoc } = fb.fns;
      const { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } = fb.authMod;
      let uid = fb.uid;
      let userDocId;
      let isNew = false;

      if (cleanRole === 'teacher') {
        const cred = authMode === 'register'
          ? await createUserWithEmailAndPassword(fb.auth, cleanEmail, password)
          : await signInWithEmailAndPassword(fb.auth, cleanEmail, password);
        uid = cred.user.uid;
        fb.uid = uid;
        userDocId = `teacher_${uid}`;
      } else {
        // Ensure student signs in anonymously (never reusing a teacher email session)
        if (!fb.auth.currentUser || !fb.auth.currentUser.isAnonymous) {
          if (fb.auth.currentUser) await signOut(fb.auth);
          const cred = await signInAnonymously(fb.auth);
          uid = cred.user.uid;
          fb.uid = uid;
        }
        userDocId = makeUserDocId('student', cleanName);
      }

      const sess = { userDocId, username: cleanName, role: cleanRole, email: cleanRole === 'teacher' ? cleanEmail : '' };
      activeSession = sess;
      writeJson(SESSION_KEY, sess);
      await writeSessionDoc(sess);
      startFirebaseRealtime();

      const ref = doc(fb.db, 'users', userDocId);
      const snap = await getDoc(ref);
      let userDoc;
      if (snap.exists()) {
        const existing = snap.data();
        const typedEmailAsName = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawName);
        const finalName = (cleanRole === 'teacher' && (!rawName || typedEmailAsName)) ? existing.username : cleanName;
        activeSession.username = finalName;
        writeJson(SESSION_KEY, activeSession);
        await writeSessionDoc(activeSession);
        userDoc = { id: snap.id, ...existing, username: finalName, updatedAt: Date.now() };
        const patch = { username: finalName, updatedAt: Date.now() };
        if (cleanRole === 'teacher') patch.email = cleanEmail;
        await setDoc(ref, patch, { merge: true });
      } else {
        isNew = true;
        const created = freshUserDoc(cleanName, cleanRole, uid);
        if (cleanRole === 'teacher') created.email = cleanEmail;
        await setDoc(ref, created);
        userDoc = { id: userDocId, ...created };
      }

      // Save Teacher name -> email mapping so future Sign-Ins only require Name + Password!
      if (cleanRole === 'teacher' && userDoc.username && cleanEmail) {
        const nameKey = normalizeName(userDoc.username);
        cacheTeacherEmail(nameKey, cleanEmail);
        try {
          await setDoc(doc(fb.db, 'teacherDirectory', nameKey), {
            email: cleanEmail,
            ownerUid: uid,
            updatedAt: Date.now(),
          });
        } catch { /* local cache still works even before rules update */ }
      }
      return { session: activeSession, user: userDoc, isNew };
    }

    // Local Mode (offline fallback)
    const local = getLocalDb();
    if (cleanRole === 'teacher') {
      const nameKey = normalizeName(cleanName);
      if (authMode === 'register') {
        const userDocId = `teacher_${normalizeName(cleanEmail)}`;
        if (local.users[userDocId]) {
          const err = new Error('Email already registered');
          err.code = 'auth/email-already-in-use';
          throw err;
        }
        const passHash = simpleHash(`${cleanEmail}:${password}`);
        local.users[userDocId] = { ...freshUserDoc(cleanName, 'teacher', 'local'), email: cleanEmail, passHash };
        cacheTeacherEmail(nameKey, cleanEmail);
        const sess = { userDocId, username: cleanName, role: 'teacher', email: cleanEmail };
        activeSession = sess;
        writeJson(SESSION_KEY, sess);
        setLocalDb(local);
        return { session: sess, user: { id: userDocId, ...local.users[userDocId] }, isNew: true };
      }
      // Local Teacher Sign In by Name (or email) + Password
      const matchEntry = Object.entries(local.users).find(([, u]) =>
        u.role === 'teacher' &&
        (normalizeName(u.username || '') === nameKey || (u.email || '').toLowerCase() === cleanEmail)
      );
      if (!matchEntry) {
        const err = new Error('TEACHER_NOT_FOUND');
        err.code = 'ad101/teacher-not-found';
        throw err;
      }
      const [userDocId, existing] = matchEntry;
      const passHash = simpleHash(`${existing.email}:${password}`);
      if (existing.passHash && existing.passHash !== passHash) {
        const err = new Error('Invalid password');
        err.code = 'auth/invalid-credential';
        throw err;
      }
      existing.updatedAt = Date.now();
      cacheTeacherEmail(normalizeName(existing.username), existing.email);
      const sess = { userDocId, username: existing.username, role: 'teacher', email: existing.email };
      activeSession = sess;
      writeJson(SESSION_KEY, sess);
      setLocalDb(local);
      return { session: sess, user: { id: userDocId, ...existing }, isNew: false };
    }

    const userDocId = makeUserDocId('student', cleanName);
    const existed = Boolean(local.users[userDocId]);
    if (!existed) {
      local.users[userDocId] = freshUserDoc(cleanName, 'student', 'local');
    } else {
      local.users[userDocId].username = cleanName;
      local.users[userDocId].updatedAt = Date.now();
    }
    const sess = { userDocId, username: cleanName, role: 'student', email: '' };
    activeSession = sess;
    writeJson(SESSION_KEY, sess);
    setLocalDb(local);
    notifyLocal('students');
    return { session: sess, user: { id: userDocId, ...local.users[userDocId] }, isNew: !existed };
  }

  async function getCurrentUser() {
    if (!activeSession?.userDocId) return null;
    const { userDocId, username, role } = activeSession;
    if (mode === 'firebase' && fb) {
      const { doc, getDoc } = fb.fns;
      const snap = await getDoc(doc(fb.db, 'users', userDocId));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
      return (await loginOrRegister(username, role)).user;
    }
    const local = getLocalDb();
    if (local.users[userDocId]) return { id: userDocId, ...local.users[userDocId] };
    return (await loginOrRegister(username, role)).user;
  }

  async function logout() {
    const wasTeacher = activeSession?.role === 'teacher';
    activeSession = null;
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    if (mode === 'firebase' && fb) {
      try {
        const { doc, deleteDoc } = fb.fns;
        await deleteDoc(doc(fb.db, 'sessions', fb.uid));
      } catch { /* ignore */ }
      if (wasTeacher) {
        try {
          await fb.authMod.signOut(fb.auth);
          const cred = await fb.authMod.signInAnonymously(fb.auth);
          fb.uid = cred.user.uid;
        } catch { /* ignore */ }
      }
    }
  }

  async function saveUserProgress(userDocId, userObj) {
    const clean = {
      username: String(userObj.username || '').slice(0, 40),
      usernameLower: String(userObj.usernameLower || userObj.username || '').toLowerCase().slice(0, 40),
      role: userObj.role === 'teacher' ? 'teacher' : 'student',
      best: {
        sort: Math.max(0, Math.min(10000, Math.floor(Number(userObj.best?.sort) || 0))),
        feed: Math.max(0, Math.min(10, Math.floor(Number(userObj.best?.feed) || 0))),
        quiz: Math.max(0, Math.min(100, Math.floor(Number(userObj.best?.quiz) || 0))),
      },
      bestStreak: Math.max(0, Math.min(500, Math.floor(Number(userObj.bestStreak) || 0))),
      seen: Array.isArray(userObj.seen) ? userObj.seen.slice(0, 60) : [],
      badges: Array.isArray(userObj.badges) ? userObj.badges.slice(0, 20) : [],
      personalNotes: Array.isArray(userObj.personalNotes) ? userObj.personalNotes.slice(0, 200) : [],
      ownerUid: fb?.uid || userObj.ownerUid || 'local',
      updatedAt: Date.now(),
    };
    if (userObj.email) clean.email = String(userObj.email).slice(0, 120);
    clean.totalScore = computeTotalScore(clean.best, clean.seen, clean.badges);

    if (mode === 'firebase' && fb) {
      const { doc, setDoc } = fb.fns;
      await setDoc(doc(fb.db, 'users', userDocId), clean, { merge: true });
      return clean;
    }

    const local = getLocalDb();
    local.users[userDocId] = clean;
    setLocalDb(local);
    notifyLocal('students');
    return clean;
  }

  async function saveQuestion(questionData, existingId = null) {
    const id = existingId || `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const payload = {
      qEn: String(questionData.qEn || '').trim().slice(0, 240),
      qMs: String(questionData.qMs || questionData.qEn || '').trim().slice(0, 240),
      aEn: (questionData.aEn || []).slice(0, 4).map((s) => String(s).trim()),
      aMs: (questionData.aMs || questionData.aEn || []).slice(0, 4).map((s) => String(s).trim()),
      whyEn: String(questionData.whyEn || '').trim().slice(0, 400),
      whyMs: String(questionData.whyMs || questionData.whyEn || '').trim().slice(0, 400),
      video: String(questionData.video || 'herbivore-meadow').slice(0, 60),
      active: questionData.active !== false,
      createdBy: String(questionData.createdBy || activeSession?.username || 'Teacher').slice(0, 40),
      updatedAt: Date.now(),
    };

    if (mode === 'firebase' && fb) {
      const { doc, setDoc } = fb.fns;
      await setDoc(doc(fb.db, 'quizQuestions', id), payload);
      return { id, ...payload };
    }

    const local = getLocalDb();
    local.quizQuestions[id] = payload;
    setLocalDb(local);
    notifyLocal('questions');
    return { id, ...payload };
  }

  async function deleteQuestion(id) {
    if (mode === 'firebase' && fb) {
      const { doc, deleteDoc } = fb.fns;
      await deleteDoc(doc(fb.db, 'quizQuestions', id));
      return;
    }
    const local = getLocalDb();
    delete local.quizQuestions[id];
    setLocalDb(local);
    notifyLocal('questions');
  }

  async function saveClassNote(noteData, existingId = null) {
    const id = existingId || `cn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const validTags = ['herbivore', 'carnivore', 'omnivore', 'foodchain', 'fact', 'general'];
    const payload = {
      titleEn: String(noteData.titleEn || '').trim().slice(0, 120),
      titleMs: String(noteData.titleMs || noteData.titleEn || '').trim().slice(0, 120),
      bodyEn: String(noteData.bodyEn || '').trim().slice(0, 1500),
      bodyMs: String(noteData.bodyMs || noteData.bodyEn || '').trim().slice(0, 1500),
      tag: validTags.includes(noteData.tag) ? noteData.tag : 'general',
      pinned: Boolean(noteData.pinned),
      authorName: String(noteData.authorName || activeSession?.username || 'Teacher').slice(0, 40),
      updatedAt: Date.now(),
    };

    if (mode === 'firebase' && fb) {
      const { doc, setDoc } = fb.fns;
      await setDoc(doc(fb.db, 'classNotes', id), payload);
      return { id, ...payload };
    }

    const local = getLocalDb();
    local.classNotes[id] = payload;
    setLocalDb(local);
    notifyLocal('classNotes');
    return { id, ...payload };
  }

  async function deleteClassNote(id) {
    if (mode === 'firebase' && fb) {
      const { doc, deleteDoc } = fb.fns;
      await deleteDoc(doc(fb.db, 'classNotes', id));
      return;
    }
    const local = getLocalDb();
    delete local.classNotes[id];
    setLocalDb(local);
    notifyLocal('classNotes');
  }

  function subscribe(channel, cb) {
    listeners[channel].add(cb);
    if (mode === 'local') notifyLocal(channel);
    else if (mode === 'firebase' && fb) {
      // Trigger immediate initial read in case listener subscribed after init
      const { collection, getDocs, query, where } = fb.fns;
      if (channel === 'students') {
        getDocs(query(collection(fb.db, 'users'), where('role', '==', 'student')))
          .then((s) => cb(sortStudents(s.docs.map((d) => ({ id: d.id, ...d.data() })))))
          .catch(() => {});
      } else if (channel === 'questions') {
        getDocs(collection(fb.db, 'quizQuestions'))
          .then((s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))))
          .catch(() => {});
      } else if (channel === 'classNotes') {
        getDocs(collection(fb.db, 'classNotes'))
          .then((s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.updatedAt || 0) - (a.updatedAt || 0))))
          .catch(() => {});
      }
    }
    return () => listeners[channel].delete(cb);
  }

  return {
    init,
    getMode: () => mode,
    getSession: () => activeSession,
    getPrefs,
    savePrefs,
    computeTotalScore,
    loginOrRegister,
    getCurrentUser,
    logout,
    saveUserProgress,
    saveQuestion,
    deleteQuestion,
    saveClassNote,
    deleteClassNote,
    subscribe,
  };
})();
