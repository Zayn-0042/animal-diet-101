/* Animal Diet 101 — Text-to-Speech (Read & Spell) + Bilingual AI Assistant (Diet Buddy) */
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

  const findAnimalMatch = (qLower) => {
    const { ANIMALS } = window.DIET_DATA;
    const I = window.I18N;
    for (const a of ANIMALS) {
      const en = a.name.toLowerCase();
      const ms = I.getAnimal('ms', a).name.toLowerCase();
      if (qLower.includes(en) || qLower.includes(ms) || qLower.includes(a.id)) {
        return a;
      }
    }
    return null;
  };

  const localReply = (rawQ, { lang = 'en', role = 'student' } = {}) => {
    const q = rawQ.trim();
    const ql = q.toLowerCase();
    const I = window.I18N;
    const isMs = lang === 'ms';

    // 1. Spelling or pronunciation help
    const spellMatch = ql.match(/(?:spell|eja|pronounce|sebut|bunyi)\s+(?:the word\s+|perkataan\s+)?["']?([a-zA-Z\s-]{2,24})["']?/i);
    if (spellMatch) {
      const target = spellMatch[1].trim().replace(/[?!.]+$/, '');
      const spelled = window.AD101_TTS.spellLetters(target);
      return isMs
        ? `🔤 Cara mengeja "${target}":\n**${spelled}**\n\nTekan butang 🔊 Dengar di bawah untuk mendengar sebutan dan ejaan perkataan ini!`
        : `🔤 Here is how to spell "${target}":\n**${spelled}**\n\nTap the 🔊 Listen button below to hear how it sounds!`;
    }

    // 2. Teacher-specific lesson / quiz / classroom help
    if (role === 'teacher' && /(lesson|teach|aktiviti|mengajar|class|kelas|kssr|syllabus|silibus|quiz idea|soalan kuiz|explain to|terangkan)/.test(ql)) {
      if (/(quiz|soalan)/.test(ql)) {
        return isMs
          ? `💡 Idea Soalan Kuiz (Silibus Sekolah Rendah — 3 Diet Utama):\n1. "Haiwan manakah mempunyai gigi taring tajam untuk mengoyak daging?" (Jawapan: Singa / Karnivor)\n2. "Ayam makan bijirin dan cacing. Ayam ialah haiwan apa?" (Jawapan: Omnivor)\n3. "Apakah fungsi gigi geraham rata pada haiwan herbivor?" (Jawapan: Mengisar tumbuhan)\n\nAnda boleh tambah soalan ini terus di tab 🧠 Urus Kuiz!`
          : `💡 Primary Syllabus Quiz Question Ideas (3 Main Diets):\n1. "Which animal uses sharp canine teeth to tear meat?" (Answer: Lion / Carnivore)\n2. "Chickens eat grains and worms. Which diet group do they belong to?" (Answer: Omnivore)\n3. "What are flat molars used for in herbivores?" (Answer: Grinding tough plants)\n\nYou can add these right inside the 🧠 Manage Quiz tab!`;
      }
      return isMs
        ? `👩‍🏫 Panduan Mengajar Diet Haiwan (Sains Sekolah Rendah):\n• Fokus pada 3 kumpulan utama: **Herbivor** (tumbuhan sahaja), **Karnivor** (haiwan lain sahaja), dan **Omnivor** (kedua-duanya).\n• Kaitkan dengan **kegigian haiwan**: gigi kacip (memotong), gigi taring (mengoyak daging), gigi geraham (mengisar tumbuhan).\n• Aktiviti kelas: Minta pelajar gunakan Ensiklopedia + butang 🔊 Eja untuk belajar sebutan, kemudian bertanding dalam permainan Susun! dan lihat kedudukan di Papan Pendahulu.`
        : `👩‍🏫 Primary Science Teaching Tips (Animal Diet 101):\n• Focus on the 3 core syllabus groups: **Herbivores** (plants only), **Carnivores** (other animals only), and **Omnivores** (both).\n• Connect diet to **teeth (dentition)**: incisors (cut plants), canines (tear meat), flat molars (grind plants).\n• Classroom activity: Have students explore the Encyclopedia with the 🔊 Listen & Spell buttons, then compete in Sort It! and review the live Leaderboard together.`;
    }

    // 3. Specific animal lookup (all 48 animals in EN & BM!)
    const animal = findAnimalMatch(ql);
    if (animal) {
      const a = I.getAnimal(lang, animal);
      const d = I.getDiet(lang, a.diet);
      const foods = I.joinList(lang, a.eats.map((k) => I.getFood(lang, k).n.toLowerCase()));
      const spelled = window.AD101_TTS.spellLetters(a.name);
      return isMs
        ? `${a.emoji} **${a.name}** (Ejaan: ${spelled})\n• Kumpulan diet: **${d.label}** (${d.blurb})\n• Makanan: ${foods}.\n• Gigi: ${d.teeth}\n• 💡 Fakta menarik: ${a.fact}`
        : `${a.emoji} **${a.name}** (Spelling: ${spelled})\n• Diet group: **${d.label}** (${d.blurb})\n• Eats: ${foods}.\n• Teeth clue: ${d.teeth}\n• 💡 Fun fact: ${a.fact}`;
    }

    // 4. Comparing diets (difference / beza)
    if (/(difference|compare|beza|perbezaan|vs)/.test(ql)) {
      return isMs
        ? `🌿🥩🍽️ Perbezaan 3 Diet Utama Haiwan:\n• **Herbivor** — makan tumbuhan sahaja (cth: lembu, gajah, arnab). Ada gigi geraham rata.\n• **Karnivor** — makan haiwan lain sahaja (cth: singa, harimau, jerung). Ada gigi taring tajam.\n• **Omnivor** — makan tumbuhan DAN haiwan (cth: beruang, ayam, manusia). Ada gigi kacip, taring dan geraham!`
        : `🌿🥩🍽️ Difference between the 3 Main Animal Diets:\n• **Herbivore** — eats ONLY plants (e.g., cow, elephant, rabbit). Has flat molars to grind plants.\n• **Carnivore** — eats ONLY other animals (e.g., lion, tiger, shark). Has sharp canines to tear meat.\n• **Omnivore** — eats BOTH plants and animals (e.g., bear, chicken, humans). Has incisors, canines and molars!`;
    }

    // 5. Teeth / dentition questions
    if (/(teeth|tooth|molar|canine|incisor|gigi|taring|geraham|kacip)/.test(ql)) {
      return isMs
        ? `🦷 Kegigian Haiwan Mengikut Diet:\n• **Gigi kacip** (hadapan): memotong tumbuhan & makanan.\n• **Gigi taring** (tajam & runcing): mencengkam dan mengoyak daging — paling besar pada **Karnivor**.\n• **Gigi geraham** (rata & lebar): mengisar tumbuhan — kuat pada **Herbivor**.\n• **Omnivor** (seperti manusia & beruang) mempunyai ketiga-tiga jenis gigi!`
        : `🦷 How Animal Teeth Match Their Diet:\n• **Incisors** (front teeth): cut and bite plants and food.\n• **Canines** (sharp pointed teeth): grip and tear meat — sharpest in **Carnivores**.\n• **Molars** (flat wide back teeth): grind tough plants — wide and flat in **Herbivores**.\n• **Omnivores** (like humans & bears) have all three types of teeth!`;
    }

    // 6. Individual diet definitions
    if (/(herbivor|plant eater|makan tumbuhan)/.test(ql)) {
      const d = I.getDiet(lang, 'herbivore');
      return isMs
        ? `🌿 **Herbivor** (Ejaan: H - E - R - B - I - V - O - R)\n• ${d.blurb}\n• Gigi: ${d.teeth}\n• Contoh: lembu, gajah, zirafah, arnab, kambing, panda gergasi dan koala.`
        : `🌿 **Herbivore** (Spelling: H - E - R - B - I - V - O - R - E)\n• ${d.blurb}\n• Teeth: ${d.teeth}\n• Examples: cow, elephant, giraffe, rabbit, goat, giant panda and koala.`;
    }
    if (/(carnivor|karnivor|meat eater|makan daging)/.test(ql)) {
      const d = I.getDiet(lang, 'carnivore');
      return isMs
        ? `🥩 **Karnivor** (Ejaan: K - A - R - N - I - V - O - R)\n• ${d.blurb}\n• Gigi: ${d.teeth}\n• Contoh: singa, harimau, serigala, jerung, helang, buaya dan kucing.`
        : `🥩 **Carnivore** (Spelling: C - A - R - N - I - V - O - R - E)\n• ${d.blurb}\n• Teeth: ${d.teeth}\n• Examples: lion, tiger, wolf, shark, eagle, crocodile and cat.`;
    }
    if (/(omnivor|eat both|makan kedua|tumbuhan dan haiwan)/.test(ql)) {
      const d = I.getDiet(lang, 'omnivore');
      return isMs
        ? `🍽️ **Omnivor** (Ejaan: O - M - N - I - V - O - R)\n• ${d.blurb}\n• Gigi: ${d.teeth}\n• Contoh: beruang perang, ayam, monyet, itik, rakun, tupai dan manusia.`
        : `🍽️ **Omnivore** (Spelling: O - M - N - I - V - O - R - E)\n• ${d.blurb}\n• Teeth: ${d.teeth}\n• Examples: brown bear, chicken, monkey, duck, raccoon, squirrel and humans.`;
    }

    // 7. Enrichment / Additional Info topics (food chain, insectivore, etc.)
    if (/(food chain|rantai makanan|insectivor|piscivor|nectarivor|scavenger|predator|pemangsa|pengeluar)/.test(ql)) {
      return isMs
        ? `🌟 Info Tambahan (Pengayaan di luar 3 diet utama silibus):\n• **Pengeluar** ialah tumbuhan yang buat makanan sendiri dengan cahaya matahari.\n• **Insektivor** makan serangga (katak), **Piskivor** makan ikan (penguin), dan **Nektarivor** hisap nektar (rama-rama).\n• Anda boleh baca lebih banyak info bonus ini di bahagian **📝 Nota → Maklumat Tambahan**!`
        : `🌟 Bonus Enrichment Info (beyond the 3 core primary syllabus diets):\n• **Producers** are plants that make their own food using sunlight.\n• **Insectivores** mainly eat insects (frogs), **Piscivores** eat fish (penguins), and **Nectarivores** drink nectar (butterflies).\n• Check out **📝 Notes → Additional Information** to read more bonus facts!`;
    }

    // 8. Friendly guided fallback
    return isMs
      ? `🤖 Hai! Saya **Diet Buddy**, pembantu AI Animal Diet 101.\nSaya boleh bantu anda memahami:\n• Apa itu **Herbivor**, **Karnivor** dan **Omnivor**\n• Menu & fakta untuk semua 48 haiwan (cth: "Apa makanan panda?" atau "Adakah ayam omnivor?")\n• **Gigi haiwan** mengikut diet\n• **Cara mengeja & menyebut perkataan** (cth: "Eja karnivor")\n${role === 'teacher' ? '• **Idea soalan kuiz & aktiviti kelas** untuk guru!' : ''}`
      : `🤖 Hi! I'm **Diet Buddy**, your Animal Diet 101 AI helper.\nAsk me anything about:\n• What **Herbivores**, **Carnivores** and **Omnivores** are\n• Any of the 48 animals (e.g., "What does a panda eat?" or "Is a chicken an omnivore?")\n• **Animal teeth** and how they match each diet\n• **Spelling & pronunciation** (e.g., "How do you spell herbivore?")\n${role === 'teacher' ? '• **Quiz question ideas & teaching tips** for your class!' : ''}`;
  };

  async function ask(question, ctx = {}) {
    const { lang = 'en', role = 'student' } = ctx;
    const key = getApiKey();
    if (key) {
      try {
        const sysPrompt = lang === 'ms'
          ? `Anda ialah Diet Buddy, pembantu AI mesra untuk permainan pendidikan sains sekolah rendah "Animal Diet 101". Jawab dalam Bahasa Melayu yang ringkas, jelas dan sesuai untuk ${role === 'teacher' ? 'guru sekolah rendah' : 'murid sekolah rendah'}. Fokus pada 3 kumpulan diet utama (Herbivor, Karnivor, Omnivor) serta kegigian haiwan. Pastikan jawapan padat (maksimum 5 ayat).`
          : `You are Diet Buddy, a friendly AI assistant for the primary school science game "Animal Diet 101". Answer clearly and concisely in English suitable for a ${role === 'teacher' ? 'primary school teacher' : 'primary school student'}. Focus on the 3 main syllabus diets (Herbivore, Carnivore, Omnivore) and animal teeth. Keep answers concise (max 5 sentences).`;
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

  return { ask, getApiKey, setApiKey };
})();
