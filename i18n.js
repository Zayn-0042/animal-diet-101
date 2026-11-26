/* Animal Diet 101 — Bilingual Support (English & Bahasa Melayu) */
'use strict';

window.I18N = (() => {
  const UI = {
    en: {
      pageTitleHome: 'Animal Diet 101 — Who eats what?',
      brandSub: 'Animal Diet',
      dbFirebase: '☁️ Firebase Live',
      dbLocal: '💾 Local Mode',
      logout: 'Log out',
      roleStudent: '🎓 Student',
      roleTeacher: '👩‍🏫 Teacher',
      soundLabel: 'Sound effects',
      langSwitchLabel: 'Switch language',

      // Login screen
      loginEyebrow: 'Welcome to Animal Diet 101',
      loginTitle: 'Sign in or Register',
      loginSubtitle: 'Enter your name and choose whether you are a Student or Teacher to get started.',
      loginNameLabel: 'Your name',
      loginNamePlaceholder: 'e.g., Aina, Daniel, Cikgu Aminah',
      loginRoleLegend: 'Choose your role',
      loginStudentTitle: 'Student',
      loginStudentDesc: 'Learn animals, play games, take video quizzes, keep notes & climb the leaderboard.',
      loginTeacherTitle: 'Teacher',
      loginTeacherDesc: 'Requires teacher email & password. View students, leaderboard, manage quizzes & class notes.',
      loginBtn: 'Enter Animal Diet 101 ➜',
      loginTeacherSignInTab: 'Teacher Sign In',
      loginTeacherRegTab: 'Register Teacher',
      loginEmailLabel: 'Teacher email',
      loginEmailPlaceholder: 'e.g., cikgu.aminah@school.edu.my',
      loginPassLabel: 'Password',
      loginPassPlaceholder: 'At least 6 characters',
      loginTeacherNotice: '🔒 Teacher access requires a verified email & password so students cannot enter the teacher dashboard.',
      loginErrorName: 'Please enter a name with at least 2 characters.',
      loginErrorEmail: 'Please enter a valid teacher email address.',
      loginErrorPass: 'Password must be at least 6 characters.',
      loginErrorCred: 'Incorrect email or password. Need a new teacher account? Switch to "Register Teacher".',
      loginErrorInUse: 'That teacher email is already registered. Switch to "Teacher Sign In".',
      loginErrorProvider: 'Email/Password sign-in must be enabled in Firebase Console → Authentication → Sign-in method.',

      // TTS & Video Dubbing
      ttsListen: '🔊 Listen',
      ttsSpell: '🔤 Spell',
      ttsReadAll: '🔊 Read aloud',
      ttsReadQ: '🔊 Read question',
      ttsStop: '⏹ Stop',
      dubOn: '🎙️ Dubbing: ON',
      dubOff: '🔇 Dubbing: OFF',
      spelledToast: '🔤 Spelling: {letters}',

      // AI Assistant
      aiFab: '🤖 Ask AI Buddy',
      aiTitle: '🤖 Diet Buddy AI',
      aiSubtitleStudent: 'Stuck on a word, spelling, or animal diet? Ask me anything!',
      aiSubtitleTeacher: 'Need KSSR primary syllabus ideas, quiz questions, or teaching tips? Ask away!',
      aiInputLabel: 'Ask Diet Buddy a question',
      aiInputPlaceholder: 'Ask about any animal, diet, teeth, or spelling…',
      aiSend: 'Send',
      aiWelcomeStudent: 'Hi {name}! 👋 I’m Diet Buddy. Ask me about herbivores, carnivores, omnivores, animal teeth, or ask me how to spell any word!',
      aiWelcomeTeacher: 'Hello {name}! 👋 I’m Diet Buddy. Ask me for primary syllabus explanations, classroom activities, or custom quiz question ideas!',
      aiStudentChips: [
        'What is the difference between herbivore and omnivore?',
        'How do you spell carnivore?',
        'Why do carnivores have sharp teeth?',
        'What does a panda eat?',
      ],
      aiTeacherChips: [
        'Give me primary syllabus quiz question ideas',
        'How to explain herbivore vs omnivore teeth?',
        'Suggest a fun classroom activity for animal diets',
        'Explain KSSR primary animal diet syllabus tips',
      ],
      aiKeySummary: '⚙️ Optional: Connect Gemini API Key',
      aiKeyHint: 'Works out of the box with built-in Diet Buddy! Optionally add your own Gemini API key (saved only in this browser) for open-ended AI answers.',
      aiKeySave: 'Save key',
      aiKeySaved: '✅ Gemini API key saved in this browser.',
      aiKeyCleared: 'Built-in Diet Buddy mode restored.',
      aiThinking: 'Thinking…',

      // Additional info in Notes
      extraNotesHead: '🌟 Additional Information (Enrichment)',
      extraNotesSub: 'Bonus nature facts & special diet words beyond the 3 main primary school syllabus diets.',
      loginDbHintLocal: '💾 Running in Local Mode (saved on this device). Add your Firebase keys in firebase-config.js for live cloud sync.',
      loginDbHintLive: '☁️ Connected to Google Firebase Cloud Firestore for live classroom sync.',

      // Student Nav
      navLearn: 'Learn',
      navSort: 'Sort It!',
      navFeed: 'Feed Me!',
      navQuiz: 'Quiz',
      navNotes: 'Notes',
      navProfile: 'Profile',

      // Teacher Nav
      navTDash: 'Dashboard',
      navTLeader: 'Leaderboard',
      navTQuiz: 'Manage Quiz',
      navTNotes: 'Manage Notes',

      // Home (Student)
      heroEyebrow: 'Learn · Play · Munch',
      heroLead: 'Who eats what in the wild? Meet {count} animals, watch quiz video clues, keep study notes, and climb the class leaderboard!',
      heroBtnSort: '▶ Play Sort It!',
      heroBtnQuiz: '🎬 Video Quiz',
      heroBtnProfile: '🏅 My Profile & Rank',
      pauseAnim: '⏸ Pause animations',
      playAnim: '▶ Play animations',
      animPausedAnnounce: 'Homepage animations paused.',
      animPlayingAnnounce: 'Homepage animations playing.',
      sectionDiets: 'The 3 big diets',
      sectionGames: 'Choose an activity',
      sectionTrophies: 'Your trophy shelf',
      dietCountLine: '{count} {diet}s to discover',

      modeLearnName: 'Animal Encyclopedia',
      modeLearnDesc: 'Tap animals to see their menu and fun facts.',
      modeSortName: 'Sort It!',
      modeSortDesc: 'Race the clock: drop each animal in the right diet bin.',
      modeFeedName: 'Feed Me!',
      modeFeedDesc: 'Give each hungry animal the snack it would really eat.',
      modeQuizName: 'Video Diet Quiz',
      modeQuizDesc: 'Video-backed questions about teeth, tummies and food chains.',
      modeNotesName: 'Study Notes',
      modeNotesDesc: 'Read teacher notes, cheat sheets and write field notes.',
      modeProfileName: 'My Profile & Rank',
      modeProfileDesc: 'See your scores, trophies and position in the leaderboard.',

      bestDiscovered: '🔍 {seen}/{total} discovered',
      bestPts: '🏆 Best: {score} pts',
      bestTen: '🏆 Best: {score}/10',
      bestNotPlayed: '🆕 Not played yet',
      bestNotes: '📒 {n} saved notes',
      bestNotesOne: '📒 1 saved note',
      bestNotesZero: '✍️ Start your notebook',
      bestRank: '🏅 Rank #{rank} · {pts} pts',
      bestRankUnranked: '🏅 Play to climb!',

      // Parade
      parade: [
        ['herb', '🐘 🌿 Grass & Fruit'],
        ['carn', '🦁 🥩 Savanna Meat'],
        ['omni', '🐻 🍓🐟 Berries & Salmon'],
        ['herb', '🐼 🎋 Fresh Bamboo'],
        ['carn', '🐧 🐟 Ocean Fish'],
        ['herb', '🦋 🌸 Sweet Nectar'],
        ['omni', '🦝 🍎🥚 Forest Snacks'],
      ],

      // Badges
      badges: {
        explorer: ['Explorer', 'Discover 10 animals'],
        zoologist: ['Zoologist', 'Discover all {total} animals'],
        sorter: ['Speedy Sorter', 'Score 150+ in Sort It!'],
        streak: ['Hot Streak', 'Sort 10 in a row'],
        feeder: ['Master Feeder', 'Feed 10/10 animals'],
        whiz: ['Quiz Whiz', 'Score 10/10 in the quiz'],
      },
      earnedSr: '(earned)',
      lockedSr: '(locked)',
      newTrophyToast: '🏅 New trophy: {names}!',

      // Learn
      learnTitle: '📖 Animal Encyclopedia',
      learnSub: 'Tap an animal to see what it eats.',
      discoveredPill: 'Discovered {seen} / {total}',
      dictSummary: '📚 Diet dictionary — fancy food words',
      filterAll: 'All',
      filterHerb: '🌿 Herbivores',
      filterCarn: '🥩 Carnivores',
      filterOmni: '🍽️ Omnivores',
      searchPlaceholder: '🔎 Search animals…',
      searchLabel: 'Search animals',
      noAnimals: 'No animals found. Try another name!',
      dialogMenu: 'On the menu',
      dialogFact: 'Fun fact',
      dialogSaveNote: '📝 Save to Notes',
      dialogSavedNote: '✅ Saved to Notes',
      dialogAlreadyNote: '📌 Already in Notes',
      dialogGotIt: 'Got it!',
      animalDietNote: '{name} is {article} {diet} — it {blurb}',

      // Sort It
      sortTitle: '🧺 Sort It!',
      sortSub: 'Drag each animal into the correct diet bin — or just tap a bin. Keyboard: press 1, 2 or 3.',
      sortStartDesc: 'You have <b>60 seconds</b>. Each correct answer is worth 10 points, and streaks earn bonus points!',
      sortStartBtn: 'Start sorting',
      hudScore: '⭐ Score',
      hudStreak: '🔥 Streak',
      dragHint: 'drag me ✋',
      sortPrompt: 'Where does this animal belong?',
      binHerbSub: 'plants only',
      binCarnSub: 'meat eater',
      binOmniSub: 'eats both',
      sortCorrect: '✅ Yes! The {name} is {article} {diet}. +{pts}',
      sortWrong: '❌ Oops! The {name} is {article} {diet} — it eats {foods}.',
      sortResultScore: '{score} points',
      sortResultDetail: 'You sorted {right} of {total} animals correctly.',

      // Feed Me
      feedTitle: '🍽️ Feed Me!',
      feedSub: 'Each animal is hungry. Pick the food it would really eat in the wild.',
      feedStartDesc: '<b>10 hungry animals</b> are waiting. Can you feed them all correctly?',
      feedStartBtn: 'Start feeding',
      hudRound: '🍽️ Round',
      hudFed: '⭐ Fed',
      bubbles: ["I'm hungry!", 'Feed me, please!', "What's for dinner?", 'My tummy is rumbling!', 'Snack time?', 'Yum… what have you got?'],
      bubbleYum: 'Yum yum! 😋',
      bubbleYuck: 'Yuck! 🤢',
      feedCorrect: 'Correct! The {name} is {article} {diet} and eats {foods}. 💡 {fact}',
      feedWrong: 'Not quite — the {name} doesn’t eat {food}. The {name} is {article} {diet} and eats {foods}. 💡 {fact}',
      feedNext: 'Next animal ➜',
      seeResults: 'See my results ➜',
      feedResultScore: '{score} / 10 fed',
      feedResultFull: 'Every animal is full and happy!',
      feedResultTry: 'Keep exploring the encyclopedia to learn more menus.',

      // Quiz
      quizTitle: '🧠 Video Diet Quiz',
      quizSub: 'Watch each mini-video clue and answer {count} questions about animal diets, teeth and food chains.',
      quizStartDesc: 'Answer <b>{count} video questions</b>. Watch the animated habitat clue, then pick the right answer!',
      quizStartBtn: 'Start quiz',
      hudQuestion: '❓ Question',
      hudCorrect: '⭐ Correct',
      videoCluePrefix: '🎬 Video clue: {label}',
      videoTranscriptSummary: '📄 Video description & captions',
      videoCaptionsWord: 'Captions:',
      quizCorrect: '✅ Correct! {why}',
      quizWrong: '❌ The answer is "{ans}". {why}',
      quizNext: 'Next question ➜',
      quizSaveNote: '📝 Save to Notes',
      quizSavedNote: '✅ Saved!',
      quizAlreadyNote: '📌 Already saved',
      quizSavedToast: '📝 Saved quiz fact to Notes!',
      quizAlreadyToast: '📌 Already in your Notes.',
      quizResultScore: '{score} / {total} correct',
      quizResultGood: 'You really know your animal diets!',
      quizResultTry: 'Every question teaches something new — try again!',

      // Result dialog
      resultTitles: ['Nice try!', 'Good job!', 'Great work!', 'Amazing — diet expert!'],
      resultStars: '{detail} You earned {stars} of 3 stars.',
      resultNewBest: '🎉 New best score!',
      resultBestPts: '🏆 Best: {score} pts',
      resultBestTen: '🏆 Best: {score}/10',
      resultHome: '🏠 Home',
      resultAgain: '🔁 Play again',

      // Notes (Student)
      notesTitle: '📝 Study Notes',
      notesSub: 'Teacher class notes, quick cheat sheets and your own personal field notebook.',
      teacherNotesHead: '👩‍🏫 Teacher Class Notes',
      teacherNotesEmpty: 'Your teacher hasn’t published any class notes yet.',
      teacherNoteBadge: '👩‍🏫 Teacher Note',
      studySheetHead: '📚 Quick Study Sheet',
      addFieldNoteHead: '✍️ Add a Field Note',
      editFieldNoteHead: '✏️ Edit Field Note',
      noteTitleLabel: 'Note title',
      noteTitlePlaceholder: 'e.g., Why flamingos turn pink',
      noteTopicLabel: 'Topic',
      noteBodyLabel: 'Your note',
      noteBodyPlaceholder: 'Write what you learned about an animal’s diet, teeth, or food chain…',
      noteHint: 'Saved automatically to your account. You can also save facts from the Encyclopedia or Quiz!',
      noteSaveBtn: '💾 Save note',
      noteUpdateBtn: '💾 Update note',
      noteCancelBtn: 'Cancel edit',
      myNotesHead: '📒 My Field Notes',
      exportBtn: '⬇️ Export .txt',
      notesEmptyNone: 'No personal notes yet! Write your first note on the left, or tap "Save to Notes" while exploring animals or playing the quiz.',
      notesEmptyFilter: 'No notes match this topic filter yet.',
      noteUpdatedToast: '✏️ Note updated!',
      noteSavedToast: '💾 Note saved!',
      noteDeletedToast: '🗑️ Note deleted.',
      noteExportToast: '⬇️ Exported animal-diet-101-notes.txt',
      tags: {
        herbivore: '🌿 Herbivore',
        carnivore: '🥩 Carnivore',
        omnivore: '🍽️ Omnivore',
        foodchain: '🔗 Food Chain',
        fact: '💡 Fun Fact',
        general: '📝 General',
      },

      // Student Profile & Leaderboard
      profileTitle: '🏅 Student Profile & Leaderboard',
      profileSub: 'Track your total score, game bests, trophies and position in the class leaderboard.',
      statTotalScore: 'Total Score',
      statRank: 'Leaderboard Rank',
      statSortBest: 'Sort It! Best',
      statFeedBest: 'Feed Me! Best',
      statQuizBest: 'Quiz Best',
      statDiscovered: 'Animals Found',
      rankOf: '#{rank} of {total}',
      scoreFormulaHint: 'Total Score = Sort It! pts + (Feed Me! × 15) + (Quiz × 20) + (Animals × 2) + (Trophies × 25)',
      leaderboardHead: '🏆 Class Leaderboard',
      lbCaption: 'Student rankings by total score',
      colRank: 'Rank',
      colStudent: 'Student',
      colTotal: 'Total Score',
      colSort: 'Sort It!',
      colFeed: 'Feed Me!',
      colQuiz: 'Quiz',
      colAnimals: 'Animals',
      youBadge: 'You',
      lbEmpty: 'No students on the leaderboard yet.',

      // Teacher Dashboard
      tDashTitle: '👩‍🏫 Teacher Dashboard',
      tDashSub: 'Monitor your class progress, student scores, quiz questions and published study notes.',
      tStatStudents: 'Total Students',
      tStatAvg: 'Class Avg Score',
      tStatTop: 'Top Student',
      tStatQuestions: 'Quiz Questions',
      tStatNotes: 'Class Notes',
      tRosterHead: '📋 Student Roster & Scores',
      tSearchStudent: '🔎 Filter students by name…',
      tQuickManageQuiz: '🧠 Manage Quiz Questions',
      tQuickManageNotes: '📝 Publish Class Notes',
      tLeaderTitle: '🏆 Full Class Leaderboard',
      tLeaderSub: 'Complete ranking of all registered students across every Animal Diet 101 activity.',

      // Teacher Quiz Manager
      tQuizTitle: '🧠 Manage Quiz Questions',
      tQuizSub: 'Create custom bilingual quiz questions with habitat video clues. Students play these automatically in Video Diet Quiz!',
      tQuizAddHead: '➕ Add Custom Quiz Question',
      tQuizEditHead: '✏️ Edit Custom Quiz Question',
      tqEnLabel: 'Question (English)',
      tqMsLabel: 'Question (Bahasa Melayu — optional)',
      tqOptLabel: 'Option {n}',
      tqCorrectHint: '(Correct answer)',
      tqWhyEnLabel: 'Explanation (English)',
      tqWhyMsLabel: 'Explanation (Bahasa Melayu — optional)',
      tqVideoLabel: 'Habitat Video Clue',
      tqSaveBtn: '💾 Save Question',
      tqUpdateBtn: '💾 Update Question',
      tqCustomListHead: '📚 Teacher Custom Questions',
      tqBuiltInInfo: 'Plus {n} built-in Animal Diet 101 questions are always available.',
      tqCustomEmpty: 'No custom teacher questions yet. Add one on the left and students will see it immediately in their Quiz!',
      tqSavedToast: '✅ Quiz question saved!',
      tqUpdatedToast: '✏️ Quiz question updated!',
      tqDeletedToast: '🗑️ Quiz question deleted.',
      tqActiveBadge: 'Active',
      tqHiddenBadge: 'Hidden',

      // Teacher Notes Manager
      tNotesTitle: '📝 Manage Class Notes',
      tNotesSub: 'Publish official Animal Diet 101 study notes for all students to read in their Notes section.',
      tNotesAddHead: '➕ Publish a Class Note',
      tNotesEditHead: '✏️ Edit Class Note',
      tnTitleEn: 'Title (English)',
      tnTitleMs: 'Title (Bahasa Melayu — optional)',
      tnBodyEn: 'Note Content (English)',
      tnBodyMs: 'Note Content (Bahasa Melayu — optional)',
      tnPinLabel: 'Pin to top for students',
      tnSaveBtn: '📢 Publish Note',
      tnUpdateBtn: '💾 Update Note',
      tnListHead: '📢 Published Class Notes',
      tnEmpty: 'No class notes published yet. Add your first class note to share it with all students!',
      tnSavedToast: '📢 Class note published for students!',
      tnUpdatedToast: '✏️ Class note updated!',
      tnDeletedToast: '🗑️ Class note deleted.',

      // Footer & Reset
      footerText: 'Animal Diet 101 · Made for curious minds 🌍',
      resetBtn: 'Reset my progress',
      resetTitle: 'Reset your progress?',
      resetDesc: 'This clears your best scores, trophies, discovered animals and personal notes.',
      resetKeep: 'Keep my progress',
      resetConfirm: 'Reset',
      resetDoneToast: 'Progress reset. Fresh start! 🌱',
      welcomeBackToast: '👋 Welcome back, {name}!',
      welcomeNewToast: '🎉 Welcome to Animal Diet 101, {name}!',
      loggedOutToast: '👋 Signed out.',
    },

    ms: {
      pageTitleHome: 'Animal Diet 101 — Siapa makan apa?',
      brandSub: 'Animal Diet',
      dbFirebase: '☁️ Firebase Langsung',
      dbLocal: '💾 Mod Tempatan',
      logout: 'Log keluar',
      roleStudent: '🎓 Pelajar',
      roleTeacher: '👩‍🏫 Guru',
      soundLabel: 'Kesan bunyi',
      langSwitchLabel: 'Tukar bahasa',

      // Login screen
      loginEyebrow: 'Selamat Datang ke Animal Diet 101',
      loginTitle: 'Log Masuk atau Daftar',
      loginSubtitle: 'Masukkan nama anda dan pilih peranan sebagai Pelajar atau Guru untuk bermula.',
      loginNameLabel: 'Nama anda',
      loginNamePlaceholder: 'cth., Aina, Daniel, Cikgu Aminah',
      loginRoleLegend: 'Pilih peranan anda',
      loginStudentTitle: 'Pelajar',
      loginStudentDesc: 'Belajar haiwan, main permainan, jawab kuiz video, simpan nota & naik papan pendahulu.',
      loginTeacherTitle: 'Guru',
      loginTeacherDesc: 'Memerlukan e-mel & kata laluan guru. Lihat pelajar, papan pendahulu, urus kuiz & nota kelas.',
      loginBtn: 'Masuk ke Animal Diet 101 ➜',
      loginTeacherSignInTab: 'Log Masuk Guru',
      loginTeacherRegTab: 'Daftar Guru Baharu',
      loginEmailLabel: 'E-mel guru',
      loginEmailPlaceholder: 'cth., cikgu.aminah@sekolah.edu.my',
      loginPassLabel: 'Kata laluan',
      loginPassPlaceholder: 'Sekurang-kurangnya 6 aksara',
      loginTeacherNotice: '🔒 Akses guru memerlukan e-mel & kata laluan supaya pelajar tidak dapat memasuki papan pemuka guru.',
      loginErrorName: 'Sila masukkan nama sekurang-kurangnya 2 aksara.',
      loginErrorEmail: 'Sila masukkan alamat e-mel guru yang sah.',
      loginErrorPass: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
      loginErrorCred: 'E-mel atau kata laluan tidak tepat. Akaun baharu? Tukar ke "Daftar Guru Baharu".',
      loginErrorInUse: 'E-mel guru ini sudah didaftarkan. Sila tukar ke "Log Masuk Guru".',
      loginErrorProvider: 'Log masuk E-mel/Kata Laluan perlu diaktifkan di Firebase Console → Authentication → Sign-in method.',

      // TTS & Video Dubbing
      ttsListen: '🔊 Dengar',
      ttsSpell: '🔤 Eja',
      ttsReadAll: '🔊 Baca kuat',
      ttsReadQ: '🔊 Baca soalan',
      ttsStop: '⏹ Henti',
      dubOn: '🎙️ Alih Suara: HIDUP',
      dubOff: '🔇 Alih Suara: MATI',
      spelledToast: '🔤 Ejaan: {letters}',

      // AI Assistant
      aiFab: '🤖 Tanya AI Buddy',
      aiTitle: '🤖 Pembantu AI Diet Buddy',
      aiSubtitleStudent: 'Tidak faham perkataan, ejaan atau diet haiwan? Tanya saya apa sahaja!',
      aiSubtitleTeacher: 'Perlukan idea silibus sekolah rendah, soalan kuiz atau tip mengajar? Tanya sahaja!',
      aiInputLabel: 'Tanya soalan kepada Diet Buddy',
      aiInputPlaceholder: 'Tanya tentang haiwan, diet, gigi, atau cara mengeja…',
      aiSend: 'Hantar',
      aiWelcomeStudent: 'Hai {name}! 👋 Saya Diet Buddy. Tanya saya tentang herbivor, karnivor, omnivor, gigi haiwan, atau cara mengeja mana-mana perkataan!',
      aiWelcomeTeacher: 'Helo {name}! 👋 Saya Diet Buddy. Tanya saya untuk tip silibus sekolah rendah, aktiviti kelas, atau idea soalan kuiz baharu!',
      aiStudentChips: [
        'Apakah perbezaan antara herbivor dan omnivor?',
        'Bagaimana eja karnivor?',
        'Mengapa karnivor mempunyai gigi tajam?',
        'Apa makanan panda?',
      ],
      aiTeacherChips: [
        'Berikan idea soalan kuiz silibus sekolah rendah',
        'Cara menerangkan gigi herbivor vs omnivor?',
        'Cadangkan aktiviti kelas tentang diet haiwan',
        'Panduan mengajar silibus diet haiwan sekolah rendah',
      ],
      aiKeySummary: '⚙️ Pilihan: Sambung Kunci API Gemini',
      aiKeyHint: 'Berfungsi terus dengan Diet Buddy terbina dalam! Anda juga boleh masukkan kunci API Gemini sendiri (disimpan dalam pelayar ini sahaja).',
      aiKeySave: 'Simpan kunci',
      aiKeySaved: '✅ Kunci API Gemini disimpan dalam pelayar ini.',
      aiKeyCleared: 'Kembali kepada mod Diet Buddy terbina dalam.',
      aiThinking: 'Sedang berfikir…',

      // Additional info in Notes
      extraNotesHead: '🌟 Maklumat Tambahan (Pengayaan)',
      extraNotesSub: 'Fakta bonus alam semula jadi & istilah diet khas di luar 3 kumpulan utama silibus sekolah rendah.',
      loginDbHintLocal: '💾 Berjalan dalam Mod Tempatan (disimpan pada peranti ini). Masukkan kunci Firebase di firebase-config.js untuk penyegerakan awan.',
      loginDbHintLive: '☁️ Disambungkan ke Google Firebase Cloud Firestore untuk penyegerakan bilik darjah secara langsung.',

      // Student Nav
      navLearn: 'Belajar',
      navSort: 'Susun!',
      navFeed: 'Beri Makan!',
      navQuiz: 'Kuiz',
      navNotes: 'Nota',
      navProfile: 'Profil',

      // Teacher Nav
      navTDash: 'Papan Pemuka',
      navTLeader: 'Pendahulu',
      navTQuiz: 'Urus Kuiz',
      navTNotes: 'Urus Nota',

      // Home (Student)
      heroEyebrow: 'Belajar · Main · Kunyah',
      heroLead: 'Siapa makan apa di alam liar? Kenali {count} haiwan, tonton petunjuk video kuiz, simpan nota belajar dan naik papan pendahulu kelas!',
      heroBtnSort: '▶ Main Susun!',
      heroBtnQuiz: '🎬 Kuiz Video',
      heroBtnProfile: '🏅 Profil & Kedudukan Saya',
      pauseAnim: '⏸ Jeda animasi',
      playAnim: '▶ Mainkan animasi',
      animPausedAnnounce: 'Animasi halaman utama dijeda.',
      animPlayingAnnounce: 'Animasi halaman utama dimainkan.',
      sectionDiets: '3 jenis diet utama',
      sectionGames: 'Pilih aktiviti',
      sectionTrophies: 'Rak trofi anda',
      dietCountLine: '{count} haiwan {diet} untuk diterokai',

      modeLearnName: 'Ensiklopedia Haiwan',
      modeLearnDesc: 'Ketik haiwan untuk melihat menu dan fakta menarik.',
      modeSortName: 'Susun!',
      modeSortDesc: 'Lawan masa: letakkan setiap haiwan ke dalam tong diet yang betul.',
      modeFeedName: 'Beri Makan!',
      modeFeedDesc: 'Berikan setiap haiwan lapar makanan sebenar yang dimakannya.',
      modeQuizName: 'Kuiz Diet Video',
      modeQuizDesc: 'Soalan bervideo tentang gigi, perut dan rantai makanan.',
      modeNotesName: 'Nota Belajar',
      modeNotesDesc: 'Baca nota guru, helaian ringkas dan tulis nota sendiri.',
      modeProfileName: 'Profil & Kedudukan',
      modeProfileDesc: 'Lihat markah, trofi dan kedudukan anda di papan pendahulu.',

      bestDiscovered: '🔍 {seen}/{total} diterokai',
      bestPts: '🏆 Terbaik: {score} mata',
      bestTen: '🏆 Terbaik: {score}/10',
      bestNotPlayed: '🆕 Belum dimainkan',
      bestNotes: '📒 {n} nota disimpan',
      bestNotesOne: '📒 1 nota disimpan',
      bestNotesZero: '✍️ Mulakan buku nota',
      bestRank: '🏅 Kedudukan #{rank} · {pts} mata',
      bestRankUnranked: '🏅 Main untuk naik!',

      // Parade
      parade: [
        ['herb', '🐘 🌿 Rumput & Buah'],
        ['carn', '🦁 🥩 Daging Savana'],
        ['omni', '🐻 🍓🐟 Beri & Salmon'],
        ['herb', '🐼 🎋 Buluh Segar'],
        ['carn', '🐧 🐟 Ikan Lautan'],
        ['herb', '🦋 🌸 Nektar Manis'],
        ['omni', '🦝 🍎🥚 Snek Hutan'],
      ],

      // Badges
      badges: {
        explorer: ['Peneroka', 'Terokai 10 haiwan'],
        zoologist: ['Ahli Zoologi', 'Terokai semua {total} haiwan'],
        sorter: ['Penyusun Pantas', 'Skor 150+ dalam Susun!'],
        streak: ['Rentetan Hebat', 'Susun 10 berturut-turut'],
        feeder: ['Pakar Pemakanan', 'Beri makan 10/10 haiwan'],
        whiz: ['Juara Kuiz', 'Skor 10/10 dalam kuiz'],
      },
      earnedSr: '(diperoleh)',
      lockedSr: '(terkunci)',
      newTrophyToast: '🏅 Trofi baharu: {names}!',

      // Learn
      learnTitle: '📖 Ensiklopedia Haiwan',
      learnSub: 'Ketik haiwan untuk mengetahui apa yang dimakannya.',
      discoveredPill: 'Diterokai {seen} / {total}',
      dictSummary: '📚 Kamus diet — istilah pemakanan menarik',
      filterAll: 'Semua',
      filterHerb: '🌿 Herbivor',
      filterCarn: '🥩 Karnivor',
      filterOmni: '🍽️ Omnivor',
      searchPlaceholder: '🔎 Cari haiwan…',
      searchLabel: 'Cari haiwan',
      noAnimals: 'Tiada haiwan ditemui. Cuba nama lain!',
      dialogMenu: 'Menu makanan',
      dialogFact: 'Fakta menarik',
      dialogSaveNote: '📝 Simpan ke Nota',
      dialogSavedNote: '✅ Disimpan ke Nota',
      dialogAlreadyNote: '📌 Sudah ada dalam Nota',
      dialogGotIt: 'Faham!',
      animalDietNote: '{name} ialah haiwan {diet} — ia {blurb}',

      // Sort It
      sortTitle: '🧺 Susun!',
      sortSub: 'Seret setiap haiwan ke tong diet yang betul — atau ketik tong. Papan kekunci: tekan 1, 2 atau 3.',
      sortStartDesc: 'Anda ada <b>60 saat</b>. Setiap jawapan betul bernilai 10 mata, dan jawapan berturut-turut memberi mata bonus!',
      sortStartBtn: 'Mula menyusun',
      hudScore: '⭐ Skor',
      hudStreak: '🔥 Rentetan',
      dragHint: 'seret saya ✋',
      sortPrompt: 'Di manakah haiwan ini patut diletakkan?',
      binHerbSub: 'tumbuhan sahaja',
      binCarnSub: 'pemakan daging',
      binOmniSub: 'makan kedua-duanya',
      sortCorrect: '✅ Betul! {name} ialah haiwan {diet}. +{pts}',
      sortWrong: '❌ Alamak! {name} ialah haiwan {diet} — ia makan {foods}.',
      sortResultScore: '{score} mata',
      sortResultDetail: 'Anda berjaya menyusun {right} daripada {total} haiwan dengan betul.',

      // Feed Me
      feedTitle: '🍽️ Beri Makan!',
      feedSub: 'Setiap haiwan sedang lapar. Pilih makanan sebenar yang dimakannya di alam liar.',
      feedStartDesc: '<b>10 haiwan lapar</b> sedang menunggu. Bolehkah anda memberi makan semuanya dengan betul?',
      feedStartBtn: 'Mula beri makan',
      hudRound: '🍽️ Pusingan',
      hudFed: '⭐ Kenyang',
      bubbles: ['Saya lapar!', 'Tolong beri makan!', 'Apa menu hari ini?', 'Perut saya berkeroncong!', 'Masa snek?', 'Sedapnya… apa yang ada?'],
      bubbleYum: 'Sedapnya! 😋',
      bubbleYuck: 'Eee tak sedap! 🤢',
      feedCorrect: 'Betul! {name} ialah haiwan {diet} dan makan {foods}. 💡 {fact}',
      feedWrong: 'Kurang tepat — {name} tidak makan {food}. {name} ialah haiwan {diet} dan makan {foods}. 💡 {fact}',
      feedNext: 'Haiwan seterusnya ➜',
      seeResults: 'Lihat keputusan saya ➜',
      feedResultScore: '{score} / 10 kenyang',
      feedResultFull: 'Semua haiwan kenyang dan gembira!',
      feedResultTry: 'Terus terokai ensiklopedia untuk mengenali lebih banyak menu.',

      // Quiz
      quizTitle: '🧠 Kuiz Diet Video',
      quizSub: 'Tonton setiap petunjuk video ringkas dan jawab {count} soalan tentang diet haiwan, gigi dan rantai makanan.',
      quizStartDesc: 'Jawab <b>{count} soalan video</b>. Tonton petunjuk habitat beranimasi, kemudian pilih jawapan yang tepat!',
      quizStartBtn: 'Mula kuiz',
      hudQuestion: '❓ Soalan',
      hudCorrect: '⭐ Betul',
      videoCluePrefix: '🎬 Petunjuk video: {label}',
      videoTranscriptSummary: '📄 Penerangan & sari kata video',
      videoCaptionsWord: 'Sari kata:',
      quizCorrect: '✅ Betul! {why}',
      quizWrong: '❌ Jawapannya ialah "{ans}". {why}',
      quizNext: 'Soalan seterusnya ➜',
      quizSaveNote: '📝 Simpan ke Nota',
      quizSavedNote: '✅ Disimpan!',
      quizAlreadyNote: '📌 Sudah disimpan',
      quizSavedToast: '📝 Fakta kuiz disimpan ke Nota!',
      quizAlreadyToast: '📌 Sudah ada dalam Nota anda.',
      quizResultScore: '{score} / {total} betul',
      quizResultGood: 'Anda memang pakar diet haiwan!',
      quizResultTry: 'Setiap soalan mengajar perkara baharu — cuba lagi!',

      // Result dialog
      resultTitles: ['Cubaan baik!', 'Bagus!', 'Hebat sekali!', 'Luar biasa — pakar diet!'],
      resultStars: '{detail} Anda memperoleh {stars} daripada 3 bintang.',
      resultNewBest: '🎉 Rekod skor terbaik baharu!',
      resultBestPts: '🏆 Terbaik: {score} mata',
      resultBestTen: '🏆 Terbaik: {score}/10',
      resultHome: '🏠 Utama',
      resultAgain: '🔁 Main lagi',

      // Notes (Student)
      notesTitle: '📝 Nota Belajar',
      notesSub: 'Nota kelas daripada guru, helaian ringkas dan buku nota peribadi anda.',
      teacherNotesHead: '👩‍🏫 Nota Kelas Guru',
      teacherNotesEmpty: 'Guru anda belum menerbitkan nota kelas lagi.',
      teacherNoteBadge: '👩‍🏫 Nota Guru',
      studySheetHead: '📚 Helaian Ringkas Belajar',
      addFieldNoteHead: '✍️ Tambah Nota Peribadi',
      editFieldNoteHead: '✏️ Sunting Nota Peribadi',
      noteTitleLabel: 'Tajuk nota',
      noteTitlePlaceholder: 'cth., Mengapa flamingo berwarna merah jambu',
      noteTopicLabel: 'Topik',
      noteBodyLabel: 'Isi nota anda',
      noteBodyPlaceholder: 'Tulis apa yang anda pelajari tentang diet haiwan, gigi atau rantai makanan…',
      noteHint: 'Disimpan secara automatik pada akaun anda. Anda juga boleh simpan fakta dari Ensiklopedia atau Kuiz!',
      noteSaveBtn: '💾 Simpan nota',
      noteUpdateBtn: '💾 Kemas kini nota',
      noteCancelBtn: 'Batal suntingan',
      myNotesHead: '📒 Nota Peribadi Saya',
      exportBtn: '⬇️ Eksport .txt',
      notesEmptyNone: 'Belum ada nota peribadi! Tulis nota pertama anda di sebelah kiri, atau tekan "Simpan ke Nota" semasa menerokai haiwan atau kuiz.',
      notesEmptyFilter: 'Tiada nota yang sepadan dengan penapis topik ini.',
      noteUpdatedToast: '✏️ Nota dikemas kini!',
      noteSavedToast: '💾 Nota disimpan!',
      noteDeletedToast: '🗑️ Nota dipadam.',
      noteExportToast: '⬇️ Dieksport ke animal-diet-101-notes.txt',
      tags: {
        herbivore: '🌿 Herbivor',
        carnivore: '🥩 Karnivor',
        omnivore: '🍽️ Omnivor',
        foodchain: '🔗 Rantai Makanan',
        fact: '💡 Fakta Menarik',
        general: '📝 Umum',
      },

      // Student Profile & Leaderboard
      profileTitle: '🏅 Profil Pelajar & Papan Pendahulu',
      profileSub: 'Jejaki jumlah markah, skor terbaik, trofi dan kedudukan anda di papan pendahulu kelas.',
      statTotalScore: 'Jumlah Markah',
      statRank: 'Kedudukan',
      statSortBest: 'Terbaik Susun!',
      statFeedBest: 'Terbaik Beri Makan!',
      statQuizBest: 'Terbaik Kuiz',
      statDiscovered: 'Haiwan Diterokai',
      rankOf: '#{rank} daripada {total}',
      scoreFormulaHint: 'Jumlah Markah = Mata Susun! + (Beri Makan! × 15) + (Kuiz × 20) + (Haiwan × 2) + (Trofi × 25)',
      leaderboardHead: '🏆 Papan Pendahulu Kelas',
      lbCaption: 'Kedudukan pelajar mengikut jumlah markah',
      colRank: 'Ked.',
      colStudent: 'Pelajar',
      colTotal: 'Jumlah Markah',
      colSort: 'Susun!',
      colFeed: 'Beri Makan!',
      colQuiz: 'Kuiz',
      colAnimals: 'Haiwan',
      youBadge: 'Anda',
      lbEmpty: 'Belum ada pelajar di papan pendahulu.',

      // Teacher Dashboard
      tDashTitle: '👩‍🏫 Papan Pemuka Guru',
      tDashSub: 'Pantau kemajuan kelas, markah pelajar, soalan kuiz dan nota belajar yang diterbitkan.',
      tStatStudents: 'Jumlah Pelajar',
      tStatAvg: 'Purata Markah Kelas',
      tStatTop: 'Pelajar Terbaik',
      tStatQuestions: 'Soalan Kuiz',
      tStatNotes: 'Nota Kelas',
      tRosterHead: '📋 Senarai Pelajar & Markah',
      tSearchStudent: '🔎 Cari pelajar mengikut nama…',
      tQuickManageQuiz: '🧠 Urus Soalan Kuiz',
      tQuickManageNotes: '📝 Terbitkan Nota Kelas',
      tLeaderTitle: '🏆 Papan Pendahulu Penuh Kelas',
      tLeaderSub: 'Kedudukan lengkap semua pelajar berdaftar merentas semua aktiviti Animal Diet 101.',

      // Teacher Quiz Manager
      tQuizTitle: '🧠 Urus Soalan Kuiz',
      tQuizSub: 'Cipta soalan kuiz dwibahasa dengan petunjuk video habitat. Pelajar akan memainkannya secara automatik dalam Kuiz Diet Video!',
      tQuizAddHead: '➕ Tambah Soalan Kuiz Baharu',
      tQuizEditHead: '✏️ Sunting Soalan Kuiz',
      tqEnLabel: 'Soalan (Bahasa Inggeris)',
      tqMsLabel: 'Soalan (Bahasa Melayu — pilihan)',
      tqOptLabel: 'Pilihan {n}',
      tqCorrectHint: '(Jawapan betul)',
      tqWhyEnLabel: 'Penerangan (Bahasa Inggeris)',
      tqWhyMsLabel: 'Penerangan (Bahasa Melayu — pilihan)',
      tqVideoLabel: 'Petunjuk Video Habitat',
      tqSaveBtn: '💾 Simpan Soalan',
      tqUpdateBtn: '💾 Kemas Kini Soalan',
      tqCustomListHead: '📚 Soalan Kuiz Ciptaan Guru',
      tqBuiltInInfo: 'Serta {n} soalan terbina dalam Animal Diet 101 sentiasa tersedia.',
      tqCustomEmpty: 'Belum ada soalan ciptaan guru. Tambah soalan di sebelah kiri dan pelajar akan terus melihatnya dalam Kuiz!',
      tqSavedToast: '✅ Soalan kuiz disimpan!',
      tqUpdatedToast: '✏️ Soalan kuiz dikemas kini!',
      tqDeletedToast: '🗑️ Soalan kuiz dipadam.',
      tqActiveBadge: 'Aktif',
      tqHiddenBadge: 'Tersembunyi',

      // Teacher Notes Manager
      tNotesTitle: '📝 Urus Nota Kelas',
      tNotesSub: 'Terbitkan nota rasmi Animal Diet 101 untuk dibaca oleh semua pelajar di bahagian Nota mereka.',
      tNotesAddHead: '➕ Terbitkan Nota Kelas',
      tNotesEditHead: '✏️ Sunting Nota Kelas',
      tnTitleEn: 'Tajuk (Bahasa Inggeris)',
      tnTitleMs: 'Tajuk (Bahasa Melayu — pilihan)',
      tnBodyEn: 'Kandungan Nota (Bahasa Inggeris)',
      tnBodyMs: 'Kandungan Nota (Bahasa Melayu — pilihan)',
      tnPinLabel: 'Sematkan di atas untuk pelajar',
      tnSaveBtn: '📢 Terbitkan Nota',
      tnUpdateBtn: '💾 Kemas Kini Nota',
      tnListHead: '📢 Nota Kelas Diterbitkan',
      tnEmpty: 'Belum ada nota kelas diterbitkan. Tambah nota kelas pertama anda untuk dikongsi dengan semua pelajar!',
      tnSavedToast: '📢 Nota kelas diterbitkan kepada pelajar!',
      tnUpdatedToast: '✏️ Nota kelas dikemas kini!',
      tnDeletedToast: '🗑️ Nota kelas dipadam.',

      // Footer & Reset
      footerText: 'Animal Diet 101 · Untuk minda yang ingin tahu 🌍',
      resetBtn: 'Tetapkan semula kemajuan saya',
      resetTitle: 'Tetapkan semula kemajuan anda?',
      resetDesc: 'Ini akan memadam skor terbaik, trofi, haiwan diterokai dan nota peribadi anda.',
      resetKeep: 'Simpan kemajuan saya',
      resetConfirm: 'Tetapkan semula',
      resetDoneToast: 'Kemajuan ditetapkan semula. Permulaan baharu! 🌱',
      welcomeBackToast: '👋 Selamat kembali, {name}!',
      welcomeNewToast: '🎉 Selamat datang ke Animal Diet 101, {name}!',
      loggedOutToast: '👋 Berjaya log keluar.',
    },
  };

  // Bahasa Melayu translations for domain content in data.js
  const MS_DIETS = {
    herbivore: {
      label: 'Herbivor',
      blurb: 'Makan tumbuhan sahaja — rumput, daun, buah, biji benih dan nektar.',
      teeth: 'Gigi geraham yang rata dan lebar untuk mengisar tumbuhan keras.',
    },
    carnivore: {
      label: 'Karnivor',
      blurb: 'Makan haiwan lain — daging, ikan dan serangga.',
      teeth: 'Gigi tajam dan runcing untuk mencengkam serta mengoyak daging.',
    },
    omnivore: {
      label: 'Omnivor',
      blurb: 'Makan kedua-dua tumbuhan dan haiwan — sedikit daripada segala-galanya!',
      teeth: 'Gabungan gigi hadapan yang tajam dan gigi geraham belakang yang rata.',
    },
  };

  const MS_FOODS = {
    grass: 'Rumput', leaves: 'Daun', bamboo: 'Buluh', fruit: 'Buah-buahan', banana: 'Pisang',
    berries: 'Beri', veggies: 'Sayur-sayuran', nuts: 'Kekacang', seeds: 'Biji benih',
    grain: 'Bijirin & jagung', nectar: 'Nektar bunga', fish: 'Ikan', meat: 'Daging',
    shrimp: 'Udang & kril', squid: 'Sotong', insects: 'Serangga', worms: 'Cacing',
    mice: 'Tikus', eggs: 'Telur', seals: 'Anjing laut', zebra: 'Kuda belang',
    deer: 'Rusa', rabbits: 'Arnab', frogs: 'Katak', birds: 'Burung kecil', honey: 'Madu',
  };

  const MS_ANIMALS = {
    lion: ['Singa', 'Singa yang lapar boleh makan sehingga 40 kg daging dalam satu hidangan — kemudian berehat berhari-hari!', ''],
    tiger: ['Harimau', 'Harimau sukakan air. Ia perenang handal dan kadangkala menangkap ikan di sungai.', ''],
    wolf: ['Serigala', 'Serigala memburu secara berkumpulan untuk menangkap mangsa yang jauh lebih besar seperti rusa besar.', ''],
    shark: ['Jerung', 'Jerung menggugurkan dan menumbuhkan beribu-ribu gigi baharu seperti tali sawat.', 'Kebanyakannya piskivor'],
    eagle: ['Helang', 'Helang mempunyai penglihatan tajam dan dapat melihat arnab dari jarak lebih 3 km.', 'Burung pemangsa'],
    crocodile: ['Buaya', 'Buaya besar boleh bertahan berbulan-bulan tanpa makan sebarang hidangan.', ''],
    snake: ['Ular', 'Ular menelan makanan bulat-bulat — rahangnya yang anjal membolehkannya menelan mangsa lebih besar daripada kepalanya.', ''],
    owl: ['Burung Hantu', 'Burung hantu menelan mangsa kecil bulat-bulat, lalu memuntahkan tulang dan bulu sebagai "pelet".', 'Burung pemangsa'],
    frog: ['Katak', 'Katak mengelipkan mata untuk menelan! Bebola matanya menolak makanan ke kerongkong.', 'Insektivor'],
    penguin: ['Penguin', 'Penguin mempunyai duri kecil pada lidahnya untuk mencengkam ikan yang licin.', 'Piskivor'],
    dolphin: ['Lumba-lumba', 'Lumba-lumba tidak mengunyah — ia menelan ikan bulat-bulat, biasanya kepala dahulu.', 'Piskivor'],
    cat: ['Kucing', 'Kucing tidak dapat merasa manis kerana tidak mempunyai deria rasa gula.', 'Karnivor obligat'],
    spider: ['Labah-labah', 'Labah-labah tidak boleh mengunyah. Ia mencairkan bahagian dalam mangsanya lalu menghirupnya!', 'Insektivor'],
    ladybug: ['Kumbang Kura-kura', 'Pekebun sukakan kumbang ini: seekor boleh makan beribu-ribu kutu daun perosak tanaman.', 'Insektivor'],
    elephant: ['Gajah', 'Gajah makan kira-kira 150 kg tumbuhan sehari dan mengambil masa sehingga 16 jam untuk makan!', ''],
    giraffe: ['Zirafah', 'Lidah zirafah sepanjang kira-kira 45 cm — sesuai untuk meragut daun pokok akasia yang berduri.', 'Peragut daun'],
    cow: ['Lembu', 'Perut lembu mempunyai empat bahagian, dan lembu mengunyah makanannya dua kali (memamah biak).', 'Peragut rumput'],
    rabbit: ['Arnab', 'Arnab liar kebanyakannya makan rumput. Lobak merah hanyalah snek — terlalu banyak mengandungi gula!', ''],
    koala: ['Koala', 'Koala makan daun kayu putih (eukaliptus) yang rendah tenaga, jadi koala tidur sehingga 20 jam sehari.', 'Folivor'],
    panda: ['Panda Gergasi', 'Buluh membentuk kira-kira 99% diet panda — ia mengunyah 12 hingga 38 kg buluh setiap hari!', ''],
    horse: ['Kuda', 'Kuda tidak boleh sendawa atau muntah — makanan hanya bergerak sehala melalui badannya!', 'Peragut rumput'],
    zebra: ['Kuda Belang', 'Kuda belang makan bahagian atas rumput tinggi yang liat, membantu haiwan lain mencapai rumput lembut di bawah.', 'Peragut rumput'],
    hippo: ['Badak Air', 'Badak air berehat di dalam air siang hari, lalu keluar pada waktu malam untuk meragut kira-kira 35 kg rumput.', 'Peragut rumput'],
    deer: ['Rusa', 'Rusa tiada gigi hadapan atas — ia meragut tumbuhan menggunakan pelapik keras pada rahang atas.', 'Peragut daun'],
    goat: ['Kambing', 'Kambing suka mencuba makanan — ada yang memanjat pokok untuk mencapai daun paling sedap!', 'Peragut daun'],
    butterfly: ['Rama-rama', 'Rama-rama merasa dengan kakinya dan menghisap nektar melalui lidah seperti penyedut minuman (probosis).', 'Nektarivor'],
    caterpillar: ['Beluncas', 'Banyak beluncas makan kulit telurnya sendiri sebagai hidangan pertama, lalu mengunyah daun tanpa henti.', 'Folivor'],
    camel: ['Unta', 'Bonggol unta menyimpan lemak, bukan air! Mulutnya yang lasak mampu mengunyah tumbuhan gurun berduri.', ''],
    kangaroo: ['Kanggaru', 'Kanggaru memperoleh sebahagian besar air yang diperlukannya daripada tumbuhan yang dimakan.', 'Peragut rumput'],
    parrot: ['Burung Nuri', 'Burung nuri menggunakan paruh melengkung yang kuat untuk memecahkan kekacang dan memegang makanan dengan kaki.', 'Granivor'],
    bee: ['Lebah Madu', 'Lebah minum nektar dan makan debunga. Ia menukar nektar menjadi madu untuk seluruh sarang.', 'Nektarivor'],
    sloth: ['Sloth', 'Sloth menghadam makanan dengan sangat perlahan — satu hidangan boleh mengambil masa sehingga sebulan!', 'Folivor'],
    bear: ['Beruang Perang', 'Beruang perang menangkap ikan salmon yang melompat, tetapi kebanyakan dietnya sebenarnya tumbuhan seperti beri dan akar.', ''],
    pig: ['Khinzir', 'Khinzir menggali akar dan cacing menggunakan muncung kuatnya — ada yang dilatih menghidu cendawan trufel!', ''],
    raccoon: ['Rakun', 'Rakun mempunyai tapak kaki yang sangat sensitif dan sering meraba atau "membasuh" makanan di dalam air.', ''],
    chicken: ['Ayam', 'Ayam tiada gigi! Ia menelan batu-batu kecil untuk membantu mengisar makanan di dalam hempedalnya.', ''],
    monkey: ['Monyet', 'Banyak monyet makan buah-buahan sebagai makanan utama, tetapi makan serangga dan telur untuk protein tambahan.', ''],
    human: ['Manusia', 'Manusia ialah omnivor — gigi geraham rata mengisar tumbuhan dan gigi hadapan menggigit daging.', ''],
    fox: ['Musang Merah', 'Musang dapat mendengar tikus bergerak di bawah salji lalu menerkamnya — dan ia juga suka makan beri.', ''],
    hedgehog: ['Landak Kecil', 'Landak kecil menyelongkar semak mencari serangga, cacing dan buah yang gugur pada waktu malam.', 'Kebanyakannya insektivor'],
    squirrel: ['Tupai', 'Tupai menanam kekacang untuk musim sejuk dan melupakan banyak daripadanya — membantu pokok baharu tumbuh!', ''],
    mouse: ['Tikus', 'Tikus suka mengudap — ia makan 15 hingga 20 kali sehari!', ''],
    duck: ['Itik', 'Itik menyelamkan kepalanya ke dalam air untuk meragut tumbuhan air, siput dan serangga.', ''],
    flamingo: ['Flamingo', 'Flamingo berwarna merah jambu kerana alga dan udang kecil yang dimakannya — dan ia makan secara terbalik!', 'Pemakan turas'],
    crab: ['Ketam', 'Ketam ialah pemakan bangkai yang makan hampir apa sahaja: rumpai laut, cacing, siput dan sisa makanan.', 'Pemakan bangkai'],
    ant: ['Semut', 'Sesetengah semut "menternak" kutu daun seperti lembu kecil untuk mendapatkan embun madu yang manis!', ''],
    skunk: ['Skunk', 'Skunk menggali tanah mencari ulat dengan kuku panjang dan juga makan buah, telur serta tikus.', ''],
    turkey: ['Ayam Belanda', 'Ayam belanda liar mengais lantai hutan mencari buah oak, biji benih dan serangga.', ''],
  };

  const MS_DICTIONARY = [
    ['🦗', 'Insektivor', 'makan serangga sebagai makanan utama (katak, labah-labah, landak kecil)'],
    ['🐟', 'Piskivor', 'makan ikan sebagai makanan utama (penguin, lumba-lumba)'],
    ['🍎', 'Frugivor', 'makan buah-buahan sebagai makanan utama (banyak monyet dan kelawar buah)'],
    ['🌿', 'Folivor', 'makan daun sebagai makanan utama (koala, sloth)'],
    ['🌸', 'Nektarivor', 'minum nektar bunga (rama-rama, lebah)'],
    ['🌻', 'Granivor', 'makan biji benih dan bijirin sebagai makanan utama (burung nuri)'],
    ['🦴', 'Pemakan bangkai', 'makan haiwan mati yang tidak diburunya sendiri (ketam, burung hering)'],
    ['🎯', 'Pemangsa', 'memburu haiwan lain untuk makanan'],
    ['🐇', 'Mangsa', 'haiwan yang diburu dan dimakan'],
    ['🌱', 'Pengeluar', 'tumbuhan yang membuat makanannya sendiri daripada cahaya matahari'],
  ];

  const MS_VIDEOS = {
    'herbivore-meadow': {
      label: 'Padang Ragut Herbivor',
      caption: 'Padang rumput hijau yang cerah di mana gajah, lembu, koala dan zirafah meragut rumput serta daun.',
      cues: [
        [0.2, 4.5, 'Haiwan herbivor makan tumbuhan sahaja, seperti rumput, daun dan buah-buahan!'],
      ],
    },
    'carnivore-hunt': {
      label: 'Pemburu Liar Beraksi',
      caption: 'Senja keemasan di savana dengan helang melayang di udara manakala singa dan serigala memburu di dataran.',
      cues: [
        [0.2, 4.5, 'Haiwan karnivor ialah pemakan daging yang memburu haiwan lain untuk makanan!'],
      ],
    },
    'omnivore-feast': {
      label: 'Bufet Tumbuhan & Haiwan',
      caption: 'Sungai hutan di mana beruang perang dan rakun menikmati buah beri liar serta ikan yang melompat.',
      cues: [
        [0.2, 4.5, 'Haiwan omnivor makan tumbuhan dan haiwan, seperti buah beri dan ikan!'],
      ],
    },
    'panda-bamboo': {
      label: 'Hutan Buluh',
      caption: 'Hutan buluh hijau berkabus dengan batang buluh tinggi bergoyang dan panda gergasi mengunyah gembira.',
      cues: [
        [0.2, 4.5, 'Panda gergasi ialah haiwan herbivor yang sangat gemar mengunyah buluh segar!'],
      ],
    },
    'insect-nectar': {
      label: 'Bunga, Nektar & Serangga',
      caption: 'Taman bunga berwarna-warni di mana rama-rama dan lebah terbang berdekatan bunga sementara katak memerhati serangga.',
      cues: [
        [0.2, 4.5, 'Rama-rama menghisap nektar bunga manis manakala katak menangkap serangga!'],
      ],
    },
    'ocean-feast': {
      label: 'Menu Lautan',
      caption: 'Pemandangan dasar laut dengan buih naik, sekumpulan ikan berenang, sotong, penguin menyelam dan jerung meluncur.',
      cues: [
        [0.2, 4.5, 'Penguin dan jerung ialah karnivor lautan yang makan ikan dan sotong!'],
      ],
    },
    'food-chain': {
      label: 'Tenaga dalam Rantai Makanan',
      caption: 'Rajah rantai makanan beranimasi menunjukkan aliran tenaga dari Matahari ke Tumbuhan, kemudian Arnab, dan akhirnya Musang.',
      cues: [
        [0.2, 4.5, 'Tenaga mengalir daripada cahaya matahari kepada tumbuhan, herbivor dan pemangsa!'],
      ],
    },
    'teeth-tummies': {
      label: 'Petunjuk Gigi & Kegigian',
      caption: 'Perbandingan sebelah-menyebelah gigi geraham rata untuk mengisar tumbuhan dan gigi tajam untuk mengoyak daging.',
      cues: [
        [0.2, 3.0, 'Herbivor mempunyai gigi rata untuk mengisar tumbuhan.'],
        [3.0, 6.2, 'Karnivor mempunyai gigi tajam untuk mengoyak daging!'],
      ],
    },
    'wild-secrets': {
      label: 'Rahsia Hebat Diet Haiwan',
      caption: 'Tiga habitat liar sebelah-menyebelah: unta berjalan di gurun, flamingo berhampiran udang, dan burung hantu di langit malam.',
      cues: [
        [0.2, 4.8, 'Haiwan menyesuaikan diri dengan cara menakjubkan untuk mencari dan menghadam makanan!'],
      ],
    },
  };

  const MS_STUDY_NOTES = [
    {
      tag: 'herbivore', icon: '🌿', title: 'Herbivor (Pemakan Tumbuhan)',
      points: [
        'Makan tumbuhan sahaja: rumput, daun, buluh, buah, sayur, biji benih dan nektar.',
        'Kegigian: gigi kacip hadapan untuk memotong dan gigi geraham belakang yang rata untuk mengisar tumbuhan.',
        'Contoh: lembu, gajah, zirafah, arnab, kambing, kuda, panda dan koala.',
      ],
    },
    {
      tag: 'carnivore', icon: '🥩', title: 'Karnivor (Pemakan Haiwan / Daging)',
      points: [
        'Makan haiwan lain sahaja: daging, ikan, serangga, tikus, katak dan burung.',
        'Kegigian: gigi taring tajam dan runcing untuk mencengkam serta mengoyak daging.',
        'Contoh: singa, harimau, serigala, jerung, helang, ular, buaya dan kucing.',
      ],
    },
    {
      tag: 'omnivore', icon: '🍽️', title: 'Omnivor (Makan Tumbuhan & Haiwan)',
      points: [
        'Makan tumbuhan dan juga haiwan lain — buah, bijirin, sayur, serangga, ikan dan daging.',
        'Kegigian: mempunyai ketiga-tiga jenis gigi — gigi kacip, gigi taring dan gigi geraham.',
        'Contoh: beruang perang, ayam, monyet, itik, tupai, rakun dan manusia.',
      ],
    },
    {
      tag: 'fact', icon: '🦷', title: 'Petunjuk Gigi (Silibus Sekolah Rendah)',
      points: [
        'Gigi kacip (hadapan): memotong dan menggigit makanan seperti tumbuhan dan buah.',
        'Gigi taring (tajam & runcing): mencengkam dan mengoyak daging (besar pada karnivor!).',
        'Gigi geraham (rata & lebar): mengisar dan menghancurkan tumbuhan (kuat pada herbivor!).',
      ],
    },
  ];

  const MS_EXTRA_NOTES = [
    {
      tag: 'fact', icon: '🦗', title: 'Sub-Kumpulan Khas (Bonus)',
      points: [
        'Insektivor: makan serangga sebagai makanan utama (katak, labah-labah, kumbang kura-kura).',
        'Piskivor: makan ikan sebagai makanan utama (penguin, lumba-lumba).',
        'Nektarivor & Frugivor: menghisap nektar bunga (rama-rama, lebah) atau makan buah-buahan.',
        'Folivor & Granivor: makan daun (koala, sloth) atau biji benih/bijirin (burung nuri).',
      ],
    },
    {
      tag: 'foodchain', icon: '🔗', title: 'Rantai Makanan & Peranan Alam (Bonus)',
      points: [
        'Pengeluar (tumbuhan) membuat makanannya sendiri menggunakan cahaya matahari.',
        'Pemangsa memburu haiwan lain (mangsa) untuk makanan.',
        'Pemakan bangkai (ketam, burung hering) membersihkan alam dengan memakan haiwan mati yang tidak diburunya.',
      ],
    },
    {
      tag: 'general', icon: '🌟', title: 'Fakta Menarik Penghadaman & Badan (Bonus)',
      points: [
        'Lembu mempunyai 4 bahagian perut untuk menghadam rumput; ayam menelan batu kecil untuk mengisar makanan.',
        'Flamingo berwarna merah jambu kerana pigmen dalam alga dan udang kecil yang dimakannya.',
        'Burung hantu memuntahkan pelet tulang dan bulu; bonggol unta menyimpan lemak (bukan air!).',
        'Sloth menghadam sangat perlahan sehingga satu hidangan mengambil masa sehingga sebulan!',
      ],
    },
  ];

  // Primary School Syllabus BM Quiz (18 questions — Herbivor, Karnivor, Omnivor & Gigi)
  const MS_QUIZ = [
    { q: 'Apakah nama haiwan yang makan tumbuhan SAHAJA?', a: ['Herbivor', 'Karnivor', 'Omnivor', 'Semua di atas'], why: 'Herbivor (seperti lembu, gajah dan arnab) makan tumbuhan sahaja.' },
    { q: 'Apakah nama haiwan yang makan haiwan lain SAHAJA?', a: ['Karnivor', 'Herbivor', 'Omnivor', 'Pemakan tumbuhan'], why: 'Karnivor (seperti singa, harimau dan jerung) makan haiwan lain sahaja.' },
    { q: 'Apakah nama haiwan yang makan tumbuhan DAN haiwan lain?', a: ['Omnivor', 'Herbivor', 'Karnivor', 'Pemakan daun'], why: 'Omnivor (seperti beruang, ayam dan manusia) makan kedua-dua tumbuhan dan haiwan.' },
    { q: 'Haiwan manakah antara berikut ialah HERBIVOR?', a: ['Gajah', 'Singa', 'Jerung', 'Helang'], why: 'Gajah ialah herbivor — ia makan rumput, daun dan buah-buahan.' },
    { q: 'Haiwan manakah antara berikut ialah KARNIVOR?', a: ['Harimau', 'Lembu', 'Zirafah', 'Arnab'], why: 'Harimau ialah karnivor yang memburu haiwan lain seperti rusa dan ikan.' },
    { q: 'Haiwan manakah antara berikut ialah OMNIVOR?', a: ['Beruang perang', 'Koala', 'Singa', 'Zirafah'], why: 'Beruang perang makan tumbuhan seperti beri dan akar, serta menangkap ikan dan serangga.' },
    { q: 'Apakah makanan utama panda gergasi hampir sepanjang masa?', a: ['Buluh (tumbuhan)', 'Ikan', 'Daging', 'Tikus'], why: 'Panda gergasi ialah herbivor — buluh membentuk kira-kira 99% dietnya!' },
    { q: 'Manusia ialah…', a: ['Omnivor', 'Herbivor', 'Karnivor', 'Pemakan tumbuhan sahaja'], why: 'Manusia ialah omnivor kerana kita makan tumbuhan (buah, sayur, bijirin) dan juga haiwan (ikan, daging).' },
    { q: 'Apakah jenis gigi belakang yang membantu HERBIVOR mengisar tumbuhan?', a: ['Gigi geraham rata dan lebar', 'Gigi taring tajam dan panjang', 'Tiada gigi langsung', 'Kuku bengkok tajam'], why: 'Herbivor menggunakan gigi geraham yang rata dan lebar untuk mengisar daun dan rumput.' },
    { q: 'Apakah jenis gigi yang membantu KARNIVOR mencengkam dan mengoyak daging?', a: ['Gigi taring tajam dan runcing', 'Gigi rata dan lebar sahaja', 'Gading sahaja', 'Pelapik lembut sahaja'], why: 'Karnivor mempunyai gigi taring yang tajam dan runcing untuk mencengkam serta mengoyak daging.' },
    { q: 'Mengapakah OMNIVOR mempunyai gigi kacip, taring DAN geraham rata?', a: ['Untuk makan tumbuhan dan daging', 'Untuk mengunyah rumput sahaja', 'Untuk mengoyak daging sahaja', 'Mereka tidak mengunyah makanan'], why: 'Gigi kacip memotong, gigi taring mengoyak daging, dan gigi geraham mengisar tumbuhan — sesuai untuk omnivor!' },
    { q: 'Zirafah makan daun pokok akasia yang tinggi. Apakah kumpulan diet zirafah?', a: ['Herbivor', 'Karnivor', 'Omnivor', 'Pemakan daging'], why: 'Zirafah makan daun dan tumbuhan sahaja, jadi ia ialah herbivor.' },
    { q: 'Ayam makan biji benih, bijirin DAN cacing serta serangga. Ayam ialah…', a: ['Omnivor', 'Herbivor', 'Karnivor', 'Pemakan tumbuhan sahaja'], why: 'Kerana ayam makan tumbuhan (biji benih, bijirin) dan haiwan (cacing, serangga), ayam ialah omnivor!' },
    { q: 'Buaya makan ikan, burung dan daging. Kumpulan diet manakah buaya tergolong?', a: ['Karnivor', 'Herbivor', 'Omnivor', 'Pemakan buah'], why: 'Buaya makan haiwan lain sahaja, jadi ia ialah karnivor.' },
    { q: 'Lembu makan rumput dan bijirin. Apakah jenis pemakanan lembu?', a: ['Herbivor', 'Karnivor', 'Omnivor', 'Pemakan daging'], why: 'Lembu makan tumbuhan seperti rumput dan bijirin sahaja — lembu ialah herbivor.' },
    { q: 'Pasangan haiwan manakah KEDUA-DUANYA karnivor?', a: ['Singa dan Jerung', 'Lembu dan Arnab', 'Beruang dan Monyet', 'Gajah dan Harimau'], why: 'Kedua-dua singa (daging) dan jerung (ikan, anjing laut, sotong) makan haiwan lain sahaja.' },
    { q: 'Pasangan haiwan manakah KEDUA-DUANYA herbivor?', a: ['Arnab dan Koala', 'Serigala dan Helang', 'Ayam dan Beruang', 'Kucing dan Zirafah'], why: 'Arnab makan rumput/sayur dan koala makan daun eukaliptus — kedua-duanya herbivor!' },
    { q: 'Monyet makan pisang, buah, serangga dan telur. Monyet ialah…', a: ['Omnivor', 'Herbivor', 'Karnivor', 'Pemakan rumput'], why: 'Monyet makan tumbuhan (buah, pisang) dan juga haiwan (serangga, telur), jadi monyet ialah omnivor.' },
  ];

  const t = (lang, key, vars = {}) => {
    const dict = UI[lang] || UI.en;
    const raw = dict[key] ?? UI.en[key] ?? key;
    if (typeof raw !== 'string') return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  };

  const getDiet = (lang, key) => {
    const base = window.DIET_DATA.DIETS[key];
    if (lang !== 'ms' || !MS_DIETS[key]) return base;
    return { ...base, ...MS_DIETS[key] };
  };

  const getFood = (lang, key) => {
    const base = window.DIET_DATA.FOODS[key];
    if (lang !== 'ms' || !MS_FOODS[key]) return base;
    return { ...base, n: MS_FOODS[key] };
  };

  const getAnimal = (lang, a) => {
    if (lang !== 'ms' || !MS_ANIMALS[a.id]) return a;
    const [name, fact, special] = MS_ANIMALS[a.id];
    return { ...a, name, fact, special };
  };

  const getDictionary = (lang) => (lang === 'ms' ? MS_DICTIONARY : window.DIET_DATA.DICTIONARY);
  const getStudyNotes = (lang) => (lang === 'ms' ? MS_STUDY_NOTES : window.DIET_DATA.STUDY_NOTES);
  const getExtraNotes = (lang) => (lang === 'ms' ? MS_EXTRA_NOTES : window.DIET_DATA.EXTRA_NOTES);

  const getVideo = (lang, key) => {
    const base = window.DIET_DATA.VIDEOS[key] || window.DIET_DATA.VIDEOS['herbivore-meadow'];
    if (lang !== 'ms' || !MS_VIDEOS[key]) return base;
    return { ...base, ...MS_VIDEOS[key] };
  };

  const getBuiltInQuiz = (lang) =>
    window.DIET_DATA.QUIZ.map((q, i) => {
      if (lang !== 'ms' || !MS_QUIZ[i]) return { ...q, id: `builtin_${i}`, custom: false };
      return { ...q, ...MS_QUIZ[i], id: `builtin_${i}`, custom: false };
    });

  const localizeCustomQuiz = (lang, cq) => ({
    id: cq.id,
    q: (lang === 'ms' && cq.qMs) ? cq.qMs : cq.qEn,
    a: (lang === 'ms' && Array.isArray(cq.aMs) && cq.aMs.every(Boolean)) ? cq.aMs : cq.aEn,
    why: (lang === 'ms' && cq.whyMs) ? cq.whyMs : (cq.whyEn || ''),
    video: cq.video || 'herbivore-meadow',
    custom: true,
    createdBy: cq.createdBy,
  });

  const joinList = (lang, items) => {
    const conj = lang === 'ms' ? ' dan ' : ' and ';
    return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')}${conj}${items.at(-1)}`;
  };

  const article = (lang, word) => {
    if (lang === 'ms') return '';
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
  };

  return {
    UI,
    t,
    getDiet,
    getFood,
    getAnimal,
    getDictionary,
    getStudyNotes,
    getExtraNotes,
    getVideo,
    getBuiltInQuiz,
    localizeCustomQuiz,
    joinList,
    article,
  };
})();
