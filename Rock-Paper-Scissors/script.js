const glow = document.getElementById('mouse-glow');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  glow.style.left = `${mouseX}px`;
  glow.style.top = `${mouseY}px`;
});

document.querySelectorAll('.choice-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    btn.style.transform = `perspective(500px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-4px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

const choices = ['rock','paper','scissors'];

const icons = {
  rock: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--rock)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12.5V7a2 2 0 1 1 4 0v4M11 11V5a2 2 0 1 1 4 0v6M15 11.5V6.5a2 2 0 1 1 4 0V13a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3.3 13a1.6 1.6 0 0 1 2.6-1.8L7 13"/></svg>`,
  paper: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--paper)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></svg>`,
  scissors: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--scissors)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.3"/><circle cx="6" cy="18" r="2.3"/><path d="M7.8 7.5 20 19M7.8 16.5 20 5"/></svg>`,
  placeholder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/></svg>`
};

const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
let wins = 0, losses = 0, ties = 0;
const winEl = document.querySelector('#score-win .score-num');
const loseEl = document.querySelector('#score-lose .score-num');
const tieEl = document.getElementById('tie-num');
const youIcon = document.getElementById('you-icon');
const cpuIcon = document.getElementById('cpu-icon');
const banner = document.getElementById('result-banner');
const duel = document.getElementById('duel');

function playRound(playerChoice){
  resolving = true;
  const cpuChoice = choices[Math.floor(Math.random() * 3)];
  youIcon.innerHTML = icons[playerChoice];
  cpuIcon.innerHTML = icons.placeholder;
  duel.classList.remove('clash-shake');
  void duel.offsetWidth;
  duel.classList.add('clash-shake');
  banner.textContent = '···';
  banner.className = 'result-banner';
  setTimeout(() => {
    cpuIcon.innerHTML = icons[cpuChoice];
    let outcome;
    if (playerChoice === cpuChoice) outcome = 'tie';
    else if (beats[playerChoice] === cpuChoice) outcome = 'win';
    else outcome = 'lose';
    if (outcome === 'win'){
      wins++; winEl.textContent = wins;
      banner.textContent = `${cap(playerChoice)} beats ${cap(cpuChoice)} — you win`;
    } else if (outcome === 'lose'){
      losses++; loseEl.textContent = losses;
      banner.textContent = `${cap(cpuChoice)} beats ${cap(playerChoice)} — you lose`;
    } else {
      ties++; tieEl.textContent = ties;
      banner.textContent = `Both chose ${cap(playerChoice)} — tie`;
    }
    banner.classList.add(outcome);
    resolving = false;
  }, 420);
}

function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
document.querySelectorAll('.choice-btn').forEach(btn => {
  btn.addEventListener('click', () => playRound(btn.dataset.choice));
});

const keyToChoice = { r: 'rock', p: 'paper', s: 'scissors' };

let resolving = false;
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const choice = keyToChoice[e.key.toLowerCase()];
  if (!choice || resolving) return;
  playRound(choice);
});

document.getElementById('reset-btn').addEventListener('click', () => {
  wins = 0; losses = 0; ties = 0;
  winEl.textContent = '0'; loseEl.textContent = '0'; tieEl.textContent = '0';
  youIcon.innerHTML = icons.placeholder;
  cpuIcon.innerHTML = icons.placeholder;
  banner.textContent = 'Make the first move';
  banner.className = 'result-banner';
});

const btnLight = document.getElementById('btn-light');
const btnDark = document.getElementById('btn-dark');

function setTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  btnLight.classList.toggle('active', theme === 'light');
  btnDark.classList.toggle('active', theme === 'dark');
}

btnLight.addEventListener('click', () => setTheme('light'));
btnDark.addEventListener('click', () => setTheme('dark'));
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
  setTheme('dark');
}