
const EVENTS = [
  {
    id: 'eniac', year: 1945,
    title: 'ENIAC',
    subtitle: 'First General-Purpose Electronic Computer',
    icon: '🖥️',
    hint: "The ENIAC came first — it was as big as a room and used thousands of vacuum tubes! Try placing it on the far left.",
    fact: "ENIAC weighed 30 tons and could do 5,000 additions per second — amazing for 1945!"
  },
  {
    id: 'ic', year: 1958,
    title: 'Integrated Circuit',
    subtitle: 'Tiny chip with many transistors',
    icon: '🔲',
    hint: "Before personal computers, the Integrated Circuit (a tiny chip) was invented. It came after ENIAC but before Unix.",
    fact: "Jack Kilby invented the IC in 1958 — and later won a Nobel Prize for it!"
  },
  {
    id: 'unix', year: 1969,
    title: 'Unix OS',
    subtitle: 'Unix Operating System Created',
    icon: '🧑‍💻',
    hint: "Unix is an operating system created at Bell Labs. It came after the IC but before the IBM PC.",
    fact: "Unix inspired Linux, macOS, and even Android — its ideas are everywhere!"
  },
  {
    id: 'ibmpc', year: 1981,
    title: 'IBM PC',
    subtitle: 'IBM Personal Computer Launched',
    icon: '💻',
    hint: "The IBM PC made computers personal — for homes and offices. It launched in the 1980s.",
    fact: "The IBM PC ran an operating system called MS-DOS made by a young company… Microsoft!"
  },
  {
    id: 'web', year: 1991,
    title: 'World Wide Web',
    subtitle: 'The Web Goes Public',
    icon: '🌐',
    hint: "The World Wide Web went public in the early 90s — after the IBM PC, but before the iPhone.",
    fact: "Tim Berners-Lee built the first website at CERN — it’s still online today!"
  },
  {
    id: 'iphone', year: 2007,
    title: 'iPhone',
    subtitle: 'First iPhone Announced',
    icon: '📱',
    hint: "The iPhone is the newest event here — place it on the far right!",
    fact: "Steve Jobs unveiled the very first iPhone in January 2007 — and changed phones forever."
  }
];

const SORTED = [...EVENTS].sort((a, b) => a.year - b.year);
const CORRECT_ORDER = SORTED.map(e => e.id);

/* ----------- State ----------- */
const state = {
  pool: [],           // ids currently in card pool
  slots: Array(6).fill(null), // ids placed in slots
  score: 0,
  soundOn: true,
  wrongAttempts: 0,
};

/* ----------- DOM ----------- */
const $ = (id) => document.getElementById(id);
const cardPool = $('cardPool');
const timelineTrack = $('timelineTrack');
const speechText = $('speechText');
const speechBubble = $('speechBubble');
const scoreEl = $('score');
const soundBtn = $('soundBtn');
const soundIcon = $('soundIcon');
const winModal = $('winModal');
const modalText = $('modalText');
const finalScoreEl = $('finalScore');

/* ----------- Audio (Web Audio API beeps) ----------- */
let audioCtx;
function tone(freq, dur = 0.15, type = 'sine', gain = 0.12) {
  if (!state.soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(audioCtx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* ignore */ }
}
const SFX = {
  pickup:   () => tone(660, 0.08, 'square', 0.08),
  drop:     () => tone(440, 0.12, 'triangle', 0.1),
  correct:  () => { tone(660, 0.12, 'sine'); setTimeout(() => tone(880, 0.14, 'sine'), 110); setTimeout(() => tone(1175, 0.2, 'sine'), 240); },
  wrong:    () => { tone(220, 0.16, 'sawtooth', 0.08); setTimeout(() => tone(180, 0.18, 'sawtooth', 0.08), 140); },
  win:      () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.12), i * 140));
  },
};

/* ----------- Helpers ----------- */
function findEvent(id) { return EVENTS.find(e => e.id === id); }

/* ----------- Speech bubble ----------- */
let speechTimer;
function speak(text, duration = 6000) {
  speechText.innerHTML = text;
  speechBubble.classList.remove('hidden');
  speechBubble.style.animation = 'none';
  void speechBubble.offsetWidth;
  speechBubble.style.animation = '';
  clearTimeout(speechTimer);
  if (duration > 0) {
    speechTimer = setTimeout(() => {
      speechBubble.classList.add('hidden');
    }, duration);
  }
}

/* ----------- Rendering ----------- */
function renderSlots() {
  timelineTrack.innerHTML = '<div class="track-line"></div>';
  for (let i = 0; i < 6; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.slotIndex = i;
    slot.dataset.slotNum = i + 1;
    slot.setAttribute('data-testid', `slot-${i}`);

    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const cardId = e.dataTransfer.getData('text/plain');
      if (cardId) placeCardInSlot(cardId, i);
    });

    if (state.slots[i]) {
      slot.appendChild(buildCardEl(state.slots[i], { inSlot: true }));
    }
    timelineTrack.appendChild(slot);
  }
}

function renderPool() {
  cardPool.innerHTML = '';
  state.pool.forEach(id => {
    cardPool.appendChild(buildCardEl(id, { inSlot: false }));
  });
}

function buildCardEl(id, { inSlot }) {
  const ev = findEvent(id);
  const idx = EVENTS.findIndex(e => e.id === id);
  const card = document.createElement('div');
  card.className = `event-card c${idx}`;
  card.draggable = true;
  card.dataset.cardId = id;
  card.setAttribute('data-testid', `card-${id}`);
  card.innerHTML = `
    <div class="icon" aria-hidden="true">${ev.icon}</div>
    <div class="card-title">${ev.title}</div>
    <div class="card-year">${ev.year}</div>
  `;

  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
    SFX.pickup();
  });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));

  // Touch fallback: tap to send to first empty slot, or tap card in slot to return.
  card.addEventListener('click', () => {
    if (inSlot) {
      returnCardToPool(id);
    } else {
      const firstEmpty = state.slots.findIndex(s => s === null);
      if (firstEmpty >= 0) placeCardInSlot(id, firstEmpty);
    }
  });

  return card;
}

/* ----------- Game actions ----------- */
function placeCardInSlot(cardId, slotIndex) {
  // If slot occupied, swap occupant back to pool
  if (state.slots[slotIndex]) {
    const evictedId = state.slots[slotIndex];
    state.pool.push(evictedId);
  }
  // Remove from pool if present
  state.pool = state.pool.filter(id => id !== cardId);
  // Remove from any other slot if present
  state.slots = state.slots.map(s => s === cardId ? null : s);
  // Place
  state.slots[slotIndex] = cardId;

  SFX.drop();
  renderAll();
  maybeProgressHint();
}

function returnCardToPool(cardId) {
  state.slots = state.slots.map(s => s === cardId ? null : s);
  if (!state.pool.includes(cardId)) state.pool.push(cardId);
  SFX.pickup();
  renderAll();
}

function maybeProgressHint() {
  const placed = state.slots.filter(Boolean).length;
  if (placed === 6) {
    speak("All cards placed! Tap <strong>Check Answers</strong> to see how you did.", 5000);
  } else if (placed === 3) {
    speak("Halfway there! Remember: oldest on the left, newest on the right.", 4500);
  }
}

function checkAnswers() {
  if (state.slots.some(s => s === null)) {
    speak("Whoa there, hero! Please place <strong>all six</strong> cards on the timeline first.", 4000);
    SFX.wrong();
    return;
  }

  let correctCount = 0;
  // Reveal years
  document.querySelectorAll('.event-card').forEach(c => c.classList.add('revealed'));

  const slotEls = document.querySelectorAll('.slot');
  state.slots.forEach((id, idx) => {
    const slotEl = slotEls[idx];
    slotEl.classList.remove('correct', 'wrong');
    if (id === CORRECT_ORDER[idx]) {
      slotEl.classList.add('correct');
      correctCount++;
    } else {
      slotEl.classList.add('wrong');
    }
  });

  state.score = correctCount * 100;
  scoreEl.textContent = state.score;

  if (correctCount === 6) {
    SFX.win();
    showWinModal();
    fireConfetti();
  } else {
    state.wrongAttempts++;
    SFX.wrong();
    // Find first wrong slot and give hint about it
    const firstWrongIdx = state.slots.findIndex((id, i) => id !== CORRECT_ORDER[i]);
    const wrongCardId = state.slots[firstWrongIdx];
    const hint = findEvent(wrongCardId).hint;
    speak(`Hmm, the <strong>${findEvent(wrongCardId).title}</strong> card isn't quite right.<br/>${hint}`, 9000);
  }
}

function renderAll() {
  renderSlots();
  renderPool();
}

/* ----------- Win modal ----------- */
function showWinModal() {
  const bonus = Math.max(0, 200 - state.wrongAttempts * 50);
  const total = state.score + bonus;
  modalText.innerHTML = state.wrongAttempts === 0
    ? "Perfect on the first try! You're a true Code Historian. 🏆"
    : `Awesome work! You sorted all six events correctly.`;
  finalScoreEl.textContent = `+${total} pts`;
  winModal.classList.remove('hidden');
}
function hideWinModal() { winModal.classList.add('hidden'); }

/* ----------- Confetti ----------- */
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let confettiRAF;
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function fireConfetti() {
  const colors = ['#ff6b6b', '#ffd23f', '#6bd0ff', '#4ade80', '#c084fc', '#fb923c'];
  confettiPieces = [];
  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      r: 4 + Math.random() * 6,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }
  cancelAnimationFrame(confettiRAF);
  animateConfetti();
  setTimeout(() => { confettiPieces = []; ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);
}
function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.05;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    if (p.shape === 'rect') ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
    else { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });
  confettiPieces = confettiPieces.filter(p => p.y < canvas.height + 30);
  if (confettiPieces.length) confettiRAF = requestAnimationFrame(animateConfetti);
}

/* ----------- Wire up controls ----------- */
$('checkBtn').addEventListener('click', checkAnswers);
soundBtn.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  soundIcon.textContent = state.soundOn ? '🔊' : '🔇';
  if (state.soundOn) tone(880, 0.08, 'sine', 0.08);
});

// Make pool a drop target too (drop back from a slot)
cardPool.addEventListener('dragover', (e) => e.preventDefault());
cardPool.addEventListener('drop', (e) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData('text/plain');
  if (cardId) returnCardToPool(cardId);
});

// Hero click for an encouraging tip
$('hero').addEventListener('click', () => {
  const tips = [
    "Tip: <strong>ENIAC</strong> is the oldest event here. It belongs all the way on the left!",
    "Tip: The <strong>iPhone</strong> is the newest event — far right!",
    "Tip: Unix came before the IBM PC, which came before the World Wide Web.",
    "Drag a card to a slot, or tap a card on mobile to auto-place it.",
    "Click a placed card to send it back to the pool.",
  ];
  speak(tips[Math.floor(Math.random() * tips.length)], 5500);
  SFX.pickup();
});

/* ----------- Init ----------- */
state.pool = EVENTS.map(e => e.id);
state.slots = Array(6).fill(null);
renderAll();
setTimeout(() => speak("Hi, I'm <strong>Captain Code</strong> 🦸! Drag the cards onto the timeline — oldest on the left. I'll help if you get stuck!", 7000), 400);
