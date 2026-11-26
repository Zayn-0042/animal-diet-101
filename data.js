/* Animal Diet 101 — game content */
window.DIET_DATA = (() => {
  const DIETS = {
    herbivore: {
      label: 'Herbivore',
      icon: '🌿',
      blurb: 'Eats only plants — grass, leaves, fruit, seeds and nectar.',
      teeth: 'Flat, wide back teeth for grinding tough plants.',
      examples: '🐘 🦒 🐨 🐼',
    },
    carnivore: {
      label: 'Carnivore',
      icon: '🥩',
      blurb: 'Eats other animals — meat, fish and insects.',
      teeth: 'Sharp, pointed teeth for gripping and tearing.',
      examples: '🦁 🦈 🦅 🐺',
    },
    omnivore: {
      label: 'Omnivore',
      icon: '🍽️',
      blurb: 'Eats both plants and animals — a little of everything!',
      teeth: 'A mix of sharp front teeth and flat back teeth.',
      examples: '🐻 🐷 🦝 🧑',
    },
  };

  // Inline SVG icons for Unicode 13.0 foods (seal, worm) so they never show as □ on Windows 10 / older OSes
  const SEAL_SVG = '<svg class="food-svg" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 46c0-14 9-26 22-26 11 0 18 7 18 18 0 6-3 10-7 12l5 4c1 1 0 3-2 3H16c-3 0-4-5-4-11Z" fill="#9fb3c8" stroke="#2b2a33" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="30" cy="36" rx="11" ry="8" fill="#cbd5e1"/><circle cx="24" cy="29" r="2.8" fill="#2b2a33"/><circle cx="35" cy="29" r="2.8" fill="#2b2a33"/><ellipse cx="29.5" cy="34" rx="4" ry="2.8" fill="#2b2a33"/><path d="M29.5 36.8v2.7m-4 .5c2 1.8 6 1.8 8 0" fill="none" stroke="#2b2a33" stroke-width="2.5" stroke-linecap="round"/><path d="M16 35l7 1m-7 4l7-1m19-3l7-1m-7 4l7 1" stroke="#2b2a33" stroke-width="2.2" stroke-linecap="round"/><path d="M12 47c-4 1-6 4-5 7 3 2 8 0 11-3" fill="#7c93ad" stroke="#2b2a33" stroke-width="3" stroke-linejoin="round"/></svg>';
  const WORM_SVG = '<svg class="food-svg" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 44c0-10 8-14 14-10s8 12 16 10c7-2 10-12 8-20-1-5-7-6-10-3" fill="none" stroke="#2b2a33" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 44c0-10 8-14 14-10s8 12 16 10c7-2 10-12 8-20-1-5-7-6-10-3" fill="none" stroke="#f28b9c" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 33l-2 7m10 3l3-6m11-5l6 2" stroke="#d96b7e" stroke-width="2.2" stroke-linecap="round"/><circle cx="42.5" cy="19.5" r="1.8" fill="#2b2a33"/><circle cx="47" cy="21" r="1.8" fill="#2b2a33"/></svg>';

  // type: plant | animal | other (other is never used as a wrong answer)
  const FOODS = {
    grass: { e: '🌾', n: 'Grass', type: 'plant' },
    leaves: { e: '🌿', n: 'Leaves', type: 'plant' },
    bamboo: { e: '🎋', n: 'Bamboo', type: 'plant' },
    fruit: { e: '🍎', n: 'Fruit', type: 'plant' },
    banana: { e: '🍌', n: 'Bananas', type: 'plant' },
    berries: { e: '🍓', n: 'Berries', type: 'plant' },
    veggies: { e: '🥕', n: 'Vegetables', type: 'plant' },
    nuts: { e: '🌰', n: 'Nuts', type: 'plant' },
    seeds: { e: '🌻', n: 'Seeds', type: 'plant' },
    grain: { e: '🌽', n: 'Grain & corn', type: 'plant' },
    nectar: { e: '🌸', n: 'Flower nectar', type: 'plant' },
    fish: { e: '🐟', n: 'Fish', type: 'animal' },
    meat: { e: '🥩', n: 'Meat', type: 'animal' },
    shrimp: { e: '🦐', n: 'Shrimp & krill', type: 'animal' },
    squid: { e: '🦑', n: 'Squid', type: 'animal' },
    insects: { e: '🦗', n: 'Insects', type: 'animal' },
    worms: { e: WORM_SVG, n: 'Worms', type: 'animal' },
    mice: { e: '🐁', n: 'Mice', type: 'animal' },
    eggs: { e: '🥚', n: 'Eggs', type: 'animal' },
    seals: { e: SEAL_SVG, n: 'Seals', type: 'animal' },
    zebra: { e: '🦓', n: 'Zebras', type: 'animal' },
    deer: { e: '🦌', n: 'Deer', type: 'animal' },
    rabbits: { e: '🐇', n: 'Rabbits', type: 'animal' },
    frogs: { e: '🐸', n: 'Frogs', type: 'animal' },
    birds: { e: '🐦', n: 'Small birds', type: 'animal' },
    honey: { e: '🍯', n: 'Honey', type: 'other' },
  };

  // Foods that are clearly NOT on an omnivore's menu (used for wrong answers)
  const OMNI_DISTRACTORS = ['bamboo', 'seals', 'zebra', 'squid', 'nectar'];

  const a = (id, name, emoji, diet, eats, fact, special = '') => ({ id, name, emoji, diet, eats, fact, special });

  const ANIMALS = [
    // ── Carnivores ──
    a('lion', 'Lion', '🦁', 'carnivore', ['zebra', 'deer', 'meat'],
      'A hungry lion can eat up to 40 kg of meat in one meal — then rest for days!'),
    a('tiger', 'Tiger', '🐯', 'carnivore', ['deer', 'meat', 'fish'],
      'Tigers love water. They are strong swimmers and sometimes catch fish in rivers.'),
    a('wolf', 'Wolf', '🐺', 'carnivore', ['deer', 'rabbits', 'meat'],
      'Wolves hunt in packs, which lets them catch animals much bigger than themselves, like elk.'),
    a('shark', 'Shark', '🦈', 'carnivore', ['fish', 'seals', 'squid'],
      'Sharks lose and regrow thousands of teeth — new ones move forward like a conveyor belt.', 'Mostly piscivore'),
    a('eagle', 'Eagle', '🦅', 'carnivore', ['fish', 'rabbits', 'mice'],
      'Eagles have amazing eyesight and can spot a rabbit from over 3 km away.', 'Bird of prey'),
    a('crocodile', 'Crocodile', '🐊', 'carnivore', ['fish', 'birds', 'meat'],
      'Big crocodiles can survive for months without eating a single meal.'),
    a('snake', 'Snake', '🐍', 'carnivore', ['mice', 'frogs', 'eggs'],
      'Snakes swallow food whole — their stretchy jaws let them eat prey wider than their head.'),
    a('owl', 'Owl', '🦉', 'carnivore', ['mice', 'insects', 'birds'],
      'Owls swallow small prey whole, then cough up the bones and fur as a neat "pellet".', 'Bird of prey'),
    a('frog', 'Frog', '🐸', 'carnivore', ['insects', 'worms'],
      'Frogs blink to swallow! Their eyeballs push down to help squeeze food into their throat.', 'Insectivore'),
    a('penguin', 'Penguin', '🐧', 'carnivore', ['fish', 'shrimp', 'squid'],
      'Penguins have spiky, backward-pointing bumps on their tongues to grip slippery fish.', 'Piscivore'),
    a('dolphin', 'Dolphin', '🐬', 'carnivore', ['fish', 'squid', 'shrimp'],
      'Dolphins don\u2019t chew — they swallow fish whole, usually head-first.', 'Piscivore'),
    a('cat', 'Cat', '🐱', 'carnivore', ['meat', 'fish', 'mice'],
      'Cats can\u2019t taste sweet things — they don\u2019t have taste buds for sugar.', 'Obligate carnivore'),
    a('spider', 'Spider', '🕷️', 'carnivore', ['insects'],
      'Spiders can\u2019t chew. They turn their prey\u2019s insides to liquid and slurp it up!', 'Insectivore'),
    a('ladybug', 'Ladybug', '🐞', 'carnivore', ['insects'],
      'Gardeners love ladybugs: one ladybug can eat thousands of tiny plant-eating aphids.', 'Insectivore'),

    // ── Herbivores ──
    a('elephant', 'Elephant', '🐘', 'herbivore', ['grass', 'leaves', 'fruit'],
      'Elephants eat about 150 kg of plants a day and spend up to 16 hours eating!'),
    a('giraffe', 'Giraffe', '🦒', 'herbivore', ['leaves'],
      'A giraffe\u2019s dark tongue is about 45 cm long — perfect for pulling leaves off thorny acacia trees.', 'Browser'),
    a('cow', 'Cow', '🐄', 'herbivore', ['grass', 'grain'],
      'A cow\u2019s stomach has four parts, and cows chew their food twice — it\u2019s called "chewing the cud".', 'Grazer'),
    a('rabbit', 'Rabbit', '🐰', 'herbivore', ['grass', 'veggies', 'leaves'],
      'Wild rabbits mostly eat grass. Carrots are a treat — too many are too sugary for them!'),
    a('koala', 'Koala', '🐨', 'herbivore', ['leaves'],
      'Koalas eat eucalyptus leaves, which give so little energy that koalas sleep up to 20 hours a day.', 'Folivore'),
    a('panda', 'Giant Panda', '🐼', 'herbivore', ['bamboo'],
      'Bamboo makes up about 99% of a panda\u2019s diet — they munch 12 to 38 kg of it every day!'),
    a('horse', 'Horse', '🐴', 'herbivore', ['grass', 'veggies', 'grain'],
      'Horses can\u2019t burp or vomit — food only travels one way through their bodies!', 'Grazer'),
    a('zebra', 'Zebra', '🦓', 'herbivore', ['grass'],
      'Zebras eat the tough tops of tall grass, which helps other grazers reach the softer grass below.', 'Grazer'),
    a('hippo', 'Hippo', '🦛', 'herbivore', ['grass'],
      'Hippos rest in water all day, then come out at night to graze on about 35 kg of grass.', 'Grazer'),
    a('deer', 'Deer', '🦌', 'herbivore', ['leaves', 'nuts', 'grass'],
      'Deer have no top front teeth — they tear plants using a tough pad on their upper jaw.', 'Browser'),
    a('goat', 'Goat', '🐐', 'herbivore', ['leaves', 'grass'],
      'Goats are curious nibblers — some even climb trees to reach the tastiest leaves!', 'Browser'),
    a('butterfly', 'Butterfly', '🦋', 'herbivore', ['nectar'],
      'Butterflies taste with their feet and sip nectar through a straw-like tongue called a proboscis.', 'Nectarivore'),
    a('caterpillar', 'Caterpillar', '🐛', 'herbivore', ['leaves'],
      'Many caterpillars eat their own eggshell as their very first meal, then munch leaves non-stop.', 'Folivore'),
    a('camel', 'Camel', '🐫', 'herbivore', ['grass', 'leaves'],
      'A camel\u2019s hump stores fat, not water! Its tough mouth can chew thorny desert plants.'),
    a('kangaroo', 'Kangaroo', '🦘', 'herbivore', ['grass', 'leaves'],
      'Kangaroos get much of the water they need from the plants they eat.', 'Grazer'),
    a('parrot', 'Parrot', '🦜', 'herbivore', ['seeds', 'nuts', 'fruit'],
      'Parrots use their strong curved beaks like nutcrackers and hold food with their feet.', 'Granivore'),
    a('bee', 'Honeybee', '🐝', 'herbivore', ['nectar'],
      'Bees drink nectar and eat pollen. They turn nectar into honey to feed the whole hive.', 'Nectarivore'),
    a('sloth', 'Sloth', '🦥', 'herbivore', ['leaves'],
      'Sloths digest so slowly that one meal can take up to a month to pass through their body!', 'Folivore'),

    // ── Omnivores ──
    a('bear', 'Brown Bear', '🐻', 'omnivore', ['berries', 'fish', 'honey', 'insects'],
      'Brown bears catch leaping salmon, but most of what they eat is actually plants like berries and roots.'),
    a('pig', 'Pig', '🐷', 'omnivore', ['grain', 'veggies', 'worms', 'fruit'],
      'Pigs dig with their strong snouts for roots and worms — some are even trained to sniff out truffles!'),
    a('raccoon', 'Raccoon', '🦝', 'omnivore', ['fruit', 'fish', 'eggs', 'insects'],
      'Raccoons have super-sensitive paws and often feel or "wash" their food in water before eating.'),
    a('chicken', 'Chicken', '🐔', 'omnivore', ['seeds', 'grain', 'worms', 'insects'],
      'Chickens have no teeth! They swallow tiny pebbles that help grind food in their gizzard.'),
    a('monkey', 'Monkey', '🐒', 'omnivore', ['banana', 'fruit', 'insects', 'eggs'],
      'Many monkeys eat mostly fruit, but snack on insects and eggs for extra protein.'),
    a('human', 'Human', '🧑', 'omnivore', ['fruit', 'veggies', 'meat', 'fish', 'grain'],
      'Humans are omnivores — our flat back teeth grind plants and our front teeth bite through meat.'),
    a('fox', 'Red Fox', '🦊', 'omnivore', ['mice', 'berries', 'insects', 'rabbits'],
      'Foxes can hear mice moving under snow and pounce on them — and they love berries too.'),
    a('hedgehog', 'Hedgehog', '🦔', 'omnivore', ['insects', 'worms', 'fruit'],
      'Hedgehogs got their name from snuffling through hedges for bugs while making pig-like grunts.', 'Mostly insectivore'),
    a('squirrel', 'Squirrel', '🐿️', 'omnivore', ['nuts', 'seeds', 'fruit', 'insects'],
      'Squirrels bury nuts for winter and forget many of them — which helps new trees grow!'),
    a('mouse', 'Mouse', '🐭', 'omnivore', ['seeds', 'grain', 'insects'],
      'Mice are nibblers — they snack 15 to 20 times a day!'),
    a('duck', 'Duck', '🦆', 'omnivore', ['seeds', 'insects', 'fish', 'leaves'],
      'Ducks "dabble" — tipping head-down in the water to nibble plants, snails and bugs.'),
    a('flamingo', 'Flamingo', '🦩', 'omnivore', ['shrimp', 'seeds'],
      'Flamingos are pink because of the algae and tiny shrimp they eat — and they eat upside-down!', 'Filter feeder'),
    a('crab', 'Crab', '🦀', 'omnivore', ['worms', 'fish', 'leaves'],
      'Crabs are scavengers that eat almost anything: seaweed, worms, snails and leftovers.', 'Scavenger'),
    a('ant', 'Ant', '🐜', 'omnivore', ['seeds', 'insects', 'nectar'],
      'Some ants "farm" aphids like tiny cows, milking them for sweet honeydew!'),
    a('skunk', 'Skunk', '🦨', 'omnivore', ['insects', 'fruit', 'eggs', 'mice'],
      'Skunks dig for grubs with long front claws and also gobble fruit, eggs and mice.'),
    a('turkey', 'Turkey', '🦃', 'omnivore', ['seeds', 'nuts', 'insects'],
      'Wild turkeys scratch the forest floor looking for acorns, seeds and bugs.'),
  ];

  const DICTIONARY = [
    ['🦗', 'Insectivore', 'eats mainly insects (frogs, spiders, hedgehogs)'],
    ['🐟', 'Piscivore', 'eats mainly fish (penguins, dolphins)'],
    ['🍎', 'Frugivore', 'eats mainly fruit (many monkeys and bats)'],
    ['🌿', 'Folivore', 'eats mainly leaves (koalas, sloths)'],
    ['🌸', 'Nectarivore', 'drinks flower nectar (butterflies, bees)'],
    ['🌻', 'Granivore', 'eats mainly seeds and grains (parrots)'],
    ['🦴', 'Scavenger', 'eats dead animals it did not hunt (crabs, vultures)'],
    ['🎯', 'Predator', 'hunts other animals for food'],
    ['🐇', 'Prey', 'an animal that is hunted and eaten'],
    ['🌱', 'Producer', 'a plant that makes its own food from sunlight'],
  ];

  const VIDEOS = {
    'herbivore-meadow': {
      src: 'videos/herbivore-meadow.mp4',
      label: 'Plant-Eating Meadow',
      caption: 'A sunny green meadow where an elephant, cow, koala and giraffe graze on grass and leaves.',
      cues: [
        [0.2, 4.5, 'Herbivores eat only plants, like grass, leaves, and fruit!'],
      ],
    },
    'carnivore-hunt': {
      src: 'videos/carnivore-hunt.mp4',
      label: 'Wild Hunters in Action',
      caption: 'A golden savanna at sunset with an eagle soaring overhead while a lion and wolf prowl across the plains.',
      cues: [
        [0.2, 4.5, 'Carnivores are meat eaters that hunt other animals for food!'],
      ],
    },
    'omnivore-feast': {
      src: 'videos/omnivore-feast.mp4',
      label: 'Plants & Animals Buffet',
      caption: 'A forest river where a brown bear and raccoon enjoy wild berries alongside leaping fish.',
      cues: [
        [0.2, 4.5, 'Omnivores eat both plants and animals, like berries and fish!'],
      ],
    },
    'panda-bamboo': {
      src: 'videos/panda-bamboo.mp4',
      label: 'Bamboo Forest',
      caption: 'A misty green bamboo forest with tall swaying stalks and a giant panda happily munching.',
      cues: [
        [0.2, 4.5, 'Giant pandas are herbivores that love munching fresh bamboo!'],
      ],
    },
    'insect-nectar': {
      src: 'videos/insect-nectar.mp4',
      label: 'Flowers, Nectar & Bugs',
      caption: 'A bright flower garden where a butterfly and honeybee flutter near blossoms while a frog watches a leaping insect.',
      cues: [
        [0.2, 4.5, 'Butterflies sip sweet flower nectar while frogs catch insects!'],
      ],
    },
    'ocean-feast': {
      src: 'videos/ocean-feast.mp4',
      label: 'Ocean Menu',
      caption: 'An underwater ocean scene with rising bubbles, swimming schools of fish, a squid, a diving penguin and a gliding shark.',
      cues: [
        [0.2, 4.5, 'Penguins and sharks are ocean carnivores that eat fish and squid!'],
      ],
    },
    'food-chain': {
      src: 'videos/food-chain.mp4',
      label: 'Energy in a Food Chain',
      caption: 'An animated food chain diagram showing energy flowing from the Sun to a Plant, then to a Rabbit, and finally to a Fox.',
      cues: [
        [0.2, 4.5, 'Energy flows from the sun to plants, herbivores, and predators!'],
      ],
    },
    'teeth-tummies': {
      src: 'videos/teeth-tummies.mp4',
      label: 'Teeth & Dentition Clues',
      caption: 'A side-by-side comparison of flat side-to-side grinding teeth for plants and sharp pointed teeth for meat.',
      cues: [
        [0.2, 3.0, 'Herbivores have flat teeth to grind plants.'],
        [3.0, 6.2, 'Carnivores have sharp teeth to tear meat!'],
      ],
    },
    'wild-secrets': {
      src: 'videos/wild-secrets.mp4',
      label: 'Amazing Animal Diet Secrets',
      caption: 'Three wild habitats side by side: a camel walking across desert dunes, a flamingo wading near shrimp, and an owl flying under the night stars.',
      cues: [
        [0.2, 4.8, 'Animals adapt in amazing ways to find and digest their favorite foods!'],
      ],
    },
  };

  // Primary School Syllabus Core Study Notes (Herbivore, Carnivore, Omnivore + Dentition)
  const STUDY_NOTES = [
    {
      tag: 'herbivore',
      icon: '🌿',
      title: 'Herbivores (Plant Eaters)',
      points: [
        'Eat only plants: grass, leaves, bamboo, fruit, vegetables, seeds and nectar.',
        'Teeth: strong front incisors to cut plants and flat, wide back molars to grind tough plants.',
        'Examples: cow, elephant, giraffe, rabbit, goat, horse, panda and koala.',
      ],
    },
    {
      tag: 'carnivore',
      icon: '🥩',
      title: 'Carnivores (Animal / Meat Eaters)',
      points: [
        'Eat only other animals: meat, fish, insects, mice, frogs and birds.',
        'Teeth: sharp, pointed canines to grip and tear meat.',
        'Examples: lion, tiger, wolf, shark, eagle, snake, crocodile and cat.',
      ],
    },
    {
      tag: 'omnivore',
      icon: '🍽️',
      title: 'Omnivores (Eat Plants & Animals)',
      points: [
        'Eat both plants and other animals — fruit, grains, veggies, insects, fish and meat.',
        'Teeth: all 3 types — incisors to cut, canines to tear, and molars to grind food.',
        'Examples: brown bear, chicken, monkey, duck, squirrel, raccoon and humans.',
      ],
    },
    {
      tag: 'fact',
      icon: '🦷',
      title: 'Teeth Clues (Primary Syllabus)',
      points: [
        'Incisors (front teeth): cut and bite food (plants & fruit).',
        'Canines (sharp pointed teeth): grip and tear meat (big in carnivores!).',
        'Molars (flat back teeth): grind and crush food (big and flat in herbivores!).',
      ],
    },
  ];

  // Additional Information (Enrichment beyond the 3 main Primary School syllabus diets)
  const EXTRA_NOTES = [
    {
      tag: 'fact',
      icon: '🦗',
      title: 'Special Sub-Groups (Bonus)',
      points: [
        'Insectivore: eats mainly insects (frogs, spiders, ladybugs).',
        'Piscivore: eats mainly fish (penguins, dolphins).',
        'Nectarivore & Frugivore: sips flower nectar (butterflies, bees) or eats mostly fruit.',
        'Folivore & Granivore: eats mainly leaves (koalas, sloths) or seeds/grains (parrots).',
      ],
    },
    {
      tag: 'foodchain',
      icon: '🔗',
      title: 'Food Chains & Nature Roles (Bonus)',
      points: [
        'Producers (plants) make their own food using sunlight.',
        'Predators hunt other animals (prey) for food.',
        'Scavengers (crabs, vultures) clean up nature by eating dead animals they did not hunt.',
      ],
    },
    {
      tag: 'general',
      icon: '🌟',
      title: 'Amazing Digestion & Body Facts (Bonus)',
      points: [
        'Cows have a 4-part stomach to help digest tough grass; chickens swallow pebbles to grind food.',
        'Flamingos turn pink from pigments in the algae and shrimp they eat.',
        'Owls cough up neat pellets of undigested bones and fur; camels store fat (not water!) in their humps.',
        'Sloths digest so slowly that a single meal can take up to a month!',
      ],
    },
  ];

  // Primary School Syllabus Quiz ONLY (Herbivore, Carnivore, Omnivore & Teeth)
  // First answer in each list is the correct one (options are shuffled in game)
  const QUIZ = [
    { q: 'What do we call an animal that eats ONLY plants?', a: ['Herbivore', 'Carnivore', 'Omnivore', 'All of these'],
      video: 'herbivore-meadow',
      why: 'Herbivores (like cows, elephants and rabbits) eat only plants.' },
    { q: 'What do we call an animal that eats ONLY other animals?', a: ['Carnivore', 'Herbivore', 'Omnivore', 'Plant eater'],
      video: 'carnivore-hunt',
      why: 'Carnivores (like lions, tigers and sharks) eat only other animals.' },
    { q: 'What do we call an animal that eats BOTH plants and other animals?', a: ['Omnivore', 'Herbivore', 'Carnivore', 'Leaf eater'],
      video: 'omnivore-feast',
      why: 'Omnivores (like bears, chickens and humans) eat both plants and animals.' },
    { q: 'Which of these animals is a HERBIVORE?', a: ['Elephant', 'Lion', 'Shark', 'Eagle'],
      video: 'herbivore-meadow',
      why: 'Elephants are herbivores — they eat grass, leaves and fruit.' },
    { q: 'Which of these animals is a CARNIVORE?', a: ['Tiger', 'Cow', 'Giraffe', 'Rabbit'],
      video: 'carnivore-hunt',
      why: 'Tigers are carnivores that hunt other animals like deer and fish.' },
    { q: 'Which of these animals is an OMNIVORE?', a: ['Brown bear', 'Koala', 'Lion', 'Giraffe'],
      video: 'omnivore-feast',
      why: 'Brown bears eat plants like berries and roots, and also catch fish and insects.' },
    { q: 'What does a giant panda eat almost all the time?', a: ['Bamboo (plants)', 'Fish', 'Meat', 'Mice'],
      video: 'panda-bamboo',
      why: 'Giant pandas are herbivores — bamboo makes up about 99% of their diet!' },
    { q: 'Humans are…', a: ['Omnivores', 'Herbivores', 'Carnivores', 'Only plant eaters'],
      video: 'omnivore-feast',
      why: 'Humans are omnivores because we can eat both plants (fruit, veggies, grains) and animals (fish, meat).' },
    { q: 'What kind of back teeth help HERBIVORES grind tough plants?', a: ['Flat, wide molars', 'Long sharp fangs', 'No teeth at all', 'Sharp hooked claws'],
      video: 'teeth-tummies',
      why: 'Herbivores use flat, wide molars to grind leaves and grass smoothly.' },
    { q: 'What kind of teeth help CARNIVORES grip and tear meat?', a: ['Sharp, pointed canines', 'Flat, wide teeth only', 'Only tusks', 'Soft flat pads'],
      video: 'teeth-tummies',
      why: 'Carnivores have sharp, pointed canine teeth to grip and tear meat.' },
    { q: 'Why do OMNIVORES have incisors, canines AND flat molars?', a: ['To eat both plants and meat', 'Only to chew grass', 'Only to tear meat', 'They do not chew food'],
      video: 'teeth-tummies',
      why: 'Incisors cut food, canines tear meat, and flat molars grind plants — perfect for omnivores!' },
    { q: 'A giraffe eats acacia leaves from tall trees. What is a giraffe?', a: ['Herbivore', 'Carnivore', 'Omnivore', 'Meat eater'],
      video: 'herbivore-meadow',
      why: 'Giraffes eat only leaves and plants, making them herbivores.' },
    { q: 'A chicken eats seeds, grains AND worms and insects. What is a chicken?', a: ['Omnivore', 'Herbivore', 'Carnivore', 'Plant eater only'],
      video: 'omnivore-feast',
      why: 'Because chickens eat both plants (seeds, grain) and animals (worms, insects), they are omnivores!' },
    { q: 'A crocodile eats fish, birds and meat. Which diet group does it belong to?', a: ['Carnivore', 'Herbivore', 'Omnivore', 'Fruit eater'],
      video: 'carnivore-hunt',
      why: 'Crocodiles eat only other animals, so they are carnivores.' },
    { q: 'A cow eats grass and grain. What kind of eater is a cow?', a: ['Herbivore', 'Carnivore', 'Omnivore', 'Meat eater'],
      video: 'herbivore-meadow',
      why: 'Cows eat only plants like grass and grain — they are herbivores.' },
    { q: 'Which pair are BOTH carnivores?', a: ['Lion and Shark', 'Cow and Rabbit', 'Bear and Monkey', 'Elephant and Tiger'],
      video: 'ocean-feast',
      why: 'Both lions (meat) and sharks (fish, seals, squid) eat only other animals.' },
    { q: 'Which pair are BOTH herbivores?', a: ['Rabbit and Koala', 'Wolf and Eagle', 'Chicken and Bear', 'Cat and Giraffe'],
      video: 'herbivore-meadow',
      why: 'Rabbits eat grass/veggies and koalas eat eucalyptus leaves — both are herbivores!' },
    { q: 'A monkey eats bananas, fruit, insects and eggs. What is a monkey?', a: ['Omnivore', 'Herbivore', 'Carnivore', 'Grass eater'],
      video: 'omnivore-feast',
      why: 'Monkeys eat both plants (fruit, bananas) and animals (insects, eggs), so they are omnivores.' },
  ];

  return { DIETS, FOODS, OMNI_DISTRACTORS, ANIMALS, DICTIONARY, VIDEOS, STUDY_NOTES, EXTRA_NOTES, QUIZ };
})();
