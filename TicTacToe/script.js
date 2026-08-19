const glow = document.getElementById('mouse-glow');
  window.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });

function attachTilt(el){
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(500px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
}

document.querySelectorAll('.cell').forEach(attachTilt);
const icons = {
  X: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--x)" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  O: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--o)" stroke-width="1.9"><circle cx="12" cy="12" r="7.5"/></svg>`
};

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const cells = Array.from(document.querySelectorAll('.cell'));
const board = Array(9).fill(null);

let current = 'X';
let mode = 'computer';
let gameOver = false;
let thinking = false;
let playerSymbol = 'X';
let opponentSymbol = 'O';
let nextPlayerSymbol = 'O';
let xWins = 0, oWins = 0, draws = 0;

const xEl = document.querySelector('#score-x .score-num');
const oEl = document.querySelector('#score-o .score-num');
const drawEl = document.getElementById('draw-num');
const banner = document.getElementById('result-banner');
const mobileBanner = document.getElementById('result-banner-mobile');
const duel = document.getElementById('duel');
const p1IconWrap = document.getElementById('p1-icon');
const p2IconWrap = document.getElementById('p2-icon');
const p1Tag = document.getElementById('p1-tag');
const p2Tag = document.getElementById('p2-tag');
const eyebrow = document.getElementById('eyebrow');
const labelX = document.getElementById('label-x');
const labelO = document.getElementById('label-o');

function setBanner(text, className='result-banner'){
  banner.textContent = text;
  banner.className = className;
  mobileBanner.textContent = text;
  mobileBanner.className = className;
}

function shakeDuel(){
  duel.classList.remove('clash-shake');
  void duel.offsetWidth;
  duel.classList.add('clash-shake');
}

function updateTurnGlow(){
  p1IconWrap.classList.toggle('active', current === playerSymbol && !gameOver);
  p2IconWrap.classList.toggle('active', current === opponentSymbol && !gameOver);
}

function updateParticipants(){
  p1Tag.textContent = mode === 'computer' ? 'You' : 'Player 1';
  p2Tag.textContent = mode === 'computer' ? 'Computer' : 'Player 2';

  labelX.textContent = mode === 'computer' ? 'You Won' : 'P1 Won';
  labelO.textContent = mode === 'computer' ? 'COM Won' : 'P2 Won';

  p1IconWrap.innerHTML = icons[playerSymbol];
  p2IconWrap.innerHTML = icons[opponentSymbol];
}

function checkWinner(){
  for (const line of WIN_LINES){
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]){
      return { winner: board[a], line };
    }
  }
  if (board.every(v => v)) return { winner: 'draw', line: null };
  return null;
}

function place(index, player){
  board[index] = player;
  cells[index].innerHTML = icons[player];
  cells[index].classList.add('filled');
}

function endRound(result){
  gameOver = true;
  updateTurnGlow();

  if (result.winner === 'draw'){
    draws++; 
    drawEl.textContent = draws;
    setBanner("It's a draw", 'result-banner tie');
  } else {
    if (result.winner === playerSymbol) {
      xWins++; 
      xEl.textContent = xWins;
    } else {
      oWins++; 
      oEl.textContent = oWins;
    }

    const winnerName = result.winner === playerSymbol 
      ? (mode === 'computer' ? 'You win!' : 'Player 1 wins!') 
      : (mode === 'computer' ? 'Computer wins!' : 'Player 2 wins!');

    setBanner(winnerName, 'result-banner ' + (result.winner === playerSymbol ? 'win' : 'lose'));
    result.line.forEach(i => cells[i].classList.add('win'));
  }

  setTimeout(newRound, 1200);
}

function newRound(){
  board.fill(null);
  cells.forEach(c => { c.innerHTML = ''; c.classList.remove('filled','win'); });

  playerSymbol = nextPlayerSymbol;
  opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';
  nextPlayerSymbol = nextPlayerSymbol === 'X' ? 'O' : 'X';

  current = 'X';
  gameOver = false;
  thinking = false;
  updateParticipants();
  setBanner(`${current}'s turn`);
  updateTurnGlow();

  if (mode === 'computer' && current === opponentSymbol){
    thinking = true;
    setTimeout(computerMove, 450);
  }
}

function afterMove(){
  const result = checkWinner();
  if (result){
    endRound(result);
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  setBanner(`${current}'s turn`);
  updateTurnGlow();
  if (mode === 'computer' && current === opponentSymbol && !gameOver){
    thinking = true;
    setTimeout(computerMove, 450);
  }
}

function handleCellClick(index){
  if (gameOver || thinking || board[index]) return;
  if (mode === 'computer' && current !== playerSymbol) return;
  shakeDuel();
  place(index, current);
  afterMove();
}

function bestComputerMove(){
  const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
  for (const i of empty){
    const copy = [...board]; copy[i] = opponentSymbol;
    if (WIN_LINES.some(([a,b,c]) => copy[a]===opponentSymbol && copy[b]===opponentSymbol && copy[c]===opponentSymbol)) return i;
  }
  for (const i of empty){
    const copy = [...board]; copy[i] = playerSymbol;
    if (WIN_LINES.some(([a,b,c]) => copy[a]===playerSymbol && copy[b]===playerSymbol && copy[c]===playerSymbol)) return i;
  }
  if (!board[4]) return 4;
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  return empty[Math.floor(Math.random()*empty.length)];
}

function computerMove(){
  if (gameOver || mode !== 'computer' || current !== opponentSymbol) return;
  const index = bestComputerMove();
  if (index === undefined) return;
  shakeDuel();
  place(index, opponentSymbol);
  thinking = false;
  afterMove();
}

cells.forEach(cell => {
  cell.addEventListener('click', () => handleCellClick(Number(cell.dataset.cell)));
});

function setMode(newMode){
    mode = newMode;
    document.getElementById('btn-vs-computer').classList.toggle('active', mode === 'computer');
    document.getElementById('btn-vs-player').classList.toggle('active', mode === 'player');
    eyebrow.textContent = mode === 'computer' ? 'Human vs Computer' : 'Player vs Player';
    xWins = 0; 
    oWins = 0; 
    draws = 0;
    xEl.textContent = '0'; 
    oEl.textContent = '0'; 
    drawEl.textContent = '0';

    newRound();
  }

document.getElementById('btn-vs-computer').addEventListener('click', () => setMode('computer'));
document.getElementById('btn-vs-player').addEventListener('click', () => setMode('player'));
document.getElementById('reset-btn').addEventListener('click', () => {
  xWins = 0; oWins = 0; draws = 0;
  xEl.textContent = '0'; oEl.textContent = '0'; drawEl.textContent = '0';
  newRound();
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
setTheme('dark');