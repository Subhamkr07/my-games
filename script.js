let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let winningCombination = [];

const startScreen = document.getElementById('start-screen');
const gameBoardElement = document.getElementById('game-board');
const popupScreen = document.getElementById('popup-screen');
const startButton = document.getElementById('start-btn');
const newGameButton = document.getElementById('new-game-btn');
const popupMessage = document.getElementById('popup-message');
const cells = document.querySelectorAll('.cell');

startButton.addEventListener('click', startGame);
newGameButton.addEventListener('click', startGame);

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => handleCellClick(index));
});

function startGame() {
  startScreen.style.display = 'none';
  popupScreen.style.display = 'none';
  gameBoardElement.style.display = 'flex';
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  isGameActive = true;
  resetGrid();
}

function handleCellClick(index) {
  if (!isGameActive || gameBoard[index]) return;

  gameBoard[index] = currentPlayer;
  document.getElementById(`cell-${index}`).textContent = currentPlayer;

  if (checkWin()) {
    isGameActive = false;
    displayWinningLine();
    setTimeout(() => {
      popupMessage.textContent = `${currentPlayer} wins! Congratulations!`;
      popupScreen.style.display = 'flex';
    }, 1500);
    return;
  }

  if (gameBoard.every(cell => cell !== '')) {
    isGameActive = false;
    popupMessage.textContent = "It's a draw!";
    popupScreen.style.display = 'flex';
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function checkWin() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6]             // Diagonal
  ];

  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
      winningCombination = combination;
      return true;
    }
  }

  return false;
}

function displayWinningLine() {
  const grid = document.querySelector('.grid');
  const line = document.createElement('div');
  line.classList.add('winning-line');

  const [start, , end] = winningCombination;
  const startCell = document.getElementById(`cell-${start}`);
  const endCell = document.getElementById(`cell-${end}`);

  const startX = startCell.offsetLeft + startCell.offsetWidth / 2;
  const startY = startCell.offsetTop + startCell.offsetHeight / 2;
  const endX = endCell.offsetLeft + endCell.offsetWidth / 2;
  const endY = endCell.offsetTop + endCell.offsetHeight / 2;

  const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  line.style.width = `${distance}px`;
  line.style.height = '5px';
  line.style.backgroundColor = '#FF5722';
  line.style.position = 'absolute';
  line.style.borderRadius = '5px';
  line.style.transformOrigin = '0 50%';
  line.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}deg)`;

  grid.appendChild(line);

  // Animate the line over 1 second
  setTimeout(() => {
    line.style.transition = 'width 1s ease-in-out';
    line.style.width = `${distance}px`;
  }, 0);
}

function resetGrid() {
  cells.forEach(cell => cell.textContent = '');
  document.querySelectorAll('.winning-line').forEach(line => line.remove());
}
