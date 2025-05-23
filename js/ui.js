// --- DOM Elements ---
// These are global variables that will be accessible to app.js and bot.js
// because ui.js is loaded first in index.html.
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
    startNewGame: document.getElementById('start-new-game-btn'), // Renamed for clarity
    playAgainSameMode: document.getElementById('play-again-same-mode-btn'), // Renamed for clarity
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
/**
 * Shows a specific screen and hides all others.
 * @param {string} screenId - The ID of the screen to show (e.g., 'welcome', 'options', 'game').
 */
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

/**
 * Shows a specific popup.
 * @param {string} popupId - The ID of the popup to show (e.g., 'result').
 */
function showPopup(popupId) {
    if (popupId && popups[popupId]) {
        popups[popupId].classList.add('active');
    }
}

/**
 * Hides a specific popup.
 * @param {string} popupId - The ID of the popup to hide (e.g., 'result').
 */
function hidePopup(popupId) {
    if (popupId && popups[popupId]) {
        popups[popupId].classList.remove('active');
    }
}

// --- Update UI Elements ---
/**
 * Updates the text content of the turn indicator.
 * @param {string} message - The message to display (e.g., "Player X's Turn").
 */
function updateTurnIndicator(message) {
    gameElements.turnIndicator.textContent = message;
    // Add a subtle animation for turn change
    gameElements.turnIndicator.style.animation = 'none'; // Reset animation
    void gameElements.turnIndicator.offsetWidth; // Trigger reflow
    gameElements.turnIndicator.style.animation = 'fadeIn 0.3s ease-out'; // Apply new animation
}

/**
 * Updates a specific cell on the Tic Tac Toe board with a symbol.
 * Adds styling classes and an animation for placing the symbol.
 * @param {number} index - The index of the cell (0-8).
 * @param {string} symbol - The symbol to place ('X' or 'O').
 */
function updateCell(index, symbol) {
    const cell = gameElements.cells[index];
    if (cell) {
        cell.textContent = symbol;
        cell.classList.add(symbol); // Add 'X' or 'O' class for specific styling
        // Apply placement animation
        cell.style.transform = 'scale(0.5)';
        cell.style.opacity = '0';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
            cell.style.opacity = '1';
            cell.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.2s ease-out';
        }, 50);
    }
}

/**
 * Resets the visual state of the Tic Tac Toe board cells.
 * Clears symbols, removes styling classes, and hides result animations.
 */
function resetBoardUI() {
    gameElements.cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'win-cell');
        cell.style.backgroundColor = ''; // Reset background for win highlight
        cell.style.transform = ''; // Clear any inline transform from animations
        cell.style.opacity = '';   // Clear any inline opacity from animations
        cell.style.transition = ''; // Clear any inline transition
    });
    resultElements.winnerAnimation.classList.add('hidden');
    resultElements.loserAnimation.classList.add('hidden');
    // The visibility of playAgainSameMode and startNewGame buttons is now handled in endGame,
    // so no explicit hide or text change is needed here.
}

/**
 * Displays the game result message and appropriate animations/buttons in the popup.
 * @param {string} message - The main message to display (e.g., "It's a Draw!").
 * @param {boolean} isWinner - True if the human player won.
 * @param {boolean} isLoser - True if the human player lost (only relevant for bot mode).
 * @param {boolean} isDraw - True if the game is a draw.
 */
function displayResult(message, isWinner, isLoser, isDraw) {
    resultElements.message.textContent = message;
    resultElements.winnerAnimation.classList.toggle('hidden', !isWinner);
    resultElements.loserAnimation.classList.toggle('hidden', !isLoser);

    // Logic for showing/hiding buttons is now handled externally in the endGame function in app.js
    showPopup('result');
}

/**
 * Applies a visual highlight to the cells that form the winning combination.
 * @param {number[]} winningCombination - An array of cell indices that form the win.
 */
function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        gameElements.cells[index].classList.add('win-cell');
    });
}

/**
 * Sets up the display for player names and symbols, primarily for 'friend' mode.
 * @param {string} player1Symbol - Symbol for Player 1.
 * @param {string} player2Symbol - Symbol for Player 2.
 * @param {string} mode - The current game mode ('bot' or 'friend').
 * @param {string} [p1Name="Player 1"] - Name for Player 1.
 * @param {string} [p2Name="Player 2"] - Name for Player 2.
 */
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

// Note: Initial screen display is handled by app.js's DOMContentLoaded listener.