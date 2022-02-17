// Select elements that are going to be reused.
const resetBtn = document.getElementById('reset-btn');
const board = document.getElementById('board');
const modal = document.getElementById('game-modal');
const closeModalBtns = document.querySelectorAll('.modal-container .close');
const modalHeader = document.querySelector('#game-modal .modal-header');
const modalText = document.querySelector('#game-modal .modal-text');
const mineCount = document.getElementById('mine-count');
const difficultiesContainer = document.querySelector('.difficulties-container');
const easyBtn = document.getElementById('easy');
const mediumBtn = document.getElementById('medium');
const hardBtn = document.getElementById('hard');
const newGameBtn = document.getElementById('new-game-btn');
const infoBtn = document.querySelector('.fa-question-circle');
const infoModal = document.getElementById('info-modal');

// Stopwatch variables
let stopWatch;
let seconds = 0;
let minutes = 0;

// Game info object.
const game = {
  boardSize: 9,
  rowSize: 9,
  columnSize: 9,
  minesQty: 12,
  flagsQty: 0,
  minesLocation: [],
  isOver: false,
  adjacentBombs: {},
};

// Functions
const displayMinutes = () => {
  if (seconds <= 9) {
    document.getElementById('minutes').textContent = `0${minutes}`;
  } else {
    document.getElementById('minutes').textContent = minutes;
  }
};

const countTime = () => {
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
};

const startStopWatch = () => stopWatch = setInterval(countTime, 1000);

const clearStopWatch = () => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  document.getElementById('minutes').textContent = '00';
  document.getElementById('seconds').textContent = '00';
};

const displayModal = (type, gameState) => {
  if (type === 'gameOver') {
    modalHeader.textContent = (gameState === 'win')
      ? 'Vitória!'
      : 'Derrota :(';
    modalText.textContent = (gameState === 'win')
      ? 'Parabéns! Você venceu!'
      : 'Que pena! Você perdeu!';
    resetBtn.style.display = 'unset';
  } else if (type === 'newGame') {
    resetBtn.style.display = 'none'; 
    modalHeader.textContent = 'Novo jogo';
    modalText.textContent = 'Escolha uma dificuldade para iniciar:';
    difficultiesContainer.style.display = 'flex';
  }
  modal.style.display = 'unset';
};

const hideModal = () => {
  modal.style.display = 'none';
  infoModal.style.display = 'none';
  resetBtn.style.display = 'none'; 
  difficultiesContainer.style.display = 'none';
};

const handleGameLose = (clickedSquare) => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  clickedSquare.classList.add('bomb-clicked');
  clickedSquare.innerHTML = '<i class="fas fa-bomb"></i>';
  game.isOver = true;
  game.minesLocation.forEach((number) => {
    const current = document.getElementById(`square-${number}`);
    if (current !== clickSquare) {
      current.classList.add('bomb');
      current.innerHTML = '<i class="fas fa-bomb"></i>';
    }
  });
  setTimeout(() => displayModal('gameOver', 'lose'), 20);
};

const handleGameWin = () => {
  clearInterval(stopWatch);
  seconds = 0;
  minutes = 0;
  game.isOver = true;
  setTimeout(() => displayModal('gameOver', 'win'), 20);
};

const generateRandomNumber = () => {
  return Math.floor(Math.random() * (game.rowSize * game.columnSize));
};

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

  for (let i = 0; i < game.minesQty; i++) {
    let number = generateRandomNumber();
    let row = Math.floor(number / game.rowSize);
    let column = number % game.rowSize;
    let string = `${row}-${column}`;

    while (game.minesLocation.includes(string) || string === initialId || adjacentBlocks.some((id) => id === string)) {
      number = generateRandomNumber();
      row = Math.floor(number / game.rowSize);
      column = number % game.rowSize;
      string = `${row}-${column}`;
    }
    game.minesLocation.push(string);
  }
  document.querySelectorAll('.square').forEach((square) => {
    const numberOfBombs = countBombs(square.id);
    game.adjacentBombs[square.id] = numberOfBombs;
  });

  startStopWatch();
};

const createBoard = () => {
  for (let rowIndex = 0; rowIndex < game.columnSize; rowIndex++) {
    const newRow = document.createElement('div');
    newRow.className = 'board-row';
    newRow.id = `row-${rowIndex}`;
    for (let columnIndex = 0; columnIndex < game.rowSize; columnIndex++) {
      const newSquare = document.createElement('div');
      newSquare.classList.add('square', 'flagable');
      newSquare.id = `square-${rowIndex}-${columnIndex}`;

      newRow.appendChild(newSquare);
    }
    board.appendChild(newRow);
  }
  mineCount.textContent = game.minesQty;
  if (board.offsetWidth - 48 < screen.availWidth) {
    board.style.padding = '0px';
  } else {
    board.style.padding = '0 24px';
  }
};

const countBombs = (id) => {
  const testArray = getAdjacentBlocks(id);
  return testArray
    .filter((tested) => game.minesLocation.includes(tested))
    .length;
};

const checkGameOver = (clickedSquare) => {
  const clickedId = clickedSquare.id.match(/\d+-\d+/)[0];

  // Game Lose :(
  if (game.minesLocation.includes(clickedId)) {
    handleGameLose(clickedSquare);
  }

  // Game Win!
  if (document.querySelectorAll('.clicked').length === game.rowSize * game.columnSize - game.minesQty) {
    handleGameWin(clickedSquare);
  }
};

const openBlock = (block) => {
  const emptyBlocks = [];
  
  block.classList.add('clicked');
  block.classList.remove('flagable');

  const testArray = getAdjacentBlocks(block.id);

  testArray.forEach((testedId) => {
    const element = document.getElementById(`square-${testedId}`);
    if (element) {
      if (game.adjacentBombs[`square-${testedId}`] === 0) {
        emptyBlocks.push(element);
      }
      else {
        element.classList.add('clicked');
        element.classList.remove('flagable');
        element.textContent = game.adjacentBombs[`square-${testedId}`];
      }
    }
  });

  return emptyBlocks;
};

// The logic of the following function came from a question in StackOverFlow.
// The previous solution had an issue with stack size, and doing this way fixes it.
// Source: https://stackoverflow.com/questions/59715599/how-to-fix-maximum-call-stack-size-exceeded-in-minesweeper#:~:text=edited%20Jan%2018%2C%202020%20at%2014%3A52
const handleEmpty = (startingBlock) => {
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
};

const clickSquare = (event) => {

  if (event.target.classList.contains('square') && !event.target.classList.contains('clicked')) {

    if (event.target.classList.contains('flagged')) return;

    // Place initial mines;
    const noMinesPlaced = !game.minesLocation.length;
    if (noMinesPlaced) placeMines(event.target);

    // Prevent any click if game is already over.
    if (game.isOver) return;

    // Click logic
    // Handle counting bombs
    const numberOfBombs = countBombs(event.target.id);
    event.target.innerText = numberOfBombs || '';
    
    const id = event.target.id.match(/\d+-\d+/)[0];
    if (numberOfBombs === 0 && !game.minesLocation.includes(id)) {
      handleEmpty(event.target);
    }

    event.target.classList.add('clicked');
    event.target.classList.remove('flagable');
    checkGameOver(event.target);
  }
    
};

const resetGame = (
  rowSize = game.rowSize,
  columnSize = game.columnSize,
  minesQuantity = game.minesQty,
) => {
  clearStopWatch();
  game.isOver = false;
  game.minesLocation = [];
  game.flagsQty = 0;
  game.rowSize = rowSize;
  game.columnSize = columnSize;
  game.minesQty = minesQuantity;
  document.getElementById('board').innerHTML = '';

  createBoard();
  hideModal();

};

const checkDeviceOrientation = () => {
  return window.outerWidth > window.outerHeight ? 'landscape' : 'portrait';
};
// End of functions declarations block.

// Create the initial 9x9 board.
createBoard();

// This is the main event listener, which triggers the function to open blocks. I decided to put it inside the body, but it only executes any action if the clicked target is a block.
document.body.addEventListener('click', clickSquare);

// This event listener prevents the context menu to show when user right-clicks anything inside the board, then implements the logic of flagging the selected block.
board.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (game.isOver || !game.minesLocation.length) return;
  if (!event.target.classList.contains('flagable')) return;

  if (event.target.classList.contains('flagged')) {
    event.target.innerHTML = '';
    event.target.classList.remove('flagged');
    game.flagsQty -= 1;
  }

  else if (event.target.classList.contains('fa-flag')) {
    game.flagsQty--;
    event.target.parentElement.classList.remove('flagged');
    event.target.parentElement.innerHTML = '';
  }

  else {
    event.target.innerHTML = '<i class="fas fa-flag flagable"></i>';
    event.target.classList.add('flagged');
    game.flagsQty += 1;
  }

  mineCount.textContent = game.minesQty - game.flagsQty;
});

// Close Modal button (the X that shows up on the modal) event listener.
closeModalBtns.forEach((btn) => btn.addEventListener('click', hideModal));

// Reset Game button (appears when game is over) event listener.
resetBtn.addEventListener('click', () => resetGame());

// New Game button (placed on header) event listener.
newGameBtn.addEventListener('click', () => {
  const deviceOrientation = checkDeviceOrientation();
  hardBtn.textContent = `Difícil (${deviceOrientation === 'landscape' ? '30x16' : '16x30'})`;
  displayModal('newGame');
});

// Difficulty buttons event listeners.
easyBtn.addEventListener('click', () => resetGame(9, 9, 12));
mediumBtn.addEventListener('click', () => resetGame(16, 16, 40));
hardBtn.addEventListener('click', (event) => {
  // This is the only difficulty button that has its own logic, based on the user orientation
  if (event.target.textContent === 'Difícil (30x16)') {
    resetGame(30, 16, 76);
  } else {
    resetGame(16, 30, 76);
  }
});

function displayInfoModal() {
  infoModal.style.display = 'unset';
}

infoBtn.addEventListener('click', displayInfoModal);