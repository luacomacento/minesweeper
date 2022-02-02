// Select elements that are going to be reused.
const resetBtn = document.getElementById('reset-btn');
const board = document.getElementById('board');
const modal = document.getElementById('game-over-modal');
const modalHeader = document.querySelector('.modal-header');
const modalText = document.querySelector('.modal-text');
const modalCloseBtn = document.querySelector('.modal-container .close');
const mineCount = document.getElementById('mine-count');
const easyBtn = document.getElementById('easy');
const mediumBtn = document.getElementById('medium');

// Stopwatch variables
let stopWatch;
let seconds = 0;
let minutes = 0;

// Game info object.
const gameInfo = {
  boardSize: 9,
  minesQuantity: 12,
  flagsQuantity: 0,
  minesLocation: [],
  isGameOver: false,
};

// Functions
const displayModal = (gameState) => {
  modalHeader.textContent = (gameState === 'win')
    ? 'Vitória!'
    : 'Derrota :(';
  modalText.textContent = (gameState === 'win')
    ? 'Parabéns! Você venceu!'
    : 'Que pena! Você perdeu!';
  modal.style.display = 'unset';
};

const hideModal = () => modal.style.display = 'none';

const handleGameLose = (clickedSquare) => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  clickedSquare.classList.add('bomb');
  clickedSquare.innerHTML = '<i class="fas fa-bomb"></i>';
  gameInfo.isGameOver = true;
  gameInfo.minesLocation.forEach((number) => {
    const current = document.getElementById(`square-${number}`);
    if (current !== clickSquare) {
      current.classList.add('bomb');
      current.innerHTML = '<i class="fas fa-bomb"></i>';
      current.style.opacity = '0.5';
    }
  });
  setTimeout(() => displayModal('lose'), 20);
};

const handleGameWin = (clickedSquare) => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  gameInfo.isGameOver = true;
  setTimeout(() => displayModal('win'), 20);
};

const generateRandomNumber = () => Math.floor(Math.random() * (gameInfo.boardSize ** 2));

const placeMines = (initialSquare) => {
  const initialId = (initialSquare.id).match(/\d+-\d+/)[0];
  const row = parseInt(initialId.split('-')[0]);
  const column = parseInt(initialId.split('-')[1]);
  const testArray = [`${row - 1}-${column - 1}`, `${row - 1}-${column}`, `${row - 1}-${column + 1}`, `${row}-${column - 1}`, `${row}-${column + 1}`, `${row + 1}-${column - 1}`, `${row + 1}-${column}`, `${row + 1}-${column + 1}`];

  for (let i = 0; i < gameInfo.minesQuantity; i++) {
    let number = generateRandomNumber();
    let row = Math.floor(number / gameInfo.boardSize);
    let column = number % gameInfo.boardSize;
    let string = `${row}-${column}`;

    while (gameInfo.minesLocation.includes(string) || string === initialId || testArray.some((id) => id === string)) {
      number = generateRandomNumber();
      row = Math.floor(number / gameInfo.boardSize);
      column = number % gameInfo.boardSize;
      string = `${row}-${column}`;
    }
    gameInfo.minesLocation.push(string);
  }
  gameInfo.minesLocation.sort();
  console.log(gameInfo.minesLocation);

  stopWatch = setInterval(countTime, 1000);
};

const createBoard = () => {
  // let number = 1;
  for (let rowIndex = 0; rowIndex < gameInfo.boardSize; rowIndex++) {
    const newRow = document.createElement('div');
    newRow.className = 'board-row';
    newRow.id = `row-${rowIndex}`;
    for (let columnIndex = 0; columnIndex < gameInfo.boardSize; columnIndex++) {
      const newSquare = document.createElement('div');
      newSquare.classList.add('square', 'flagable');
      newSquare.id = `square-${rowIndex}-${columnIndex}`;
      // number += 1;
      newRow.appendChild(newSquare);
    }
    board.appendChild(newRow);
  }
  mineCount.textContent = gameInfo.minesQuantity;
};

const countBombs = (id) => {
  const number = id.match(/\d+-\d+/)[0];
  const row = parseInt(number.split('-')[0]);
  const column = parseInt(number.split('-')[1]);
  let numberOfMines = 0;
  const testArray = [`${row - 1}-${column - 1}`, `${row - 1}-${column}`, `${row - 1}-${column + 1}`, `${row}-${column - 1}`, `${row}-${column + 1}`, `${row + 1}-${column - 1}`, `${row + 1}-${column}`, `${row + 1}-${column + 1}`];
  testArray.forEach((tested) => {
    if (gameInfo.minesLocation.includes(tested)) numberOfMines++;
  });
  return numberOfMines;
};

function runThroughAdjacent(id) {
  const number = id.match(/\d+-\d+/)[0];
  const row = parseInt(number.split('-')[0]);
  const column = parseInt(number.split('-')[1]);
  const testArray = [`${row - 1}-${column - 1}`, `${row - 1}-${column}`, `${row - 1}-${column + 1}`, `${row}-${column - 1}`, `${row}-${column + 1}`, `${row + 1}-${column - 1}`, `${row + 1}-${column}`, `${row + 1}-${column + 1}`];

  testArray.forEach((testedId) => {
    const element = document.getElementById(`square-${testedId}`);
    if (element) element.click();
  });
}

const clickSquare = (event) => {

  if (event.target.classList.contains('square') && !event.target.classList.contains('clicked')) {

    if (event.target.classList.contains('flagged')) return;

    // Place initial mines;
    const noMinesPlaced = !gameInfo.minesLocation.length;
    if (noMinesPlaced) placeMines(event.target);

    // Prevent any click if game is already over.
    if (gameInfo.isGameOver) return;

    // Click logic
    // Handle counting bombs
    const numberOfBombs = countBombs(event.target.id);
    event.target.innerText = numberOfBombs || '';
    
    if (numberOfBombs === 0) {
      runThroughAdjacent(event.target.id);
    }
    
    event.target.classList.add('clicked');
    event.target.classList.remove('flagable');
    let clickedId = event.target.id.match(/\d+-\d+/)[0];

    // Game Lose :(
    if (gameInfo.minesLocation.includes(clickedId)) {
      handleGameLose(event.target);
    }

    // Game Win!
    if (document.querySelectorAll('.clicked').length === gameInfo.boardSize ** 2 - gameInfo.minesQuantity) {
      handleGameWin(event.target);
    }
  }
    
};

const resetGame = (event, boardSize = gameInfo.boardSize, minesQuantity = gameInfo.minesQuantity) => {
  gameInfo.isGameOver = false;
  gameInfo.minesLocation = [];
  gameInfo.flagsQuantity = 0;
  document.getElementById('board').innerHTML = '';
  gameInfo.boardSize = boardSize;
  gameInfo.minesQuantity = minesQuantity;
  console.log(boardSize);
  createBoard();
  hideModal();
  document.getElementById('minutes').textContent = '00';
  document.getElementById('seconds').textContent = '00';
};

createBoard();

document.body.addEventListener('click', clickSquare);
resetBtn.addEventListener('click', resetGame);
modalCloseBtn.addEventListener('click', hideModal);

board.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (gameInfo.isGameOver || !gameInfo.minesLocation.length) return;
  if (!event.target.classList.contains('flagable')) return;

  if (event.target.classList.contains('flagged')) {
    event.target.innerHTML = '';
    event.target.classList.remove('flagged');
    gameInfo.flagsQuantity -= 1;
  }

  else if (event.target.classList.contains('fa-flag')) {
    gameInfo.flagsQuantity--;
    event.target.parentElement.classList.remove('flagged');
    event.target.parentElement.innerHTML = '';
    console.log(gameInfo.flagsQuantity);
  }

  else {
    event.target.innerHTML = '<i class="fas fa-flag flagable"></i>';
    event.target.classList.add('flagged');
    gameInfo.flagsQuantity += 1;
  }


  mineCount.textContent = gameInfo.minesQuantity - gameInfo.flagsQuantity;

});

function displayMinutes() {
  if (seconds <= 9) {
    document.getElementById('minutes').textContent = `0${minutes}`;
  } else {
    document.getElementById('minutes').textContent = minutes;
  }
}

function countTime() {
  seconds++;
  if (seconds > 60) {
    seconds = 0;
    minutes++;
    displayMinutes();
  }
  if (seconds <= 9) {
    document.getElementById('seconds').textContent = `0${seconds}`;
  } else {
    document.getElementById('seconds').textContent = seconds;
  }
}

easyBtn.addEventListener('click', (event) => resetGame(event, 9, 12));
mediumBtn.addEventListener('click', (event) => resetGame(event, 16, 40));