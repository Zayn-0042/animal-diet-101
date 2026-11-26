/* Animal Diet 101 — Text-to-Speech (Read & Spell) + Precision Bilingual AI Assistant (Diet Buddy) */
'use strict';

window.AD101_TTS = (() => {
  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  let cachedVoices = [];
  const loadVoices = () => { if (synth) cachedVoices = synth.getVoices() || []; };
  if (synth) {
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
  }

  const pickVoice = (lang) => {
    if (!cachedVoices.length) loadVoices();
    const prefs = lang === 'ms'
      ? ['ms-MY', 'ms', 'id-ID', 'id']
      : ['en-US', 'en-GB', 'en'];
    for (const p of prefs) {
      const exact = cachedVoices.find((v) => v.lang.toLowerCase() === p.toLowerCase());
      if (exact) return exact;
      const starts = cachedVoices.find((v) => v.lang.toLowerCase().startsWith(p.toLowerCase()));
      if (starts) return starts;
    }
    return null;
  };

  const stop = () => {
    try { synth?.cancel(); } catch { /* ignore */ }
  };

  const speak = (text, lang = 'en', { rate = 0.92, pitch = 1.04, onEnd = null } = {}) => {
    if (!synth || !text) { onEnd?.(); return false; }
    stop();
    const clean = String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
    if (!clean) { onEnd?.(); return false; }
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang === 'ms' ? 'ms-MY' : 'en-US';
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = pitch;
    if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
    try { synth.speak(u); return true; } catch { onEnd?.(); return false; }
  };

  const spellLetters = (word) =>
    String(word).trim().split('').filter((ch) => /[a-zA-Z]/.test(ch)).map((c) => c.toUpperCase()).join(' - ');

  const spellWord = (word, lang = 'en') => {
    const clean = String(word).trim();
    const letters = clean.split('').filter((ch) => /[a-zA-Z]/.test(ch)).join(', ');
    const spoken = lang === 'ms'
      ? `${clean}. Dieja: ${letters}. ${clean}!`
      : `${clean}. Spelled: ${letters}. ${clean}!`;
    speak(spoken, lang, { rate: 0.78, pitch: 1.05 });
    return spellLetters(clean);
  };

  return {
    supported: Boolean(synth),
    speak,
    spellWord,
    spellLetters,
    stop,
  };
})();

window.AD101_AI = (() => {
  const GEMINI_KEY_STORE = 'ad101-gemini-key';
  let lastTopic = null; // remembers { diet?, animalId? } for follow-up questions like "what teeth do they have?"

  const getApiKey = () => {
    try { return localStorage.getItem(GEMINI_KEY_STORE) || ''; } catch { return ''; }
  };
  const setApiKey = (k) => {
    try {
      const clean = String(k || '').trim();
      if (clean) localStorage.setItem(GEMINI_KEY_STORE, clean);
      else localStorage.removeItem(GEMINI_KEY_STORE);
    } catch { /* ignore */ }
  };

  // Detailed diet-specific teeth & diet knowledge (EN & BM)
  const TEETH_DETAIL = {
    herbivore: {
      en: {
        title: '🌿 Herbivore Teeth',
        summary: 'Herbivores have **strong front incisors** and **flat, wide back molars** (no big sharp fangs).',
        details: [
          '**Incisors (front teeth):** sharp and flat-edged to bite and cut grass, leaves, and fruit.',
          '**Molars (back teeth):** large, broad, and flat to grind and crush tough plant fibers into a mash.',
          '**Examples:** cows, horses, elephants, rabbits, and giraffes.',
        ],
      },
      ms: {
        title: '🌿 Gigi Haiwan Herbivor',
        summary: 'Haiwan herbivor mempunyai **gigi kacip hadapan yang kuat** dan **gigi geraham belakang yang rata dan lebar**.',
        details: [
          '**Gigi kacip (hadapan):** kuat untuk memotong rumput, daun dan tumbuhan.',
          '**Gigi geraham (belakang):** besar, rata dan lebar untuk mengisar serta menghancurkan tumbuhan liat.',
          '**Contoh:** lembu, kuda, gajah, arnab dan zirafah.',
        ],
      },
    },
    carnivore: {
      en: {
        title: '🥩 Carnivore Teeth',
        summary: 'Carnivores have **long, sharp, pointed canine teeth** and **sharp jagged back teeth**.',
        details: [
          '**Canines (sharp pointed fangs):** long and pointy to catch, grip, and pierce prey.',
          '**Sharp back teeth:** jagged edges that slice and tear meat like scissors instead of grinding flat.',
          '**Examples:** lions, tigers, wolves, cats, and sharks (which have rows of sharp triangular teeth).',
        ],
      },
      ms: {
        title: '🥩 Gigi Haiwan Karnivor',
        summary: 'Haiwan karnivor mempunyai **gigi taring yang panjang, tajam dan runcing** serta **gigi belakang yang tajam**.',
        details: [
          '**Gigi taring (tajam & runcing):** panjang dan tajam untuk menangkap, mencengkam serta mengoyak daging mangsa.',
          '**Gigi belakang tajam:** memotong dan menyiat daging seperti gunting (bukan rata seperti herbivor).',
          '**Contoh:** singa, harimau, serigala, kucing dan jerung (mempunyai barisan gigi segi tiga yang tajam).',
        ],
      },
    },
    omnivore: {
      en: {
        title: '🍽️ Omnivore Teeth',
        summary: 'Omnivores have **all three types of teeth** — incisors, canines, AND flat molars!',
        details: [
          '**Incisors (front):** cut and bite fruit, vegetables, and other foods.',
          '**Canines (pointed):** grip and tear meat or fish (shorter than a carnivore’s fangs).',
          '**Molars (flat back):** grind plants, grains, berries, and nuts.',
          '**Examples:** humans, brown bears, pigs, monkeys, and raccoons.',
        ],
      },
      ms: {
        title: '🍽️ Gigi Haiwan Omnivor',
        summary: 'Haiwan omnivor mempunyai **ketiga-tiga jenis gigi** — gigi kacip, gigi taring DAN gigi geraham rata!',
        details: [
          '**Gigi kacip (hadapan):** memotong buah, sayur dan makanan lain.',
          '**Gigi taring (runcing):** mencengkam dan mengoyak daging atau ikan.',
          '**Gigi geraham (belakang rata):** mengisar tumbuhan, bijirin dan kekacang.',
          '**Contoh:** manusia, beruang perang, monyet dan rakun.',
        ],
      },
    },
  };

  const TOOTH_PART_INFO = {
    incisor: {
      en: '🦷 **Incisors** are the sharp, chisel-shaped **front teeth**.\n• **Job:** Biting and cutting food (especially plants, grass, and fruit).\n• **Found in:** Strong in **herbivores** (like rabbits & cows) and **omnivores** (like humans & bears).',
      ms: '🦷 **Gigi kacip** ialah **gigi hadapan** yang berbentuk rata dan tajam di hujungnya.\n• **Fungsi:** Menggigit dan memotong makanan (terutamanya tumbuhan dan buah).\n• **Terdapat pada:** Kuat pada **herbivor** (seperti arnab & lembu) dan **omnivor** (seperti manusia & beruang).',
    },
    canine: {
      en: '🦷 **Canines** are the **long, sharp, pointed teeth** next to the front teeth.\n• **Job:** Gripping, piercing, and tearing meat.\n• **Found in:** Largest and sharpest in **carnivores** (like lions, tigers, wolves), and smaller in **omnivores** (like humans & bears).',
      ms: '🦷 **Gigi taring** ialah **gigi panjang, tajam dan runcing** di sebelah gigi kacip.\n• **Fungsi:** Mencengkam dan mengoyak daging.\n• **Terdapat pada:** Paling panjang dan tajam pada **karnivor** (seperti singa, harimau, serigala), dan lebih kecil pada **omnivor** (seperti manusia & beruang).',
    },
    molar: {
      en: '🦷 **Molars** are the **big, flat, wide back teeth**.\n• **Job:** Grinding and crushing tough plants, leaves, and grains so they are easy to digest.\n• **Found in:** Broad and flat in **herbivores** (like cows, elephants, horses) and **omnivores** (like humans & bears).',
      ms: '🦷 **Gigi geraham** ialah **gigi belakang yang besar, rata dan lebar**.\n• **Fungsi:** Mengisar dan menghancurkan tumbuhan liat, daun dan bijirin supaya mudah dihadam.\n• **Terdapat pada:** Lebar dan rata pada **herbivor** (seperti lembu, gajah, kuda) dan **omnivor** (seperti manusia & beruang).',
    },
  };

  // Typo-tolerant entity extractors
  const extractDiets = (ql) => {
    const found = [];
    if (/\b(herbivor\w*|herbi\w*|plant[- ]?eat\w*|pemakan tumbuhan)\b/.test(ql)) found.push('herbivore');
    if (/\b(carnivor\w*|karnivor\w*|carni\w*|karni\w*|meat[- ]?eat\w*|pemakan daging)\b/.test(ql)) found.push('carnivore');
    if (/\b(omnivor\w*|omni\w*|makan kedua)\b/.test(ql)) found.push('omnivore');
    return found;
  };

  const extractToothParts = (ql) => {
    const parts = [];
    if (/\b(incisor\w*|kacip)\b/.test(ql)) parts.push('incisor');
    if (/\b(canine\w*|fang\w*|taring)\b/.test(ql)) parts.push('canine');
    if (/\b(molar\w*|geraham)\b/.test(ql)) parts.push('molar');
    return parts;
  };

  // Small alias dictionary for plurals, short forms, and common kids' spellings
  const ANIMAL_ALIASES = {
    bear: ['bear', 'bears', 'beruang'],
    panda: ['panda', 'pandas'],
    fox: ['fox', 'foxes', 'musang'],
    bee: ['bee', 'bees', 'honeybee', 'lebah'],
    elephant: ['elephant', 'elephants', 'elepant', 'gajah'],
    giraffe: ['giraffe', 'giraffes', 'gireffe', 'zirafah'],
    crocodile: ['crocodile', 'crocodiles', 'crocodil', 'croc', 'buaya'],
    rabbit: ['rabbit', 'rabbits', 'bunny', 'arnab'],
    monkey: ['monkey', 'monkeys', 'monky', 'monyet'],
    chicken: ['chicken', 'chickens', 'hen', 'ayam'],
    human: ['human', 'humans', 'people', 'person', 'manusia', 'orang'],
    mouse: ['mouse', 'mice', 'tikus'],
    owl: ['owl', 'owls', 'burung hantu'],
    parrot: ['parrot', 'parrots', 'burung nuri', 'nuri'],
    wolf: ['wolf', 'wolves', 'serigala'],
    butterfly: ['butterfly', 'butterflies', 'rama-rama', 'rama rama'],
    ladybug: ['ladybug', 'ladybugs', 'kumbang'],
    hedgehog: ['hedgehog', 'hedgehogs', 'landak'],
    hippo: ['hippo', 'hippos', 'hippopotamus', 'badak air'],
    zebra: ['zebra', 'zebras', 'kuda belang'],
    penguin: ['penguin', 'penguins', 'pengiun'],
    dolphin: ['dolphin', 'dolphins', 'lumba-lumba', 'lumba lumba'],
    spider: ['spider', 'spiders', 'labah-labah', 'labah labah'],
    turkey: ['turkey', 'turkeys', 'ayam belanda'],
    caterpillar: ['caterpillar', 'caterpillars', 'beluncas'],
    kangaroo: ['kangaroo', 'kangaroos', 'kanggaru'],
    squirrel: ['squirrel', 'squirrels', 'tupai'],
    raccoon: ['raccoon', 'raccoons', 'racoon', 'rakun'],
  };

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const extractAnimals = (ql) => {
    const { ANIMALS } = window.DIET_DATA;
    const I = window.I18N;
    const matched = [];
    for (const a of ANIMALS) {
      const en = a.name.toLowerCase();
      const ms = I.getAnimal('ms', a).name.toLowerCase();
      const terms = new Set([a.id, `${a.id}s`, en, `${en}s`, ms, ...(ANIMAL_ALIASES[a.id] || [])]);
      for (const term of terms) {
        if (term.length < 3) continue;
        const re = new RegExp(`\\b${escapeRe(term)}\\b`, 'i');
        if (re.test(ql)) {
          matched.push(a);
          break;
        }
      }
    }
    return matched;
  };

  const formatDietTeeth = (diet, lang) => {
    const info = TEETH_DETAIL[diet][lang === 'ms' ? 'ms' : 'en'];
    return `${info.title}\n${info.summary}\n• ${info.details.join('\n• ')}`;
  };

  const formatDietExamples = (diet, lang) => {
    const { ANIMALS } = window.DIET_DATA;
    const I = window.I18N;
    const d = I.getDiet(lang, diet);
    const list = ANIMALS.filter((a) => a.diet === diet).slice(0, 7).map((a) => {
      const loc = I.getAnimal(lang, a);
      const sampleFood = I.getFood(lang, loc.eats[0]).n.toLowerCase();
      return `${loc.emoji} **${loc.name}** (${sampleFood})`;
    });
    return lang === 'ms'
      ? `${d.icon} Contoh haiwan **${d.label}** (${d.blurb}):\n• ${list.join('\n• ')}`
      : `${d.icon} Examples of **${d.label}s** (${d.blurb}):\n• ${list.join('\n• ')}`;
  };

  const localReply = (rawQ, { lang = 'en', role = 'student' } = {}) => {
    const q = rawQ.trim();
    const ql = q.toLowerCase();
    const I = window.I18N;
    const isMs = lang === 'ms';

    // Extract entities
    let diets = extractDiets(ql);
    const animals = extractAnimals(ql);
    const toothParts = extractToothParts(ql);

    // Follow-up context resolution ("what teeth do they have?", "give examples", "apa giginya?")
    const isFollowUp = /\b(they|them|their|it|its|mereka|ia|dia|nya)\b/.test(ql) ||
      (diets.length === 0 && animals.length === 0 && toothParts.length === 0 && /\b(example|examples|contoh|teeth|tooth|gigi|eat|makan)\b/.test(ql));
    if (isFollowUp && diets.length === 0 && animals.length === 0 && lastTopic) {
      if (lastTopic.animalId) {
        const prevA = window.DIET_DATA.ANIMALS.find((x) => x.id === lastTopic.animalId);
        if (prevA) animals.push(prevA);
      } else if (lastTopic.diet) {
        diets = [lastTopic.diet];
      }
    }

    // Update topic memory when user explicitly names a single animal or single diet
    if (animals.length === 1) lastTopic = { animalId: animals[0].id, diet: animals[0].diet };
    else if (diets.length === 1) lastTopic = { diet: diets[0] };

    // 1. Greetings / Thanks
    if (/^(hi|hello|hey|hai|helo|assalamualaikum|good morning|selamat pagi)\b[!.?]*$/i.test(ql)) {
      return isMs
        ? '👋 Hai! Tanya saya apa-apa soalan khusus tentang **herbivor**, **karnivor**, **omnivor**, **gigi haiwan**, atau **mana-mana haiwan**!'
        : '👋 Hi there! Ask me any specific question about **herbivores**, **carnivores**, **omnivores**, **animal teeth**, or **any animal**!';
    }
    if (/^(thanks|thank you|terima kasih|tq|ok|okay)\b[!.?]*$/i.test(ql)) {
      return isMs
        ? '😊 Sama-sama! Tanya lagi bila-bila masa jika ada soalan lain.'
        : '😊 You’re welcome! Ask me anytime if you have another question.';
    }

    // 2. Spelling or pronunciation help
    const spellMatch = ql.match(/(?:how (?:do you |to )?)?(?:spell|eja|mengeja|pronounce|sebut)\s+(?:the word\s+|perkataan\s+)?["']?([a-zA-Z\s-]{2,26})["']?/i);
    if (spellMatch) {
      const target = spellMatch[1].trim().replace(/[?!.]+$/, '');
      const spelled = window.AD101_TTS.spellLetters(target);
      return isMs
        ? `🔤 Cara mengeja **"${target}"**:\n**${spelled}**\n\nTekan butang 🔊 Dengar di bawah untuk mendengar sebutannya!`
        : `🔤 How to spell **"${target}"**:\n**${spelled}**\n\nTap the 🔊 Listen button below to hear how it sounds!`;
    }

    // 3. Teacher-specific pedagogy / quiz / classroom requests
    if (role === 'teacher' && /\b(lesson|teach|teaching|aktiviti|mengajar|class|kelas|kssr|syllabus|silibus|quiz|soalan|activity|pedagogy|rubric)\b/.test(ql)) {
      if (/\b(quiz|soalan|question)\b/.test(ql)) {
        return isMs
          ? `💡 Idea Soalan Kuiz (Silibus Sekolah Rendah — 3 Diet Utama):\n1. "Haiwan manakah mempunyai gigi taring tajam untuk mengoyak daging?" (Jawapan: Singa / Karnivor)\n2. "Ayam makan bijirin dan cacing. Ayam ialah haiwan apa?" (Jawapan: Omnivor)\n3. "Apakah fungsi gigi geraham rata pada haiwan herbivor?" (Jawapan: Mengisar tumbuhan)\n\nAnda boleh tambah soalan ini di tab 🧠 Urus Kuiz!`
          : `💡 Primary Syllabus Quiz Question Ideas (3 Main Diets):\n1. "Which animal uses sharp canine teeth to tear meat?" (Answer: Lion / Carnivore)\n2. "Chickens eat grains and worms. Which diet group do they belong to?" (Answer: Omnivore)\n3. "What are flat molars used for in herbivores?" (Answer: Grinding tough plants)\n\nYou can add these directly in the 🧠 Manage Quiz tab!`;
      }
      if (/\b(activity|aktiviti|game|permainan)\b/.test(ql)) {
        return isMs
          ? `🎯 Idea Aktiviti Kelas (Animal Diet 101):\n1. **Pusingan Pemanas Badan:** Buka Ensiklopedia dan minta murid guna butang 🔤 Eja untuk 3 haiwan.\n2. **Cabaran Susun! (60 saat):** Murid bermain Susun! dan bandingkan kedudukan di Papan Pendahulu.\n3. **Nota Kelas:** Terbitkan 1 nota ringkas di tab 📝 Urus Nota untuk murid ulang kaji sebelum Kuiz Video.`
          : `🎯 Classroom Activity Ideas (Animal Diet 101):\n1. **Warm-up:** Have students pick 3 animals in the Encyclopedia and practice with the 🔤 Spell button.\n2. **Sort It! Challenge (60s):** Run a timed sorting race and review the live Leaderboard together.\n3. **Exit Ticket:** Publish a summary note in 📝 Manage Notes and run the 10-question Video Diet Quiz.`;
      }
      return isMs
        ? `👩‍🏫 Tip Mengajar Diet Haiwan (Sains Sekolah Rendah):\n• Fokus pada 3 kumpulan utama: **Herbivor** (tumbuhan sahaja), **Karnivor** (haiwan lain sahaja), dan **Omnivor** (kedua-duanya).\n• Kaitkan diet dengan **kegigian**: gigi kacip (potong), gigi taring (koyak daging), gigi geraham (kisar tumbuhan).\n• Gunakan tab **🧠 Urus Kuiz** dan **📝 Urus Nota** untuk berkongsi soalan & nota khas kelas anda.`
        : `👩‍🏫 Primary Science Teaching Tips (Animal Diet 101):\n• Anchor lessons on the 3 syllabus diets: **Herbivores** (plants only), **Carnivores** (animals only), and **Omnivores** (both).\n• Link diet directly to **dentition**: incisors (cut), canines (tear meat), flat molars (grind plants).\n• Use **🧠 Manage Quiz** and **📝 Manage Notes** to push custom questions and revision sheets straight to your students.`;
    }

    // 4. TEETH / DENTITION INTENT — Strictly scoped to the asked diet, animal, or tooth part!
    const asksAboutTeeth = /\b(teeth|tooth|teath|toooth|dentition|gigi|bite|chew|grind|tear|kacip|taring|geraham|incisor\w*|canine\w*|molar\w*|fang\w*)\b/.test(ql);
    if (asksAboutTeeth) {
      // 4a. Specific single animal's teeth (e.g., "what teeth does a lion have?")
      if (animals.length === 1) {
        const a = I.getAnimal(lang, animals[0]);
        const d = I.getDiet(lang, a.diet);
        const td = TEETH_DETAIL[a.diet][isMs ? 'ms' : 'en'];
        return isMs
          ? `${a.emoji} **Gigi ${a.name}** (${d.label}):\n${td.summary}\n• ${td.details[0]}\n• ${td.details[1]}`
          : `${a.emoji} **${a.name} Teeth** (${d.label}):\n${td.summary}\n• ${td.details[0]}\n• ${td.details[1]}`;
      }
      // 4b. Specific single diet's teeth (e.g., "what kind of teeth are carnivore animal is?")
      if (diets.length === 1) {
        return formatDietTeeth(diets[0], lang);
      }
      // 4c. Comparing 2 diets' teeth (e.g., "compare herbivore and carnivore teeth")
      if (diets.length === 2) {
        const d1 = TEETH_DETAIL[diets[0]][isMs ? 'ms' : 'en'];
        const d2 = TEETH_DETAIL[diets[1]][isMs ? 'ms' : 'en'];
        return `${d1.title}: ${d1.summary}\n\n${d2.title}: ${d2.summary}`;
      }
      // 4d. Specific tooth part (e.g., "what are canines?" / "fungsi gigi geraham")
      if (toothParts.length === 1) {
        return TOOTH_PART_INFO[toothParts[0]][isMs ? 'ms' : 'en'];
      }
      // 4e. General teeth overview (ONLY when user didn't specify a diet, animal, or tooth part)
      return isMs
        ? `🦷 Kegigian Haiwan Mengikut Diet:\n• **Herbivor:** gigi kacip hadapan & gigi geraham belakang yang rata untuk mengisar tumbuhan.\n• **Karnivor:** gigi taring tajam dan runcing untuk mencengkam serta mengoyak daging.\n• **Omnivor:** mempunyai ketiga-tiga jenis gigi (kacip, taring & geraham rata).\n\nTanya tentang satu kumpulan (cth: "Gigi karnivor macam mana?") untuk penerangan lebih terperinci!`
        : `🦷 How Animal Teeth Match Each Diet:\n• **Herbivores:** strong incisors & flat, wide molars to cut and grind plants.\n• **Carnivores:** long, sharp pointed canines to grip and tear meat.\n• **Omnivores:** all 3 types — incisors, canines, and flat molars.\n\nAsk about a specific group (e.g., "What teeth do carnivores have?") for a focused breakdown!`;
    }

    // 5. YES / NO CHECK (e.g., "Is a rabbit a carnivore?", "Does a cow eat meat?", "Adakah singa herbivor?")
    const asksYesNo = /^(is|are|do|does|can|adakah|bolehkah|betulkah)\b/.test(ql);
    if (asksYesNo && animals.length === 1) {
      const a = I.getAnimal(lang, animals[0]);
      const d = I.getDiet(lang, a.diet);
      const foods = I.joinList(lang, a.eats.map((k) => I.getFood(lang, k).n.toLowerCase()));
      // Check against a diet claim ("Is a rabbit a carnivore?")
      if (diets.length === 1) {
        const askedDiet = diets[0];
        const askedLbl = I.getDiet(lang, askedDiet).label;
        const match = a.diet === askedDiet;
        if (match) {
          return isMs
            ? `✅ **Ya!** ${a.emoji} **${a.name}** ialah haiwan **${d.label}** kerana ia makan ${foods}.`
            : `✅ **Yes!** A ${a.emoji} **${a.name}** is ${I.article('en', d.label)} **${d.label}** because it eats ${foods}.`;
        }
        return isMs
          ? `❌ **Tidak.** ${a.emoji} **${a.name}** bukan ${askedLbl.toLowerCase()} — ia ialah haiwan **${d.label}** kerana ia makan ${foods}.`
          : `❌ **No.** A ${a.emoji} **${a.name}** is not ${I.article('en', askedLbl)} ${askedLbl.toLowerCase()} — it is ${I.article('en', d.label)} **${d.label}** because it eats ${foods}.`;
      }
      // Check against meat vs plants ("Does a cow eat meat?")
      if (/\b(meat|daging|fish|ikan|animals|haiwan)\b/.test(ql)) {
        const eatsAnimals = a.diet === 'carnivore' || a.diet === 'omnivore';
        return isMs
          ? `${eatsAnimals ? '✅ **Ya!**' : '❌ **Tidak.**'} ${a.emoji} **${a.name}** ialah **${d.label}** — ia makan ${foods}.`
          : `${eatsAnimals ? '✅ **Yes!**' : '❌ **No.**'} A ${a.emoji} **${a.name}** is ${I.article('en', d.label)} **${d.label}** — it eats ${foods}.`;
      }
      if (/\b(plant\w*|grass|leaves|leaf|fruit|tumbuhan|rumput|daun|buah)\b/.test(ql)) {
        const eatsPlants = a.diet === 'herbivore' || a.diet === 'omnivore';
        return isMs
          ? `${eatsPlants ? '✅ **Ya!**' : '❌ **Tidak.**'} ${a.emoji} **${a.name}** ialah **${d.label}** — ia makan ${foods}.`
          : `${eatsPlants ? '✅ **Yes!**' : '❌ **No.**'} A ${a.emoji} **${a.name}** is ${I.article('en', d.label)} **${d.label}** — it eats ${foods}.`;
      }
    }

    // 6. COMPARE TWO ANIMALS OR TWO DIETS
    const asksCompare = /\b(difference|compare|versus|vs|beza|perbezaan|banding)\b/.test(ql);
    if (asksCompare || diets.length >= 2 || animals.length >= 2) {
      if (animals.length >= 2) {
        const a1 = I.getAnimal(lang, animals[0]);
        const a2 = I.getAnimal(lang, animals[1]);
        const d1 = I.getDiet(lang, a1.diet);
        const d2 = I.getDiet(lang, a2.diet);
        const f1 = I.joinList(lang, a1.eats.map((k) => I.getFood(lang, k).n.toLowerCase()));
        const f2 = I.joinList(lang, a2.eats.map((k) => I.getFood(lang, k).n.toLowerCase()));
        return isMs
          ? `🔍 Perbandingan **${a1.name}** vs **${a2.name}**:\n• ${a1.emoji} **${a1.name}** ialah **${d1.label}** (makan ${f1}).\n• ${a2.emoji} **${a2.name}** ialah **${d2.label}** (makan ${f2}).`
          : `🔍 **${a1.name}** vs **${a2.name}**:\n• ${a1.emoji} **${a1.name}** is ${I.article('en', d1.label)} **${d1.label}** (eats ${f1}).\n• ${a2.emoji} **${a2.name}** is ${I.article('en', d2.label)} **${d2.label}** (eats ${f2}).`;
      }
      if (diets.length >= 2) {
        const lines = diets.map((dk) => {
          const d = I.getDiet(lang, dk);
          return `${d.icon} **${d.label}:** ${d.blurb} (${d.teeth})`;
        });
        return (isMs ? '🔍 Perbandingan diet yang ditanya:\n• ' : '🔍 Comparison:\n• ') + lines.join('\n• ');
      }
      if (asksCompare) {
        const all = ['herbivore', 'carnivore', 'omnivore'].map((dk) => {
          const d = I.getDiet(lang, dk);
          return `${d.icon} **${d.label}:** ${d.blurb}`;
        });
        return (isMs ? '🌿🥩🍽️ Perbezaan 3 Diet Utama:\n• ' : '🌿🥩🍽️ Difference between the 3 Main Diets:\n• ') + all.join('\n• ');
      }
    }

    // 7. EXAMPLES ONLY for a specific diet ("give examples of carnivore", "contoh herbivor")
    if (/\b(example\w*|list|name some|contoh|senarai)\b/.test(ql) && diets.length === 1) {
      return formatDietExamples(diets[0], lang);
    }

    // 8. SINGLE ANIMAL — Focused by sub-question (what does it eat? / why? / general info)
    if (animals.length === 1) {
      const a = I.getAnimal(lang, animals[0]);
      const d = I.getDiet(lang, a.diet);
      const foods = I.joinList(lang, a.eats.map((k) => I.getFood(lang, k).n.toLowerCase()));
      if (/\b(what.*eat|eat|makan|makanan|menu|diet)\b/.test(ql) && !/\b(why|kenapa|mengapa)\b/.test(ql)) {
        return isMs
          ? `${a.emoji} **${a.name}** makan **${foods}**.\n• Ia termasuk dalam kumpulan **${d.label}** (${d.blurb}).\n• 💡 ${a.fact}`
          : `${a.emoji} A **${a.name}** eats **${foods}**.\n• It belongs to the **${d.label}** group (${d.blurb}).\n• 💡 ${a.fact}`;
      }
      if (/\b(why|kenapa|mengapa)\b/.test(ql)) {
        return isMs
          ? `${a.emoji} **${a.name}** ialah **${d.label}** kerana ia makan **${foods}**.\n• ${d.blurb}\n• 💡 ${a.fact}`
          : `${a.emoji} A **${a.name}** is ${I.article('en', d.label)} **${d.label}** because it eats **${foods}**.\n• ${d.blurb}\n• 💡 ${a.fact}`;
      }
      const spelled = window.AD101_TTS.spellLetters(a.name);
      return isMs
        ? `${a.emoji} **${a.name}** (Ejaan: ${spelled})\n• Diet: **${d.label}**\n• Makanan: ${foods}.\n• Gigi: ${d.teeth}\n• 💡 ${a.fact}`
        : `${a.emoji} **${a.name}** (Spelling: ${spelled})\n• Diet: **${d.label}**\n• Eats: ${foods}.\n• Teeth: ${d.teeth}\n• 💡 ${a.fact}`;
    }

    // 9. SINGLE DIET DEFINITION ("what is a carnivore?", "apa itu herbivor?")
    if (diets.length === 1) {
      const dk = diets[0];
      const d = I.getDiet(lang, dk);
      const spelled = window.AD101_TTS.spellLetters(d.label);
      const exNames = window.DIET_DATA.ANIMALS.filter((a) => a.diet === dk).slice(0, 5)
        .map((a) => I.getAnimal(lang, a).name.toLowerCase()).join(', ');
      return isMs
        ? `${d.icon} **${d.label}** (Ejaan: ${spelled})\n• **Maksud:** ${d.blurb}\n• **Gigi:** ${d.teeth}\n• **Contoh:** ${exNames}.`
        : `${d.icon} **${d.label}** (Spelling: ${spelled})\n• **Meaning:** ${d.blurb}\n• **Teeth:** ${d.teeth}\n• **Examples:** ${exNames}.`;
    }

    // 10. SPECIFIC ENRICHMENT / BONUS TERMS (answers ONLY the asked term!)
    const ENRICH = [
      [/\b(insectivor\w*|insektivor)\b/, '🦗 **Insectivore** (bonus term): an animal that eats mainly insects, like frogs, spiders, and ladybugs.', '🦗 **Insektivor** (istilah bonus): haiwan yang makan serangga sebagai makanan utama, seperti katak, labah-labah dan kumbang kura-kura.'],
      [/\b(piscivor\w*|piskivor)\b/, '🐟 **Piscivore** (bonus term): an animal that eats mainly fish, like penguins and dolphins.', '🐟 **Piskivor** (istilah bonus): haiwan yang makan ikan sebagai makanan utama, seperti penguin dan lumba-lumba.'],
      [/\b(nectarivor\w*|nektarivor)\b/, '🌸 **Nectarivore** (bonus term): an animal that drinks sweet flower nectar, like butterflies and honeybees.', '🌸 **Nektarivor** (istilah bonus): haiwan yang menghisap nektar bunga manis, seperti rama-rama dan lebah madu.'],
      [/\b(frugivor\w*)\b/, '🍎 **Frugivore** (bonus term): an animal that eats mainly fruit, like many monkeys and fruit bats.', '🍎 **Frugivor** (istilah bonus): haiwan yang makan buah-buahan sebagai makanan utama, seperti banyak monyet dan kelawar buah.'],
      [/\b(scavenger\w*|pemakan bangkai)\b/, '🦴 **Scavenger** (bonus term): an animal that eats dead animals it did not hunt, like crabs and vultures.', '🦴 **Pemakan bangkai** (istilah bonus): haiwan yang memakan haiwan mati yang tidak diburunya, seperti ketam dan burung hering.'],
      [/\b(food chain|rantai makanan|producer|pengeluar|predator|pemangsa|prey|mangsa)\b/, '🔗 **Food Chain** (bonus enrichment): Energy flows from the **Sun** → **Producers** (plants) → **Herbivores** → **Carnivores/Omnivores** (predators hunt prey). See **📝 Notes → Additional Information** for more!', '🔗 **Rantai Makanan** (info pengayaan): Tenaga mengalir dari **Matahari** → **Pengeluar** (tumbuhan) → **Herbivor** → **Karnivor/Omnivor** (pemangsa memburu mangsa). Lihat **📝 Nota → Maklumat Tambahan**!'],
    ];
    for (const [re, enTxt, msTxt] of ENRICH) {
      if (re.test(ql)) return isMs ? msTxt : enTxt;
    }

    // 11. Concise guided fallback
    return isMs
      ? `🤖 Saya belum pasti soalan spesifik itu — cuba tanya dengan lebih khusus, contohnya:\n• "Apakah jenis gigi haiwan karnivor?"\n• "Adakah arnab karnivor?"\n• "Apa makanan panda?"\n• "Bagaimana eja herbivor?"\n${role === 'teacher' ? '• "Berikan idea soalan kuiz sekolah rendah"' : ''}`
      : `🤖 I want to give you an exact answer! Try asking something specific like:\n• "What kind of teeth do carnivores have?"\n• "Is a rabbit a carnivore?"\n• "What does a panda eat?"\n• "How do you spell herbivore?"\n${role === 'teacher' ? '• "Give me primary syllabus quiz question ideas"' : ''}`;
  };

  async function ask(question, ctx = {}) {
    const { lang = 'en', role = 'student' } = ctx;
    const key = getApiKey();
    if (key) {
      try {
        const sysPrompt = lang === 'ms'
          ? `Anda ialah Diet Buddy, pembantu AI tepat dan mesra untuk permainan sains sekolah rendah "Animal Diet 101". Jawab HANYA soalan spesifik yang ditanya dalam Bahasa Melayu yang jelas untuk ${role === 'teacher' ? 'guru sekolah rendah' : 'murid sekolah rendah'}. Jangan senaraikan diet lain jika pengguna hanya bertanya tentang satu diet atau satu haiwan. Pastikan jawapan padat (2-4 ayat).`
          : `You are Diet Buddy, a precise, friendly AI assistant for the primary school science game "Animal Diet 101". Answer ONLY the specific question asked in clear English for a ${role === 'teacher' ? 'primary school teacher' : 'primary school student'}. Do not list other diets when the user asks about only one diet or one animal. Keep answers focused (2-4 sentences).`;
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: sysPrompt }] },
              contents: [{ role: 'user', parts: [{ text: question }] }],
            }),
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (txt) return { text: txt, source: 'gemini' };
        }
      } catch { /* fall back seamlessly to built-in Diet Buddy */ }
    }
    return { text: localReply(question, ctx), source: 'builtin' };
  }

  const resetContext = () => { lastTopic = null; };

  return { ask, getApiKey, setApiKey, resetContext };
})();
