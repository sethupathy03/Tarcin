/* ===== MILESTONES DATA ===== */
const milestones = [
  {
    year: 1969,
    title: "Unix Operating System Created",
    description: "A powerful operating system that many computers still use today.",
    image: "unix.png",
    emoji: "🐧",
    hint: "This operating system came before personal computers were common in homes."
  },
  {
    year: 1981,
    title: "IBM Personal Computer Launched",
    description: "IBM launched its first personal computer for home and office use.",
    image: "ibm.svg",
    emoji: "🖥️",
    hint: "Personal computers became popular before the internet was available to everyone."
  },
  {
    year: 1958,
    title: "Integrated Circuit Invented",
    description: "Tiny electronic circuits were created, making computers smaller!",
    image: "chip.png",
    emoji: "🔬",
    hint: "This invention happened after the first computers but before operating systems."
  },
  {
    year: 1991,
    title: "World Wide Web Goes Public",
    description: "The World Wide Web became available for everyone to use.",
    image: "web.svg",
    emoji: "🌐",
    hint: "Think about when people first started using websites."
  },
  {
    year: 2007,
    title: "First iPhone Announced",
    description: "Apple announced the iPhone, changing the way we use phones.",
    image: "iphone.svg",
    emoji: "📱",
    hint: "This happened after computers became common in homes."
  },
  {
    year: 1945,
    title: "ENIAC - First General-Purpose Electronic Computer",
    description: "ENIAC was one of the first computers built to solve many problems.",
    image: "eniac.png",
    emoji: "🧮",
    hint: "This computer is one of the oldest inventions on the list!"
  }
];

/* Correct chronological order for validation */
const correctOrder = [1945, 1958, 1969, 1981, 1991, 2007];

/* ===== DOM REFERENCES ===== */
const eventList = document.getElementById('eventList');
const speechBubble = document.getElementById('speechBubble');
const bubbleText = document.getElementById('bubbleText');
const hintBtn = document.getElementById('hintBtn');
const listenBtn = document.getElementById('listenBtn');
const timelineBtn = document.getElementById('timelineBtn');
const checkOrderBtn = document.getElementById('checkOrderBtn');
const successModal = document.getElementById('successModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const heroImage = document.getElementById('heroImage');
const confettiContainer = document.getElementById('confettiContainer');

/* ===== STATE ===== */
let currentMilestones = [];
let hintIndex = 0;
let gameCompleted = false;

/* ===== INITIALIZATION ===== */
function init() {
  gameCompleted = false;
  currentMilestones = shuffleArray([...milestones]);
  renderMilestones();
  showBubble("Let's put these computing events in the right order! 🚀");
}

/* Fisher-Yates shuffle */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ===== RENDER MILESTONES ===== */
function renderMilestones() {
  eventList.innerHTML = '';
  currentMilestones.forEach((milestone, index) => {
    const li = document.createElement('li');
    li.className = 'event-item';
    li.dataset.year = milestone.year;
    li.dataset.index = index;
    li.innerHTML = `
      <div class="event-left">
        <span class="event-number">${index + 1}</span>
        <div class="event-info">
          <span class="event-year">${milestone.year}</span>
          <h3>${milestone.title}</h3>
          <p>${milestone.description}</p>
        </div>
      </div>
      <div class="event-right">
        <img class="event-illustration" src="${milestone.image}" alt="${milestone.title}" 
             onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<span style=&quot;font-size:3rem;display:grid;place-items:center;width:80px;height:80px;background:#F3F4F6;border-radius:14px&quot;>${milestone.emoji}</span>')" />
        <div class="event-actions">
          <button class="arrow-btn up" aria-label="Move ${milestone.title} up" title="Move up">▲</button>
          <button class="arrow-btn down" aria-label="Move ${milestone.title} down" title="Move down">▼</button>
        </div>
      </div>
    `;
    eventList.appendChild(li);
  });
}

/* ===== UPDATE NUMBERS ===== */
function refreshNumbers() {
  const items = Array.from(eventList.children);
  items.forEach((item, index) => {
    const numberEl = item.querySelector('.event-number');
    numberEl.textContent = index + 1;
  });
}

/* ===== MOVE ITEM ===== */
function moveItem(item, direction) {
  if (!item || gameCompleted) return;

  const sibling = direction === 'up'
    ? item.previousElementSibling
    : item.nextElementSibling;

  if (!sibling) {
    showBubble(
      direction === 'up'
        ? "This event is already at the very top! 🔝"
        : "This event is already at the bottom! 🔽"
    );
    return;
  }

  // Perform the swap
  if (direction === 'up') {
    eventList.insertBefore(item, sibling);
    item.classList.add('moving-up');
    sibling.classList.add('moving-down');
  } else {
    eventList.insertBefore(sibling, item);
    item.classList.add('moving-down');
    sibling.classList.add('moving-up');
  }

  // Update the internal milestones array to match DOM
  updateMilestonesFromDOM();

  // Remove animation classes after animation completes
  setTimeout(() => {
    item.classList.remove('moving-up', 'moving-down');
    sibling.classList.remove('moving-up', 'moving-down');
  }, 400);

  refreshNumbers();

  // Show encouraging messages
  const encouragements = [
    "Great move! Keep going! 💪",
    "You're doing awesome! 🌟",
    "Nice swap! Getting closer! 🎯",
    "Keep arranging! You've got this! 🚀",
    "That looks better! ✨",
    "Super sorting skills! 🦸"
  ];
  const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
  showBubble(msg);
}

/* Update milestones array from current DOM order */
function updateMilestonesFromDOM() {
  const items = Array.from(eventList.children);
  currentMilestones = items.map(item => {
    const year = Number(item.dataset.year);
    return milestones.find(m => m.year === year);
  });
}

/* ===== SPEECH BUBBLE ===== */
let bubbleTimeout = null;

function showBubble(message, duration = 5000) {
  bubbleText.textContent = message;
  speechBubble.classList.remove('hidden');
  speechBubble.classList.add('glow');

  setTimeout(() => {
    speechBubble.classList.remove('glow');
  }, 800);

  if (bubbleTimeout) clearTimeout(bubbleTimeout);
  if (duration > 0) {
    bubbleTimeout = setTimeout(() => {
      speechBubble.classList.add('hidden');
    }, duration);
  }
}

/* ===== HINT SYSTEM ===== */
function showHint() {
  // Get the first item that's out of place
  const items = Array.from(eventList.children);
  const years = items.map(item => Number(item.dataset.year));

  // Find first incorrectly placed item and show its hint
  let hintMilestone = null;
  for (let i = 0; i < years.length; i++) {
    if (years[i] !== correctOrder[i]) {
      hintMilestone = milestones.find(m => m.year === years[i]);
      break;
    }
  }

  if (!hintMilestone) {
    showBubble("Everything looks correct! Try clicking 'Check Order'! 🎉", 4000);
    return;
  }

  showBubble(`💡 Hint: ${hintMilestone.hint}`, 6000);
}

/* ===== LISTEN FEATURE (SpeechSynthesis) ===== */
function readAloud() {
  if (!('speechSynthesis' in window)) {
    showBubble("Sorry, your browser doesn't support speech! 😔");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const items = Array.from(eventList.children);
  const textParts = [];

  items.forEach((item, index) => {
    const year = item.dataset.year;
    const milestone = milestones.find(m => m.year === Number(year));
    if (milestone) {
      textParts.push(
        `Number ${index + 1}. ${milestone.title}. ${milestone.description}. Hint: ${milestone.hint}`
      );
    }
  });

  const fullText = textParts.join('. Next milestone. ');
  const utterance = new SpeechSynthesisUtterance(fullText);
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  // Try to use a nice voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v =>
    v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  listenBtn.classList.add('active');
  showBubble("🔊 Reading the milestones aloud for you!", 0);

  utterance.onend = () => {
    listenBtn.classList.remove('active');
    showBubble("Done reading! Now try sorting them! 📝", 4000);
  };

  window.speechSynthesis.speak(utterance);
}

/* ===== VALIDATE ORDER ===== */
function checkOrder() {
  if (gameCompleted) return;

  const items = Array.from(eventList.children);
  const years = items.map(item => Number(item.dataset.year));

  // Check if correct
  const isCorrect = years.every((year, index) => year === correctOrder[index]);

  // Clear previous states
  items.forEach(item => {
    item.classList.remove('correct', 'incorrect');
  });

  if (isCorrect) {
    // Correct order!
    gameCompleted = true;

    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('correct');
      }, index * 120);
    });

    setTimeout(() => {
      showSuccessModal();
      createConfetti();
    }, items.length * 120 + 300);

    showBubble("🎉 You did it! The timeline is perfect!", 0);

  } else {
    // Wrong order - highlight incorrect items
    let incorrectCount = 0;
    items.forEach((item, index) => {
      const year = Number(item.dataset.year);
      if (year !== correctOrder[index]) {
        setTimeout(() => {
          item.classList.add('incorrect');
        }, index * 80);
        incorrectCount++;
      } else {
        setTimeout(() => {
          item.classList.add('correct');
        }, index * 80);
      }
    });

    // Remove incorrect styling after a delay
    setTimeout(() => {
      items.forEach(item => {
        item.classList.remove('correct', 'incorrect');
      });
    }, 2500);

    showBubble("Almost there! Look at the years carefully. 🤔 The red cards need to move!", 5000);
  }
}

/* ===== SUCCESS MODAL ===== */
function showSuccessModal() {
  successModal.classList.add('show');
  successModal.setAttribute('aria-hidden', 'false');
}

function hideSuccessModal() {
  successModal.classList.remove('show');
  successModal.setAttribute('aria-hidden', 'true');
}

/* ===== CONFETTI ===== */
function createConfetti() {
  const colors = ['#6366F1', '#F97316', '#22C55E', '#FBBF24', '#EC4899', '#3B82F6', '#14B8A6', '#EF4444'];
  const pieceCount = 60;

  for (let i = 0; i < pieceCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';

    const size = Math.random() * 10 + 6;
    const left = Math.random() * 100;
    const delay = Math.random() * 1.2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = Math.random() * 360;

    confetti.style.cssText = `
      width: ${size}px;
      height: ${size * 1.8}px;
      left: ${left}%;
      top: -20px;
      background: ${color};
      animation-delay: ${delay}s;
      transform: rotate(${rotation}deg);
    `;

    confettiContainer.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 4000 + delay * 1000);
  }
}

/* ===== EVENT LISTENERS ===== */

// Arrow buttons (event delegation)
eventList.addEventListener('click', (e) => {
  const button = e.target.closest('.arrow-btn');
  if (!button) return;

  const item = button.closest('.event-item');
  if (button.classList.contains('up')) {
    moveItem(item, 'up');
  } else if (button.classList.contains('down')) {
    moveItem(item, 'down');
  }
});

// Hint button
hintBtn.addEventListener('click', showHint);

// Listen button
listenBtn.addEventListener('click', readAloud);

// Timeline button
timelineBtn.addEventListener('click', () => {
  const timelineSection = document.getElementById('timelineSection');
  timelineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showBubble("Here's the timeline! Use the arrows to sort! 🎯", 3000);
});

// Check order button
checkOrderBtn.addEventListener('click', checkOrder);

// Modal close / Play Again
modalCloseBtn.addEventListener('click', () => {
  hideSuccessModal();
  // Reset the game
  setTimeout(() => {
    init();
  }, 400);
});

// Close modal on overlay click
successModal.addEventListener('click', (e) => {
  if (e.target === successModal) {
    hideSuccessModal();
  }
});

// Load voices for SpeechSynthesis (some browsers load them async)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/* ===== START THE GAME ===== */
document.addEventListener('DOMContentLoaded', init);
