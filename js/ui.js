// --- DOM Elements ---
const screens = {
    welcome: document.getElementById('welcome-screen'),
    options: document.getElementById('options-screen'),
    game: document.getElementById('game-screen'),
};
const popups = {
    result: document.getElementById('result-popup'),
};

const buttons = {
    startGame: document.getElementById('start-game-btn'),
    playWithBot: document.getElementById('play-with-bot-btn'),
    playWithFriend: document.getElementById('play-with-friend-btn'),
    startPlaying: document.getElementById('start-playing-btn'),
    newGame: document.getElementById('new-game-btn'),
    tryAgain: document.getElementById('try-again-btn'),
};

const selections = {
    botDifficultyContainer: document.getElementById('bot-difficulty-selection'),
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    symbolSelectionContainer: document.getElementById('symbol-selection'),
    symbolButtons: document.querySelectorAll('.symbol-btn'),
};

const gameElements = {
    board: document.querySelector('.tic-tac-toe-board'),
    cells: document.querySelectorAll('.cell'),
    turnIndicator: document.getElementById('turn-indicator'),
    playerNamesDisplay: document.getElementById('player-names'),
    p1SymbolDisplay: document.getElementById('p1-symbol'),
    p2SymbolDisplay: document.getElementById('p2-symbol'),
    p1NameDisplay: document.getElementById('p1-name'),
    p2NameDisplay: document.getElementById('p2-name'),
};

const resultElements = {
    message: document.getElementById('result-message'),
    winnerAnimation: document.getElementById('winner-animation'),
    loserAnimation: document.getElementById('loser-animation'),
};

// --- UI Transition Functions ---
function showScreen(screenId) {
    for (const screenKey in screens) {
        screens[screenKey].classList.remove('active');
    }
    if (screenId && screens[screenId]) {
        screens[screenId].classList.add('active');
    } else {
        console.error("Screen ID not found:", screenId);
    }
}

function showPopup(popupId) {
    if (popupId && popups[popupId]) {
        popups[popupId].classList.add('active');
    }
}

function hidePopup(popupId) {
    if (popupId && popups[popupId]) {
        popups[popupId].classList.remove('active');
    }
}

// --- Update UI Elements ---
function updateTurnIndicator(message) {
    gameElements.turnIndicator.textContent = message;
    // Add animation for turn change if desired
    gameElements.turnIndicator.style.animation = 'none';
    setTimeout(() => {
        gameElements.turnIndicator.style.animation = 'fadeIn 0.3s ease-out';
    }, 10);
}

function updateCell(index, symbol) {
    const cell = gameElements.cells[index];
    if (cell) {
        cell.textContent = symbol;
        cell.classList.add(symbol); // For X or O specific styling
        // Add symbol placement animation
        cell.style.transform = 'scale(0.5)';
        cell.style.opacity = '0';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
            cell.style.opacity = '1';
            cell.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.2s ease-out';
        }, 50);
    }
}

function resetBoardUI() {
    gameElements.cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'win-cell');
        cell.style.backgroundColor = ''; // Reset background for win highlight
    });
    resultElements.winnerAnimation.classList.add('hidden');
    resultElements.loserAnimation.classList.add('hidden');
    buttons.tryAgain.classList.add('hidden');
    buttons.newGame.textContent = "Start New Game";
}

function displayResult(message, isWinner, isLoser, isDraw) {
    resultElements.message.textContent = message;
    resultElements.winnerAnimation.classList.toggle('hidden', !isWinner);
    resultElements.loserAnimation.classList.toggle('hidden', !isLoser);

    if (isDraw) {
        buttons.newGame.textContent = "Play Again"; // Or specific text for draw
        buttons.tryAgain.classList.add('hidden');
    } else if (isWinner) {
        buttons.newGame.textContent = "Start New Game";
        buttons.tryAgain.classList.add('hidden');
    } else if (isLoser) {
        buttons.tryAgain.classList.remove('hidden');
        buttons.newGame.textContent = "Start New Game"; // Or change to "Main Menu"
    }
    showPopup('result');
}

function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        gameElements.cells[index].classList.add('win-cell');
    });
}

function setupPlayerNamesUI(player1Symbol, player2Symbol, mode, p1Name = "Player 1", p2Name = "Player 2") {
    if (mode === 'friend') {
        gameElements.playerNamesDisplay.classList.remove('hidden');
        gameElements.p1SymbolDisplay.textContent = player1Symbol;
        gameElements.p2SymbolDisplay.textContent = player2Symbol;
        gameElements.p1NameDisplay.textContent = p1Name;
        gameElements.p2NameDisplay.textContent = p2Name;
    } else {
        gameElements.playerNamesDisplay.classList.add('hidden');
    }
}

// Initialize UI
showScreen('welcome'); // Start with the welcome screen