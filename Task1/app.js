// Storage Lab - Game Script

// 1. Files database (Exactly 10 files)
const ALL_FILES = [
    { id: 'file-1', name: 'Pop Song', size: '5 MB', category: 'music', device: 'cd', hint: 'A Pop Song is 5 MB. It is too big for a Floppy Disk (1.44 MB) but fits easily on a CD-ROM!' },
    { id: 'file-2', name: 'Text Doc', size: '12 KB', category: 'doc', device: 'floppy', hint: 'Text Docs are very small (12 KB) and fit perfectly on a Floppy Disk!' },
    { id: 'file-3', name: '4K Video', size: '2.5 GB', category: 'video', device: 'usb', hint: 'A 4K Video is huge (2.5 GB). It needs a spacious USB Drive!' },
    { id: 'file-4', name: 'Pixel Art', size: '3 MB', category: 'image', device: 'cd', hint: 'A 3 MB Pixel Art fits perfectly on a CD-ROM which holds up to 700 MB!' },
    { id: 'file-5', name: 'Scratch Project', size: '8 MB', category: 'code', device: 'cd', hint: 'A Scratch Project is 8 MB. It fits nicely on a CD-ROM!' },
    { id: 'file-6', name: 'E-book', size: '850 KB', category: 'doc', device: 'floppy', hint: 'An E-book (850 KB) is under the 1.44 MB Floppy Disk limit, so it fits!' },
    { id: 'file-7', name: 'School Photo', size: '1.2 MB', category: 'image', device: 'floppy', hint: 'A School Photo (1.2 MB) is small enough to fit on a Floppy Disk!' },
    { id: 'file-8', name: 'OS Installer', size: '4.5 GB', category: 'code', device: 'usb', hint: 'Operating system installers are huge (4.5 GB) and require a USB Drive.' },
    { id: 'file-9', name: 'Large Database', size: '12 GB', category: 'doc', device: 'usb', hint: 'A 12 GB Database is far too big for a CD. Use a USB Drive!' },
    { id: 'file-10', name: 'Symphony Audio', size: '120 MB', category: 'music', device: 'cd', hint: 'Symphony audio files fit easily on a CD-ROM (up to 700 MB).' }
];

// SVGs for file category icons
const ICONS = {
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/><path d="M9 10h.01M15 10h.01"/><path d="M10 14s1 1.5 2 1.5 2-1.5 2-1.5"/></svg>`
};

// 2. Game State Variables
let gamePool = [];      // Remaining files to be introduced
let activeTray = [];    // Currently visible files in the tray (max 5)
let matchedCount = 0;
let attempts = 0;
let correctMatches = 0;
let selectedFileElement = null;
let soundEnabled = true;

// DOM Elements
const fileTray = document.getElementById('file-tray');
const moreFilesCard = document.getElementById('more-files-card');
const moreCount = document.getElementById('more-count');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');
const winModal = document.getElementById('win-modal');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnBack = document.getElementById('btn-back');
const btnListen = document.getElementById('btn-listen');
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');

// Synthesizer Audio Context
let audioCtx = null;

// Initialize Game
function initGame() {
    // Reset state
    matchedCount = 0;
    attempts = 0;
    correctMatches = 0;
    selectedFileElement = null;
    
    // Shuffle all files to make it fun
    const shuffled = [...ALL_FILES].sort(() => Math.random() - 0.5);
    
    // Place first 5 in active tray, rest in gamePool
    activeTray = shuffled.slice(0, 5);
    gamePool = shuffled.slice(5);
    
    // Clear stored files representations inside storage cards
    document.getElementById('stored-floppy').innerHTML = '';
    document.getElementById('stored-cd').innerHTML = '';
    document.getElementById('stored-usb').innerHTML = '';
    
    updateUI();
    renderTray();
    
    // Hide win modal
    winModal.classList.add('hidden');
}

// Render dynamic file cards in bottom tray
function renderTray() {
    fileTray.innerHTML = '';
    
    activeTray.forEach((file) => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.id = file.id;
        card.draggable = true;
        card.dataset.category = file.category;
        
        card.innerHTML = `
            <div class="file-icon">
                ${ICONS[file.category]}
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${file.size}</div>
        `;
        
        // Drag and Drop Listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        // Tap/Click Select Listeners
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            selectFile(card);
        });
        
        fileTray.appendChild(card);
    });
    
    // Update more-files count card
    const remaining = gamePool.length;
    if (remaining > 0) {
        moreFilesCard.style.display = 'flex';
        moreCount.textContent = `+${remaining}`;
    } else {
        moreFilesCard.style.display = 'none';
    }
}

// Update top statistics and progress bar
function updateUI() {
    const percentage = (matchedCount / ALL_FILES.length) * 100;
    progressBarFill.style.width = `${percentage}%`;
    progressText.textContent = `${matchedCount}/${ALL_FILES.length}`;
}

// Select a file card (click flow)
function selectFile(element) {
    if (selectedFileElement) {
        selectedFileElement.classList.remove('selected');
    }
    
    if (selectedFileElement === element) {
        selectedFileElement = null; // Toggle off
    } else {
        selectedFileElement = element;
        selectedFileElement.classList.add('selected');
        
        // Accessible Announcement
        const fileObj = getFileObject(element.id);
        speak(`Selected ${fileObj.name}, size ${fileObj.size}. Choose a storage device.`);
    }
}

// Retrieve file configurations by ID
function getFileObject(id) {
    return ALL_FILES.find(f => f.id === id);
}

// Handle Match logic
function attemptMatch(fileId, deviceType, targetCardElement) {
    attempts++;
    const fileObj = getFileObject(fileId);
    
    if (fileObj.device === deviceType) {
        // SUCCESS MATCH
        correctMatches++;
        matchedCount++;
        
        // Update storage card visual
        targetCardElement.classList.add('card-success-flash');
        setTimeout(() => targetCardElement.classList.remove('card-success-flash'), 500);
        
        // Add particle pop effect
        createParticles(targetCardElement.querySelector('.success-particle-emitter'));
        
        // Play audio feed
        playSynthSound('success');
        speak(`Correct! ${fileObj.name} sent to ${deviceType.toUpperCase()}.`);
        
        // Add mini dot preview representation to card
        addStoredDotPreview(deviceType, fileObj.category);
        
        // Remove from active tray
        activeTray = activeTray.filter(f => f.id !== fileId);
        
        // Pull next file from pool if available
        if (gamePool.length > 0) {
            activeTray.push(gamePool.shift());
        }
        
        // Re-render tray
        renderTray();
        updateUI();
        selectedFileElement = null;
        
        // Check Win Condition
        if (matchedCount === ALL_FILES.length) {
            setTimeout(triggerWinGame, 800);
        }
    } else {
        // FAIL MATCH
        targetCardElement.classList.add('card-error-shake');
        setTimeout(() => targetCardElement.classList.remove('card-error-shake'), 500);
        
        if (selectedFileElement) {
            selectedFileElement.classList.add('card-error-shake');
            setTimeout(() => selectedFileElement.classList.remove('card-error-shake'), 500);
        }
        
        playSynthSound('error');
        speak(fileObj.hint);
        showHintPopup(fileObj.hint, targetCardElement);
    }
}

// Add tiny color bubble indicators inside storage cards representing stored files
function addStoredDotPreview(deviceType, category) {
    const previewContainer = document.getElementById(`stored-${deviceType}`);
    if (!previewContainer) return;
    
    const dot = document.createElement('div');
    dot.className = 'stored-file-dot';
    
    // Set matching colors dynamically
    let dotColor = '#747d8c';
    if (category === 'music') dotColor = '#e91e63';
    if (category === 'doc') dotColor = '#2196f3';
    if (category === 'video') dotColor = '#4caf50';
    if (category === 'image') dotColor = '#ffc107';
    if (category === 'code') dotColor = '#9c27b0';
    
    dot.style.color = dotColor;
    previewContainer.appendChild(dot);
}

// Display temporary hint popup alert relative to the selected device card
function showHintPopup(hintText, anchorElement) {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'hint-popup';
    popup.textContent = hintText;
    
    // Style inline dynamically for quick positioning overlay
    popup.style.position = 'absolute';
    popup.style.backgroundColor = '#2f3542';
    popup.style.color = '#ffffff';
    popup.style.padding = '10px 16px';
    popup.style.borderRadius = '12px';
    popup.style.fontSize = '0.9rem';
    popup.style.fontWeight = '600';
    popup.style.zIndex = '15';
    popup.style.width = '80%';
    popup.style.top = '15%';
    popup.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
    popup.style.animation = 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    popup.style.textAlign = 'center';
    
    anchorElement.appendChild(popup);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
        popup.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => popup.remove(), 300);
    }, 4500);
}

// Trigger Win Overlay and metrics computation
function triggerWinGame() {
    playSynthSound('win');
    speak("Congratulations! You completed the storage lab! Outstanding work!");
    
    const accuracy = Math.round((correctMatches / attempts) * 100);
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;
    document.getElementById('stat-attempts').textContent = attempts;
    
    winModal.classList.remove('hidden');
}

// HTML5 Drag and Drop Handlers
let draggedFileId = null;

function handleDragStart(e) {
    draggedFileId = this.id;
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.id);
    
    // Add visual clues to drop target elements
    document.querySelectorAll('.storage-card').forEach(card => {
        card.classList.add('drag-active');
    });
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.storage-card').forEach(card => {
        card.classList.remove('drag-active');
    });
}

// Bind drop zone interactions to device grid cards
document.querySelectorAll('.storage-card').forEach(card => {
    card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
    });
    
    card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
    });
    
    card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        
        const fileId = e.dataTransfer.getData('text/plain') || draggedFileId;
        const deviceType = card.dataset.device;
        
        if (fileId) {
            attemptMatch(fileId, deviceType, card);
        }
    });
    
    // Support click mapping when card is selected
    card.addEventListener('click', () => {
        if (selectedFileElement) {
            const fileId = selectedFileElement.id;
            const deviceType = card.dataset.device;
            attemptMatch(fileId, deviceType, card);
        }
    });
});

// Particles pop explosion effect on success
function createParticles(container) {
    if (!container) return;
    container.innerHTML = '';
    
    const colors = ['#ffd200', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];
    for (let i = 0; i < 16; i++) {
        const particle = document.createElement('span');
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Inline particle layout styles
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 8 + 6}px`;
        particle.style.height = particle.style.width;
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = color;
        particle.style.pointerEvents = 'none';
        
        // Calculate explosion angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 40;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transform = 'translate(-50%, -50%)';
        
        container.appendChild(particle);
        
        // Animate using CSS transition trigger
        setTimeout(() => {
            particle.style.transition = 'all 0.6s cubic-bezier(0.1, 0.8, 0.25, 1)';
            particle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`;
            particle.style.opacity = '0';
        }, 10);
    }
}

// 3. Synth retro sound effects generator (Web Audio API)
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSynthSound(type) {
    if (!soundEnabled) return;
    
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const now = audioCtx.currentTime;
        
        if (type === 'success') {
            // High pitch positive double beep
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            
            osc.start(now);
            osc.stop(now + 0.25);
            
        } else if (type === 'error') {
            // Sad low pitched downward buzz
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.35);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            
            osc.start(now);
            osc.stop(now + 0.35);
            
        } else if (type === 'win') {
            // Cheerful retro game fanfare arpeggio
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6 arpeggio
            notes.forEach((freq, idx) => {
                const noteTime = now + (idx * 0.08);
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);
                
                gain.gain.setValueAtTime(0.1, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);
                
                osc.start(noteTime);
                osc.stop(noteTime + 0.3);
            });
        }
    } catch (e) {
        console.warn("Synthesizer failed to play sound. Web Audio is restricted by browser context.", e);
    }
}

// Voice synthesis triggers
function speak(text) {
    if (!soundEnabled) return;
    
    // Cancel any current voices playing
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Setup generic english voice with warm child-friendly tone if possible
    utterance.volume = 0.85;
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly high pitch for friendly kid tone
    
    window.speechSynthesis.speak(utterance);
}

// 4. Accessibility and Interaction Listeners
btnListen.addEventListener('click', () => {
    initAudio();
    speak("Match each file card at the bottom to the right storage device! Floppy Disks fit up to 1.44 Megabytes. CD-ROMs hold up to 700 Megabytes. USB Drives are super fast and hold up to 64 Gigabytes. Drag and drop or click a file then select the storage card to match!");
});

btnBack.addEventListener('click', () => {
    // Quick reload / reset action as a return-to-home simulation
    initGame();
    speak("Restarting game. All cards cleared!");
});

btnPlayAgain.addEventListener('click', () => {
    initGame();
});

btnSoundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        soundIconOn.classList.remove('hidden');
        soundIconOff.classList.add('hidden');
        speak("Sound turned on");
    } else {
        soundIconOn.classList.add('hidden');
        soundIconOff.classList.remove('hidden');
        window.speechSynthesis.cancel();
    }
});

// Document click to clear selections when clicking outside cards
document.addEventListener('click', () => {
    if (selectedFileElement) {
        selectedFileElement.classList.remove('selected');
        selectedFileElement = null;
    }
});

// Boot Game on window load
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});
