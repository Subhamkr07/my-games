// --- Game State Variables ---
let currentPlayer;
let player1Symbol;
let player2Symbol; // Can be 'BOT' or the friend's symbol
let gameMode; // 'bot' or 'friend'
let boardState = Array(9).fill(null); // Represents the 3x3 board
let gameActive = false;
let humanPlayerSymbol; // Symbol chosen by the human player
let botSymbol;
let botDifficultyLevel; // Managed here in app.js

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]  // Diagonals
];

// --- Event Listeners Setup (Called from initGame or after DOM loaded) ---
function initializeEventListeners() {
    buttons.startGame.addEventListener('click', () => {
        showScreen('options');
        resetOptionsScreen(); // Call this to set initial state of options
    });

    buttons.playWithBot.addEventListener('click', () => {
        gameMode = 'bot';
        // Clear previous selections for a fresh start
        selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));
        humanPlayerSymbol = null; // Reset chosen symbol
        botDifficultyLevel = null; // Reset chosen difficulty

        selections.botDifficultyContainer.classList.remove('hidden'); // Show difficulty
        selections.symbolSelectionContainer.classList.add('hidden'); // Hide symbol initially
        buttons.startPlaying.classList.add('hidden'); // Hide start button initially

        // Highlight this choice
        buttons.playWithBot.classList.add('selected-mode');
        buttons.playWithFriend.classList.remove('selected-mode');
        // Optional: Hide friend button for clarity once bot is chosen
        // buttons.playWithFriend.classList.add('hidden');
    });

    buttons.playWithFriend.addEventListener('click', () => {
        gameMode = 'friend';
        // Clear previous selections for a fresh start
        selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));
        humanPlayerSymbol = null; // Reset chosen symbol
        botDifficultyLevel = null; // Ensure bot difficulty is cleared

        selections.botDifficultyContainer.classList.add('hidden'); // Hide difficulty for friend mode
        selections.symbolSelectionContainer.classList.remove('hidden'); // Show symbol selection
        buttons.startPlaying.classList.add('hidden'); // Hide start button initially

        // Highlight this choice
        buttons.playWithFriend.classList.add('selected-mode');
        buttons.playWithBot.classList.remove('selected-mode');
        // Optional: Hide bot button for clarity once friend is chosen
        // buttons.playWithBot.classList.add('hidden');
    });

    selections.difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            botDifficultyLevel = button.dataset.difficulty; // Set the global difficulty level
            selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            console.log("Bot difficulty set to:", botDifficultyLevel);

            // Now show symbol selection after difficulty is chosen
            selections.symbolSelectionContainer.classList.remove('hidden');
            buttons.startPlaying.classList.add('hidden'); // Hide start button until symbol is chosen
            humanPlayerSymbol = null; // Reset symbol choice when difficulty changes
            selections.symbolButtons.forEach(btn => btn.classList.remove('selected')); // Deselect previous symbol
        });
    });

    selections.symbolButtons.forEach(button => {
        button.addEventListener('click', () => {
            humanPlayerSymbol = button.dataset.symbol;
            selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            console.log("Human player chose:", humanPlayerSymbol);

            // Now show "Let's Play!" button
            buttons.startPlaying.classList.remove('hidden');
        });
    });

    buttons.startPlaying.addEventListener('click', () => {
        if (!gameMode) {
            alert("Please choose a game mode (Bot or Friend)!");
            return;
        }
        if (!humanPlayerSymbol) {
            alert("Please select your symbol (X or O) first!");
            return;
        }
        if (gameMode === 'bot' && !botDifficultyLevel) {
            alert("Please select bot difficulty!");
            return;
        }
        startGame();
    });

    gameElements.cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    buttons.newGame.addEventListener('click', () => {
        hidePopup('result');
        showScreen('options');
        resetOptionsScreen(); // Reset options screen for a new game
    });

    buttons.tryAgain.addEventListener('click', () => {
        hidePopup('result');
        // Restart with same settings, so no need to reset options screen completely
        // Just reset game state and start
        startGame();
    });
}

function resetOptionsScreen() {
    // Reset all option-related states and UI elements
    gameMode = null;
    humanPlayerSymbol = null;
    botDifficultyLevel = null;

    // Remove selected styling from mode buttons
    buttons.playWithBot.classList.remove('selected-mode');
    buttons.playWithFriend.classList.remove('selected-mode');

    // Remove selected styling from difficulty and symbol buttons
    selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));

    // Hide difficulty, symbol, and start playing sections
    selections.botDifficultyContainer.classList.add('hidden');
    selections.symbolSelectionContainer.classList.add('hidden');
    buttons.startPlaying.classList.add('hidden');

    // Make sure initial mode selection buttons are visible (if they were hidden conditionally)
    buttons.playWithBot.classList.remove('hidden');
    buttons.playWithFriend.classList.remove('hidden');
}


// --- Game Logic Functions ---
function startGame() {
    showScreen('game');
    resetBoardUI();
    boardState.fill(null);
    gameActive = true;

    player1Symbol = humanPlayerSymbol; // Human is always Player 1 initially

    if (gameMode === 'bot') {
        botSymbol = player1Symbol === 'X' ? 'O' : 'X';
        player2Symbol = 'BOT'; // Identifier for bot
        currentPlayer = player1Symbol; // Human always starts first against bot
        updateTurnIndicator(`Your turn (${player1Symbol})`);
        setupPlayerNamesUI(player1Symbol, botSymbol, 'bot', "You", "Bot"); // Added names for clarity
    } else { // Friend mode
        player2Symbol = player1Symbol === 'X' ? 'O' : 'X';
        currentPlayer = player1Symbol; // Player who chose symbol starts
        let p1Name = prompt("Enter Player 1 Name (playing as " + player1Symbol + "):", "Player 1") || "Player 1";
        let p2Name = prompt("Enter Player 2 Name (playing as " + player2Symbol + "):", "Player 2") || "Player 2";
        setupPlayerNamesUI(player1Symbol, player2Symbol, 'friend', p1Name, p2Name);
        updateTurnIndicator(`${p1Name}'s Turn (${currentPlayer})`);
    }
    console.log(`Game Started. Mode: ${gameMode}, P1: ${player1Symbol}, P2/Bot: ${gameMode === 'bot' ? botSymbol : player2Symbol}, Bot Difficulty: ${botDifficultyLevel}`);
}

function handleCellClick(event) {
    if (!gameActive) return;

    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    // Check if it's human's turn (for bot mode) or correct player's turn (for friend mode)
    // For bot mode, ensure it's the human's turn before allowing a click
    if (gameMode === 'bot' && currentPlayer !== player1Symbol) {
        console.log("Not your turn (bot mode). Bot is thinking or it's bot's turn.");
        // Add a slight visual cue that it's not clickable
        clickedCell.style.animation = 'shakeInvalid 0.4s ease';
        setTimeout(() => clickedCell.style.animation = '', 400);
        return;
    }

    if (boardState[clickedCellIndex] !== null) { // Check if cell is already taken (using !== null for clarity)
        // Cell already taken
        clickedCell.style.animation = 'shakeInvalid 0.4s ease'; // Add a little shake
        setTimeout(() => clickedCell.style.animation = '', 400);
        return;
    }

    makeMove(clickedCellIndex, currentPlayer);

    if (gameActive) { // If game didn't end after human move
        if (gameMode === 'bot') {
            // Human made a move, now it's bot's turn (conceptually)
            gameElements.board.style.pointerEvents = 'none'; // Disable clicks while bot thinks
            updateTurnIndicator(`Bot (${botSymbol}) is thinking...`);
            // Pass botDifficultyLevel to getBotMove from here
            getBotMove([...boardState], botSymbol, botDifficultyLevel)
                .then(botMoveIndex => {
                    if (botMoveIndex !== -1 && boardState[botMoveIndex] === null && gameActive) {
                        setTimeout(() => { // Add slight delay before bot places symbol for better feel
                            makeMove(botMoveIndex, botSymbol);
                            if (gameActive) { // Check gameActive again after bot move
                                currentPlayer = player1Symbol; // Switch back to human
                                updateTurnIndicator(`Your turn (${player1Symbol})`);
                            }
                            gameElements.board.style.pointerEvents = 'auto'; // Re-enable clicks
                        }, 200);

                    } else if (gameActive) {
                        console.error("Bot failed to make a valid move or game ended unexpectedly before bot move.");
                        currentPlayer = player1Symbol; // Still human's turn if bot fails
                        updateTurnIndicator(`Your turn (${player1Symbol})`);
                        gameElements.board.style.pointerEvents = 'auto';
                    } else {
                        gameElements.board.style.pointerEvents = 'auto'; // Re-enable clicks if game ended
                    }
                })
                .catch(error => {
                    console.error("Error during bot move:", error);
                    gameElements.board.style.pointerEvents = 'auto';
                    updateTurnIndicator(`Error: Your turn (${player1Symbol})`);
                });
        } else { // Friend mode
            switchPlayer();
        }
    }
}

function makeMove(index, symbol) {
    if (!gameActive || boardState[index] !== null) return;

    boardState[index] = symbol;
    updateCell(index, symbol);

    const winResult = checkWin(boardState, symbol);
    if (winResult.isWin) {
        endGame(false, symbol, winResult.combination);
        return;
    }

    if (isBoardFull(boardState)) {
        endGame(true); // It's a draw
        return;
    }
}


function switchPlayer() {
    if (gameMode === 'bot') {
        // In bot mode, currentPlayer tracks whose turn it is
        // We set currentPlayer to the human player after the bot's move,
        // and it's already set to humanPlayerSymbol when the human clicks.
        // So no explicit switch needed here, just the indicator update.
    } else { // Friend mode
        currentPlayer = currentPlayer === player1Symbol ? player2Symbol : player1Symbol;
        let p1Name = gameElements.p1NameDisplay.textContent;
        let p2Name = gameElements.p2NameDisplay.textContent;
        let currentTurnPlayerName = currentPlayer === player1Symbol ? p1Name : p2Name;
        updateTurnIndicator(`${currentTurnPlayerName}'s Turn (${currentPlayer})`);
    }
}

// Modified checkWin to return the winning combination
function checkWin(currentBoard, playerSymbol) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (currentBoard[a] === playerSymbol &&
            currentBoard[b] === playerSymbol &&
            currentBoard[c] === playerSymbol) {
            return { isWin: true, combination: combination };
        }
    }
    return { isWin: false, combination: null };
}


function isBoardFull(currentBoard) {
    return currentBoard.every(cell => cell !== null);
}

function endGame(isDraw, winnerSymbol = null, winningCombination = null) {
    gameActive = false;
    gameElements.board.style.pointerEvents = 'none'; // Disable further clicks on board cells

    if (isDraw) {
        displayResult("It's a Draw!", false, false, true);
    } else {
        if (winningCombination) {
            highlightWinningCells(winningCombination);
        }
        if (gameMode === 'bot') {
            if (winnerSymbol === player1Symbol) { // Human player wins
                displayResult("🎉 You Won! Congratulations! 🎉", true, false, false);
            } else { // Bot wins
                displayResult("🤖 Bot Wins! You Lose! 🤖", false, true, false);
            }
        } else { // Friend mode
            let p1Name = gameElements.p1NameDisplay.textContent;
            let p2Name = gameElements.p2NameDisplay.textContent;
            const winnerName = winnerSymbol === player1Symbol ? p1Name : p2Name;
            displayResult(`🎉 ${winnerName} (${winnerSymbol}) Wins! 🎉`, true, false, false);
        }
    }
    // Re-enable pointer events after a short delay so the popup click doesn't trigger the board
    setTimeout(() => gameElements.board.style.pointerEvents = 'auto', 500);
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    showScreen('welcome'); // Start with the welcome screen
});