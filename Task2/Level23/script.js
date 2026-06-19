let selectedProto = null;
let score = 0;
let correctCount = 0;
let answeredCount = 0;
const totalCards = document.querySelectorAll('.card').length;

function updateScore(points = 0){
  score += points;
  document.getElementById('scoreDisplay').textContent = score;
}

function resetGame(){
  // clear assignments and states
  document.querySelectorAll('.card').forEach(card=>{
    const assigned = card.querySelector('.assigned');
    assigned.textContent = '—';
    card.classList.remove('correct','wrong','bounce');
    delete card.dataset.answered;
  });
  // reset score and counters
  score = 0; correctCount = 0; answeredCount = 0; selectedProto = null;
  document.getElementById('scoreDisplay').textContent = score;
  document.querySelectorAll('.proto').forEach(p=>p.classList.remove('active'));
}

function showFinalScore(){
  const feedback = document.getElementById('feedback');
  const overlay = document.getElementById('feedbackOverlay');
  const status = feedback.querySelector('.feedback-status');
  const proto = feedback.querySelector('.feedback-proto');
  const exp = feedback.querySelector('.feedback-explanation');
  
  status.innerHTML = '🎉 All done!';
  status.className = 'feedback-status correct';
  proto.textContent = `Total points: ${score}`;
  exp.textContent = 'Great job — the game will reset now.';
  feedback.classList.remove('hidden'); overlay.classList.add('show');
  setTimeout(()=>{
    feedback.classList.add('hidden'); overlay.classList.remove('show');
    resetGame();
  }, 4000);
}

document.querySelectorAll('.proto').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.proto').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); selectedProto=b.dataset.proto; 
  })
})

document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click',()=>{
    if(!selectedProto) return flash('Select a protocol first');
    const assigned = card.querySelector('.assigned');
    const expected = card.dataset.expected;
    const isCorrect = selectedProto === expected;
    const explanation = card.dataset.explanation;

    // update assigned label
    assigned.textContent = selectedProto;

    // only count first answer per card
    if(!card.dataset.answered){
      card.dataset.answered = 'true';
      answeredCount++;
      if(isCorrect){ correctCount++; updateScore(10); }
    }

    // mark correct/incorrect visually
    if(isCorrect){ card.classList.remove('wrong'); card.classList.add('correct'); }
    else { card.classList.remove('correct'); card.classList.add('wrong'); }

    // small bounce animation
    card.classList.remove('bounce'); void card.offsetWidth; card.classList.add('bounce');

    // show feedback modal
    showFeedback(isCorrect, selectedProto, expected, explanation);

    // if all cards have been selected at least once, show final score then reset
    if(answeredCount === totalCards){
      setTimeout(showFinalScore, 600); // small delay after last feedback
    }
  })
})

function showFeedback(isCorrect, selected, expected, explanation){
  const feedback = document.getElementById('feedback');
  const overlay = document.getElementById('feedbackOverlay');
  const status = feedback.querySelector('.feedback-status');
  const proto = feedback.querySelector('.feedback-proto');
  const exp = feedback.querySelector('.feedback-explanation');
  
  if(isCorrect){
    status.innerHTML = '✓ Correct! <span style="font-size:18px;display:block;margin-top:6px">+10 Points 🎉</span>';
    status.className = 'feedback-status correct';
  } else {
    status.textContent = '✗ Not quite!';
    status.className = 'feedback-status wrong';
  }
  
  proto.textContent = `Correct Protocol: ${expected}`;
  exp.textContent = explanation;
  
  feedback.classList.remove('hidden');
  overlay.classList.add('show');
  setTimeout(()=>{ feedback.classList.add('hidden'); overlay.classList.remove('show'); }, 3000);
}

function flash(msg){
  const t=document.createElement('div'); t.textContent=msg;
  t.style.position='fixed'; t.style.left='50%'; t.style.top='16px'; t.style.transform='translateX(-50%)';
  t.style.background='rgba(0,0,0,0.8)'; t.style.color='#fff'; t.style.padding='8px 12px'; t.style.borderRadius='8px';
  document.body.appendChild(t); setTimeout(()=>t.remove(),1400);
}

// listen button playful animation with voice synthesis
document.getElementById('listenBtn').addEventListener('click',()=>{
  const b=document.getElementById('listenBtn');
  b.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:420});
  
  // speak the description
  const text = "Assign the right protocol to each network connection. Choose a protocol from the selector, then click on a task to assign it. Green means correct, red means incorrect.";
  
  if('speechSynthesis' in window){
    // stop any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    b.textContent = '🔊 Speaking...';
    utterance.onend = ()=>{ b.textContent = '🔊 Listen'; };
    
    speechSynthesis.speak(utterance);
  } else {
    flash('Voice not supported in this browser');
  }
})
