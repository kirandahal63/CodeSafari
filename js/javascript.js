// Elements
const siteHeader = document.getElementById('siteHeader');
const birdImg = document.getElementById('bird');
const siteFooter = document.getElementById('siteFooter');

const confettiLayer = document.getElementById('confettiLayer');

const welcome = document.getElementById('welcome');
const quiz = document.getElementById('quiz');

const qs = Array.from(document.querySelectorAll('.q'));
const progressEl = document.getElementById('progress');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const scoreBox = document.getElementById('scoreBox');

const cert = document.getElementById('certificate');
const certControls = document.getElementById('certControls');
const certName = document.getElementById('certName');
const certLine = document.getElementById('certLine');
const certDate = document.getElementById('certDate');
const nameInput = document.getElementById('studentName');

const startBtn = document.getElementById('startBtn');

let current = 0;

function showQuestion(i){
  qs.forEach((q,idx)=> q.classList.toggle('active', idx === i));
  progressEl.textContent = `Question ${i+1} of ${qs.length}`;
  nextBtn.textContent = (i === qs.length-1) ? 'Finish' : 'Next Page';
  scoreBox.style.display = 'none';
  cert.style.display = 'none';
  certControls.classList.remove('show');
}

function computeScore(){
  let correctCount = 0;
  qs.forEach(q=>{
    const ans = q.dataset.answer;
    const checked = q.querySelector('input[type="radio"]:checked');
    if(checked && checked.value === ans) correctCount++;
  });

  scoreBox.textContent = `You scored ${correctCount} / ${qs.length} 🌿`;
  scoreBox.style.display = 'block';
  nextBtn.style.display = 'none';
  progressEl.textContent = '';

  const name = (nameInput.value || '').trim() || 'Jungle Explorer';
  certName.textContent = name;
  certLine.textContent = `for scoring ${correctCount} out of ${qs.length} in the Jungle HTML Quiz`;
  certDate.textContent = new Date().toLocaleDateString();

  if(correctCount >= 7){
    cert.style.display = 'block';
    certControls.classList.add('show');
    rainConfetti();
    setTimeout(()=> cert.scrollIntoView({behavior:'smooth', block:'center'}), 50);
  }else{
    cert.style.display = 'none';
    certControls.classList.remove('show');
  }
}

function resetQuiz(){
  document.querySelectorAll('input[type="radio"]:checked').forEach(r=>r.checked=false);
  qs.forEach(q=> q.classList.remove('correct','wrong','active'));
  current = 0;
  nextBtn.style.display = '';
  cert.style.display = 'none';
  certControls.classList.remove('show');
  scoreBox.style.display = 'none';
  showQuestion(current);
}

// Start quiz (hide header + bird + footer so they don’t overlap)
function startQuiz(){
  if (siteHeader) siteHeader.style.display = 'none';
  if (birdImg) birdImg.style.display = 'none';
  if (siteFooter) siteFooter.style.display = 'none';

  welcome.style.display = 'none';
  quiz.style.display = 'flex';
  showQuestion(0);
  const h = qs[0].querySelector('h4'); if(h){ h.setAttribute('tabindex','-1'); h.focus(); }
}

startBtn.addEventListener('click', (e)=> { e.preventDefault(); startQuiz(); });
// Clicking anywhere on welcome (except the button itself) also starts
welcome.addEventListener('click', (e)=> { if(e.target.id !== 'startBtn') startQuiz(); });

// Color-only feedback on choices
qs.forEach(q=>{
  const correct = q.dataset.answer;
  q.querySelectorAll('input[type="radio"]').forEach(input=>{
    input.addEventListener('change', ()=>{
      q.classList.remove('correct','wrong');
      q.classList.add(input.value === correct ? 'correct' : 'wrong');
    });
  });
});

// Next / Finish
nextBtn.addEventListener('click', ()=>{
  if(current < qs.length - 1){
    current++;
    showQuestion(current);
    const h = qs[current].querySelector('h4'); if(h){ h.setAttribute('tabindex','-1'); h.focus(); }
  }else{
    qs.forEach(q=> q.classList.remove('active'));
    computeScore();
  }
});

// Reset
resetBtn.addEventListener('click', resetQuiz);

// Update cert name live
nameInput.addEventListener('input', ()=>{
  certName.textContent = (nameInput.value || '').trim() || 'Jungle Explorer';
});

// Download certificate — hide confetti so PNG is clean
downloadBtn.addEventListener('click', async ()=>{
  try{
    if(getComputedStyle(cert).display === 'none'){ cert.style.display = 'block'; }

    // temporarily hide confetti during capture
    const wasVisible = confettiLayer && confettiLayer.style.display !== 'none';
    if (confettiLayer) confettiLayer.style.display = 'none';

    const certImg = document.getElementById('certBg');
    if (certImg) certImg.crossOrigin = 'anonymous'; // harmless if same-origin

    const canvas = await html2canvas(cert, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });

    if (confettiLayer && wasVisible) confettiLayer.style.display = '';

    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const name = (nameInput.value || '').trim().replace(/\s+/g,'_') || 'Jungle_Explorer';
    a.href = dataURL;
    a.download = `Certificate_${name}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }catch(err){
    alert('Download failed. Make sure "../FINAL THANKS.avif" exists and is loaded from the same site.');
    console.error(err);
  }
});

// Confetti — appended to fixed full-screen layer at top
function rainConfetti(){
  if (!confettiLayer) return;
  const colors = ['#ffad33','#ffd166','#06d6a0','#118ab2','#ef476f','#9bde7e'];
  const pieces = 90;
  for(let i=0;i<pieces;i++){
    const d = document.createElement('div');
    d.className = 'confetti-piece';
    const size = 8 + Math.random()*8;
    const dur = 3 + Math.random()*2.5;
    d.style.left = (Math.random()*100) + 'vw';
    d.style.width = size + 'px';
    d.style.height = (size*1.3) + 'px';
    d.style.background = colors[Math.floor(Math.random()*colors.length)];
    d.style.setProperty('--dur', dur+'s');
    d.style.transform = 'translateY(0) rotate(' + (Math.random()*180) + 'deg)';
    confettiLayer.appendChild(d);
    setTimeout(()=> d.remove(), (dur*1000)+500);
  }
}
