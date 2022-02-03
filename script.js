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
  minesQty: 12,
  flagsQty: 0,
  minesLocation: [],
  isGameOver: false,
  adjacentBombs: {},
};

// Functions
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

const startStopWatch = () => stopWatch = setInterval(countTime, 1000);

const clearStopWatch = () => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  document.getElementById('minutes').textContent = '00';
  document.getElementById('seconds').textContent = '00';
};

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

const handleGameWin = () => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  gameInfo.isGameOver = true;
  setTimeout(() => displayModal('win'), 20);
};

const generateRandomNumber = () => Math.floor(Math.random() * (gameInfo.boardSize ** 2));

const getAdjacentBlocks = (id) => {
  const initialId = (id).match(/\d+-\d+/)[0];
  const row = parseInt(initialId.split('-')[0]);
  const column = parseInt(initialId.split('-')[1]);
  return [
    `${row - 1}-${column - 1}`,
    `${row - 1}-${column}`,
    `${row - 1}-${column + 1}`,
    `${row}-${column - 1}`,
    `${row}-${column + 1}`,
    `${row + 1}-${column - 1}`,
    `${row + 1}-${column}`,
    `${row + 1}-${column + 1}`
  ];
};

const placeMines = (initialSquare) => {
  const adjacentBlocks = getAdjacentBlocks(initialSquare.id);
  const initialId = (initialSquare.id).match(/\d+-\d+/)[0];

  for (let i = 0; i < gameInfo.minesQty; i++) {
    let number = generateRandomNumber();
    let row = Math.floor(number / gameInfo.boardSize);
    let column = number % gameInfo.boardSize;
    let string = `${row}-${column}`;

    while (gameInfo.minesLocation.includes(string) || string === initialId || adjacentBlocks.some((id) => id === string)) {
      number = generateRandomNumber();
      row = Math.floor(number / gameInfo.boardSize);
      column = number % gameInfo.boardSize;
      string = `${row}-${column}`;
    }
    gameInfo.minesLocation.push(string);
  }
  document.querySelectorAll('.square').forEach((square) => {
    const numberOfBombs = countBombs(square.id);
    gameInfo.adjacentBombs[square.id] = numberOfBombs;
  });

  startStopWatch();
};

const createBoard = () => {

  for (let rowIndex = 0; rowIndex < gameInfo.boardSize; rowIndex++) {
    const newRow = document.createElement('div');
    newRow.className = 'board-row';
    newRow.id = `row-${rowIndex}`;
    for (let columnIndex = 0; columnIndex < gameInfo.boardSize; columnIndex++) {
      const newSquare = document.createElement('div');
      newSquare.classList.add('square', 'flagable');
      newSquare.id = `square-${rowIndex}-${columnIndex}`;

      newRow.appendChild(newSquare);
    }
    board.appendChild(newRow);
  }
  mineCount.textContent = gameInfo.minesQty;
};

const countBombs = (id) => {
  const testArray = getAdjacentBlocks(id);
  return testArray
    .filter((tested) => gameInfo.minesLocation.includes(tested))
    .length;
};

const checkGameOver = (clickedSquare) => {
  const clickedId = clickedSquare.id.match(/\d+-\d+/)[0];

  // Game Lose :(
  if (gameInfo.minesLocation.includes(clickedId)) {
    handleGameLose(clickedSquare);
  }

  // Game Win!
  if (document.querySelectorAll('.clicked').length === gameInfo.boardSize ** 2 - gameInfo.minesQty) {
    handleGameWin(clickedSquare);
  }
};

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
    
    if (numberOfBombs === 0) openBlocks(event.target);

    event.target.classList.add('clicked');
    event.target.classList.remove('flagable');
    checkGameOver(event.target);
  }
    
};

function openBlocks(startingBlock) {
  let blocksToOpen = [startingBlock];

  while (blocksToOpen.length) {
    let nextBlock = blocksToOpen.pop();

    if (!nextBlock.classList.contains('clicked')) {
      let additionalBlocksToOpen = openBlock(nextBlock);

      if (additionalBlocksToOpen.length) {
        blocksToOpen = [...blocksToOpen, ...additionalBlocksToOpen];
      }
    }
  }
}

function openBlock(block) {
  const emptyBlocks = [];
  
  block.classList.add('clicked');
  block.classList.remove('flagable');

  const testArray = getAdjacentBlocks(block.id);

  testArray.forEach((testedId) => {
    const element = document.getElementById(`square-${testedId}`);
    if (element) {
      if (gameInfo.adjacentBombs[`square-${testedId}`] === 0) {
        emptyBlocks.push(element);
      }
      else {
        element.classList.add('clicked');
        element.classList.remove('flagable');
        element.textContent = gameInfo.adjacentBombs[`square-${testedId}`];
      }
    }
  });

  return emptyBlocks;
}

const resetGame = (
  boardSize = gameInfo.boardSize,
  minesQuantity = gameInfo.minesQty,
) => {
  clearStopWatch();
  gameInfo.isGameOver = false;
  gameInfo.minesLocation = [];
  gameInfo.flagsQty = 0;
  gameInfo.boardSize = boardSize;
  gameInfo.minesQty = minesQuantity;
  document.getElementById('board').innerHTML = '';

  createBoard();
  hideModal();

};

// Start the Game
createBoard();

document.body.addEventListener('click', clickSquare);
resetBtn.addEventListener('click', () => resetGame());
modalCloseBtn.addEventListener('click', hideModal);

board.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (gameInfo.isGameOver || !gameInfo.minesLocation.length) return;
  if (!event.target.classList.contains('flagable')) return;

  if (event.target.classList.contains('flagged')) {
    event.target.innerHTML = '';
    event.target.classList.remove('flagged');
    gameInfo.flagsQty -= 1;
  }

  else if (event.target.classList.contains('fa-flag')) {
    gameInfo.flagsQty--;
    event.target.parentElement.classList.remove('flagged');
    event.target.parentElement.innerHTML = '';
  }

  else {
    event.target.innerHTML = '<i class="fas fa-flag flagable"></i>';
    event.target.classList.add('flagged');
    gameInfo.flagsQty += 1;
  }


  mineCount.textContent = gameInfo.minesQty - gameInfo.flagsQty;

});

easyBtn.addEventListener('click', () => resetGame(9, 12));
mediumBtn.addEventListener('click', () => resetGame(16, 40));