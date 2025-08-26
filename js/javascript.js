// ===== ELEMENTS =====
const siteHeader = document.getElementById('siteHeader');
const birdImg = document.getElementById('bird');
const siteFooter = document.getElementById('siteFooter');

const confettiLayer = document.getElementById('confettiLayer');

const welcome = document.getElementById('welcome');
const quiz = document.getElementById('quiz');

const formEl = document.getElementById('quizForm');
const quizActionsEl = document.querySelector('.quiz-actions');

let qs = Array.from(document.querySelectorAll('.q'));
const progressEl = document.getElementById('progress');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const coursesBtn = document.getElementById('coursesBtn'); // Go to Courses (fail only)
const goBackBtn = document.getElementById('goBackBtn');   // Go Back to Welcome (pass only)
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

/* ========= helpers ========= */

// simple shuffle
function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// strip any existing leading number like "7) "
function baseQuestionTitle(text){
  return text.replace(/^\s*\d+\s*\)\s*/, '');
}

// renumber visible questions to 1),2),3)...
function renumberQuestions(){
  qs.forEach((q, i) => {
    const h4 = q.querySelector('h4');
    if (!h4) return;
    const raw = h4.textContent || '';
    const title = baseQuestionTitle(raw);
    h4.textContent = `${i + 1}) ${title}`;
  });
}

// randomize order of questions but keep buttons in same place
function randomizeQuestionsOnly(){
  const allQ = Array.from(formEl.querySelectorAll('.q'));
  const shuffled = shuffle(allQ.slice());
  shuffled.forEach(q => formEl.insertBefore(q, quizActionsEl));

  qs = shuffled;
  qs.forEach(q => {
    q.classList.remove('correct', 'wrong', 'active');
    q.style.display = '';
    q.querySelectorAll('input[type="radio"]').forEach(r => {
      r.checked = false;
      r.disabled = false;
    });
  });

  renumberQuestions();
  wireChoiceFeedback();
}

function wireChoiceFeedback(){
  qs.forEach(q => {
    const correct = q.dataset.answer;
    q.querySelectorAll('input[type="radio"]').forEach(input => {
      const clone = input.cloneNode(true);
      input.parentNode.replaceChild(clone, input);

      clone.addEventListener('change', () => {
        q.classList.remove('correct','wrong');
        q.classList.add(clone.value === correct ? 'correct' : 'wrong');
        q.querySelectorAll('input[type="radio"]').forEach(r => {
          r.disabled = true;
        });
      });
    });
  });
}

function lockSameSize(btn1, btn2, width, height){
  btn1.style.width = width + 'px';
  btn2.style.width = width + 'px';
  btn1.style.height = height + 'px';
  btn2.style.height = height + 'px';
}

/* ========= quiz flow ========= */

function showQuestion(i){
  qs.forEach((q, idx) => q.classList.toggle('active', idx === i));
  progressEl.textContent = `Question ${i + 1} of ${qs.length}`;
  nextBtn.textContent = (i === qs.length - 1) ? 'Finish' : 'Next Page';
  scoreBox.style.display = 'none';
  cert.style.display = 'none';
  certControls.classList.remove('show');

  if (coursesBtn) {
    coursesBtn.style.display = 'none';
    coursesBtn.style.marginTop = '';  // reset margin
    coursesBtn.style.width = '';
  }
  if (goBackBtn) goBackBtn.style.display = 'none';
  resetBtn.style.marginTop = '';
  resetBtn.style.width = '';
}

function computeScore(){
  Array.from(scoreBox.querySelectorAll('.retry-msg')).forEach(n => n.remove());

  let correctCount = 0;
  qs.forEach(q => {
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

  resetBtn.style.width = '';
  if (coursesBtn) coursesBtn.style.width = '';

  if(correctCount >= 6){
    // PASS
    cert.style.display = 'block';
    certControls.classList.add('show');
    if (goBackBtn) goBackBtn.style.display = 'inline-flex';
    if (coursesBtn) coursesBtn.style.display = 'none';
    resetBtn.style.marginTop = '';
    rainConfetti();
    setTimeout(()=> cert.scrollIntoView({behavior:'smooth', block:'center'}), 50);
  }else{
    // FAIL
    cert.style.display = 'none';
    certControls.classList.remove('show');
    if (goBackBtn) goBackBtn.style.display = 'none';
    if (coursesBtn) {
      coursesBtn.style.display = 'inline-flex';
      coursesBtn.style.order = '3';

      requestAnimationFrame(() => lockSameSize(resetBtn, coursesBtn, 200, 52));
      coursesBtn.style.marginTop = '-12px';   // 👈 lift Go to Courses
    }
    resetBtn.style.marginTop = '-12px';       // 👈 lift Reset

    const retryMsg = document.createElement('p');
    retryMsg.className = 'retry-msg';
    retryMsg.textContent = 'Go to Courses and try again';
    retryMsg.style.color = '#1b5e20';
    retryMsg.style.fontWeight = 'bold';
    retryMsg.style.marginTop = '10px';
    scoreBox.appendChild(retryMsg);
  }
}

function resetQuiz(){
  randomizeQuestionsOnly();
  current = 0;
  nextBtn.style.display = '';
  cert.style.display = 'none';
  certControls.classList.remove('show');
  scoreBox.style.display = 'none';

  if (coursesBtn) {
    coursesBtn.style.display = 'none';
    coursesBtn.style.marginTop = '';
    coursesBtn.style.width = '';
  }
  if (goBackBtn) goBackBtn.style.display = 'none';

  resetBtn.style.marginTop = '';
  resetBtn.style.width = '';

  showQuestion(current);
}

function startQuiz(){
  if (siteHeader) siteHeader.style.display = 'none';
  if (birdImg) birdImg.style.display = 'none';
  if (siteFooter) siteFooter.style.display = 'none';

  randomizeQuestionsOnly();
  welcome.style.display = 'none';
  quiz.style.display = 'flex';
  showQuestion(0);
  const h = qs[0].querySelector('h4'); if (h){ h.setAttribute('tabindex','-1'); h.focus(); }
}

function goBackToWelcome(){
  if (siteHeader) siteHeader.style.display = '';
  if (birdImg) birdImg.style.display = '';
  if (siteFooter) siteFooter.style.display = '';
  quiz.style.display = 'none';
  welcome.style.display = '';
  resetQuiz();
}

/* ========= events ========= */
startBtn.addEventListener('click', e => { e.preventDefault(); startQuiz(); });
welcome.addEventListener('click', e => { if (e.target.id !== 'startBtn') startQuiz(); });

nextBtn.addEventListener('click', () => {
  const currentQ = qs[current];
  const selected = currentQ ? currentQ.querySelector('input[type="radio"]:checked') : null;
  if (!selected){
    alert('Pick an answer first');
    return;
  }
  if (current < qs.length - 1){
    current++;
    showQuestion(current);
    const h = qs[current].querySelector('h4'); if (h){ h.setAttribute('tabindex','-1'); h.focus(); }
  } else {
    qs.forEach(q => q.classList.remove('active'));
    computeScore();
  }
});

resetBtn.addEventListener('click', resetQuiz);
if (goBackBtn){ goBackBtn.addEventListener('click', goBackToWelcome); }

nameInput.addEventListener('input', () => {
  certName.textContent = (nameInput.value || '').trim() || 'Jungle Explorer';
});

downloadBtn.addEventListener('click', async () => {
  try{
    if (getComputedStyle(cert).display === 'none'){ cert.style.display = 'block'; }
    const wasVisible = confettiLayer && confettiLayer.style.display !== 'none';
    if (confettiLayer) confettiLayer.style.display = 'none';
    const certImg = document.getElementById('certBg');
    if (certImg) certImg.crossOrigin = 'anonymous';
    const canvas = await html2canvas(cert, { backgroundColor: null, scale: 2, useCORS: true });
    if (confettiLayer && wasVisible) confettiLayer.style.display = '';
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const safe = (nameInput.value || '').trim().replace(/\s+/g,'_') || 'Jungle_Explorer';
    a.href = dataURL;
    a.download = `Certificate_${safe}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }catch(err){
    alert('Download failed. Make sure "../FINAL THANKS.avif" exists and is loaded from the same site.');
    console.error(err);
  }
});

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
