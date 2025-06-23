// --- Game State Variables ---
// These variables manage the overall state of the game.
let currentPlayer; // Tracks whose turn it is ('X' or 'O')
let player1Symbol; // Symbol chosen by Player 1 (human in bot mode, or first player in friend mode)
let player2Symbol; // Symbol for Player 2 (BOT or friend's symbol)
let gameMode;      // Current game mode: 'bot' or 'friend'
let boardState = Array(9).fill(null); // Represents the 3x3 Tic Tac Toe board (null for empty, 'X' or 'O' for filled)
let gameActive = false; // True if a game is currently in progress
let humanPlayerSymbol; // Specifically stores the symbol chosen by the human player
let botSymbol;         // Specifically stores the symbol assigned to the bot
let botDifficultyLevel; // Stores the selected bot difficulty ('medium', 'high', 'pro')

// Predefined winning combinations for Tic Tac Toe
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]  // Diagonals
];

// --- Event Listeners Setup ---
/**
 * Initializes all event listeners for buttons and game cells.
 * This function is called once the DOM is fully loaded.
 */
function initializeEventListeners() {
    // Event listener for the "Start Game" button on the welcome screen
    buttons.startGame.addEventListener('click', () => {
        showScreen('options'); // Transition to the options screen
        resetOptionsScreen();  // Reset the options screen's state for a fresh start
    });

    // Event listener for "Play with Automatic Bot" button
    buttons.playWithBot.addEventListener('click', () => {
        gameMode = 'bot'; // Set game mode to bot
        // Reset selections and hide elements for a clean sequential flow
        selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));
        humanPlayerSymbol = null; // Clear previously chosen symbol
        botDifficultyLevel = null; // Clear previously chosen difficulty

        selections.botDifficultyContainer.classList.remove('hidden'); // Show bot difficulty options
        selections.symbolSelectionContainer.classList.add('hidden'); // Hide symbol selection initially
        buttons.startPlaying.classList.add('hidden'); // Hide "Let's Play!" button initially

        // Highlight the selected mode button
        buttons.playWithBot.classList.add('selected-mode');
        buttons.playWithFriend.classList.remove('selected-mode');
    });

    // Event listener for "Play with Friend" button
    buttons.playWithFriend.addEventListener('click', () => {
        gameMode = 'friend'; // Set game mode to friend
        // Reset selections and hide elements for a clean sequential flow
        selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));
        humanPlayerSymbol = null; // Clear previously chosen symbol
        botDifficultyLevel = null; // Ensure bot difficulty is cleared

        selections.botDifficultyContainer.classList.add('hidden'); // Hide bot difficulty for friend mode
        selections.symbolSelectionContainer.classList.remove('hidden'); // Show symbol selection for Player 1
        buttons.startPlaying.classList.add('hidden'); // Hide "Let's Play!" button initially

        // Highlight the selected mode button
        buttons.playWithFriend.classList.add('selected-mode');
        buttons.playWithBot.classList.remove('selected-mode');
    });

    // Event listeners for bot difficulty buttons
    selections.difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            botDifficultyLevel = button.dataset.difficulty; // Store the selected difficulty
            // Visually select the clicked difficulty button
            selections.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            console.log("Bot difficulty set to:", botDifficultyLevel);

            // Once difficulty is chosen, show the symbol selection
            selections.symbolSelectionContainer.classList.remove('hidden');
            buttons.startPlaying.classList.add('hidden'); // Ensure "Let's Play!" is hidden until symbol is chosen
            humanPlayerSymbol = null; // Reset symbol choice if difficulty changes
            selections.symbolButtons.forEach(btn => btn.classList.remove('selected')); // Deselect previous symbol
        });
    });

    // Event listeners for symbol selection buttons
    selections.symbolButtons.forEach(button => {
        button.addEventListener('click', () => {
            humanPlayerSymbol = button.dataset.symbol; // Store the selected symbol for the human player
            // Visually select the clicked symbol button
            selections.symbolButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            console.log("Human player chose:", humanPlayerSymbol);

            // Once symbol is chosen, show the "Let's Play!" button
            buttons.startPlaying.classList.remove('hidden');
        });
    });

    // Event listener for the "Let's Play!" button
    buttons.startPlaying.addEventListener('click', () => {
        // Basic validation before starting the game
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
        startGame(); // Start the game if all selections are made
    });

    // Event listeners for each cell on the Tic Tac Toe board
    gameElements.cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Event listener for the "Start New Game" button on the result popup
    buttons.startNewGame.addEventListener('click', () => {
        hidePopup('result');    // Hide the result popup
        showScreen('options');  // Go back to the options screen
        resetOptionsScreen();   // Reset options screen for a completely new game setup
    });

    // Event listener for the "Play Again" button on the result popup (same mode/settings)
    buttons.playAgainSameMode.addEventListener('click', () => {
        hidePopup('result'); // Hide the result popup
        startGame();         // Restart the game with the current (same) mode, difficulty, and symbols
    });
}

/**
 * Resets the UI and state of the options screen.
 * This ensures a clean slate when returning to it.
 */
function resetOptionsScreen() {
    // Reset all option-related states
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

    // Ensure initial mode selection buttons are visible
    buttons.playWithBot.classList.remove('hidden');
    buttons.playWithFriend.classList.remove('hidden');
}


// --- Game Logic Functions ---
/**
 * Initializes and starts a new Tic Tac Toe game.
 * Sets up the board, player symbols, turn indicator, and player names display.
 */
function startGame() {
    showScreen('game'); // Transition to the game screen
    resetBoardUI();     // Clear the board visually
    boardState.fill(null); // Reset the internal board state
    gameActive = true;  // Set game to active

    player1Symbol = humanPlayerSymbol; // Human player's chosen symbol is always Player 1's symbol

    if (gameMode === 'bot') {
        botSymbol = player1Symbol === 'X' ? 'O' : 'X'; // Bot gets the opposite symbol
        player2Symbol = 'BOT'; // Identify Player 2 as BOT
        currentPlayer = player1Symbol; // Human player always starts first against the bot
        updateTurnIndicator(`Your turn (${player1Symbol})`); // Update turn display
        setupPlayerNamesUI(player1Symbol, botSymbol, 'bot', "You", "Bot"); // Set up names for bot mode
    } else { // Friend mode
        player2Symbol = player1Symbol === 'X' ? 'O' : 'X'; // Friend gets the opposite symbol
        currentPlayer = player1Symbol; // Player who chose symbol starts
        // Prompt for player names (using prompt for simplicity, could be custom modal)
        let p1Name = prompt("Enter Player 1 Name (playing as " + player1Symbol + "):", "Player 1") || "Player 1";
        let p2Name = prompt("Enter Player 2 Name (playing as " + player2Symbol + "):", "Player 2") || "Player 2";
        setupPlayerNamesUI(player1Symbol, player2Symbol, 'friend', p1Name, p2Name); // Set up names for friend mode
        updateTurnIndicator(`${p1Name}'s Turn (${currentPlayer})`); // Update turn display (using p1Name here)
    }
    console.log(`Game Started. Mode: ${gameMode}, P1: ${player1Symbol}, P2/Bot: ${gameMode === 'bot' ? botSymbol : player2Symbol}, Bot Difficulty: ${botDifficultyLevel}`);
}

/**
 * Handles a click event on a Tic Tac Toe cell.
 * Manages player moves, checks for game end conditions, and triggers bot moves.
 * @param {Event} event - The click event object.
 */
function handleCellClick(event) {
    if (!gameActive) return; // Do nothing if the game is not active

    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    // In bot mode, ensure it's the human player's turn before allowing a click.
    if (gameMode === 'bot' && currentPlayer !== player1Symbol) {
        console.log("Not your turn (bot mode). Bot is thinking or it's bot's turn.");
        // Provide visual feedback that the cell is not clickable yet
        clickedCell.style.animation = 'shakeInvalid 0.4s ease';
        setTimeout(() => clickedCell.style.animation = '', 400);
        return;
    }

    // Check if the cell is already taken
    if (boardState[clickedCellIndex] !== null) {
        clickedCell.style.animation = 'shakeInvalid 0.4s ease';
        setTimeout(() => clickedCell.style.animation = '', 400);
        return;
    }

    makeMove(clickedCellIndex, currentPlayer); // Make the human player's move

    if (gameActive) { // If the game didn't end after the human's move
        if (gameMode === 'bot') {
            // It's now conceptually the bot's turn
            gameElements.board.style.pointerEvents = 'none'; // Disable clicks while bot is "thinking"
            updateTurnIndicator(`Bot (${botSymbol}) is thinking...`);

            // Get the bot's move asynchronously
            getBotMove([...boardState], botSymbol, botDifficultyLevel)
                .then(botMoveIndex => {
                    if (botMoveIndex !== -1 && boardState[botMoveIndex] === null && gameActive) {
                        // Add a slight delay before the bot places its symbol for better user experience
                        setTimeout(() => {
                            makeMove(botMoveIndex, botSymbol); // Make the bot's move
                            if (gameActive) { // If game is still active after bot's move
                                currentPlayer = player1Symbol; // Switch back to human player's turn
                                updateTurnIndicator(`Your turn (${player1Symbol})`);
                            }
                            gameElements.board.style.pointerEvents = 'auto'; // Re-enable clicks
                        }, 200);

                    } else if (gameActive) { // Should ideally not happen if bot logic is sound
                        console.error("Bot failed to make a valid move or game ended unexpectedly before bot move.");
                        currentPlayer = player1Symbol; // Revert to human's turn if bot fails
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
            switchPlayer(); // Switch to the other human player's turn
        }
    }
}

/**
 * Executes a move on the board.
 * Updates the internal board state and the UI. Checks for win/draw conditions.
 * @param {number} index - The index of the cell where the move is made.
 * @param {string} symbol - The symbol to place ('X' or 'O').
 */
function makeMove(index, symbol) {
    if (!gameActive || boardState[index] !== null) return; // Prevent moves if game not active or cell taken

    boardState[index] = symbol; // Update internal board state
    updateCell(index, symbol);  // Update UI

    const winResult = checkWin(boardState, symbol); // Check for a win
    if (winResult.isWin) {
        endGame(false, symbol, winResult.combination); // End game if there's a winner
        return;
    }

    if (isBoardFull(boardState)) { // Check for a draw
        endGame(true); // End game if it's a draw
        return;
    }
}

/**
 * Switches the current player in 'friend' mode.
 * In 'bot' mode, the player switch is handled implicitly by the human-bot turn sequence.
 */
function switchPlayer() {
    if (gameMode === 'bot') {
        // In bot mode, `currentPlayer` is implicitly managed: human moves, then bot moves.
        // The `updateTurnIndicator` is called after the bot's move to show it's the human's turn again.
    } else { // Friend mode
        currentPlayer = currentPlayer === player1Symbol ? player2Symbol : player1Symbol; // Toggle player
        let p1Name = gameElements.p1NameDisplay.textContent;
        let p2Name = gameElements.p2NameDisplay.textContent;
        let currentTurnPlayerName = currentPlayer === player1Symbol ? p1Name : p2Name;
        updateTurnIndicator(`${currentTurnPlayerName}'s Turn (${currentPlayer})`); // Update turn display
    }
}

/**
 * Checks if a player has won the game.
 * @param {Array<string|null>} currentBoard - The current state of the board.
 * @param {string} playerSymbol - The symbol of the player to check for a win.
 * @returns {{isWin: boolean, combination: number[]|null}} An object indicating if there's a win and the winning combination.
 */
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

/**
 * Checks if the board is completely full (indicating a draw if no win has occurred).
 * @param {Array<string|null>} currentBoard - The current state of the board.
 * @returns {boolean} True if the board is full, false otherwise.
 */
function isBoardFull(currentBoard) {
    return currentBoard.every(cell => cell !== null);
}

/**
 * Ends the current game, displays the result, and shows appropriate action buttons.
 * @param {boolean} isDraw - True if the game ended in a draw.
 * @param {string|null} [winnerSymbol=null] - The symbol of the winning player, if any.
 * @param {number[]|null} [winningCombination=null] - The array of indices forming the winning line.
 */
function endGame(isDraw, winnerSymbol = null, winningCombination = null) {
    gameActive = false; // Deactivate the game
    gameElements.board.style.pointerEvents = 'none'; // Disable further clicks on the board

    // Hide winner/loser animations initially, they will be toggled by displayResult
    resultElements.winnerAnimation.classList.add('hidden');
    resultElements.loserAnimation.classList.add('hidden');

    if (isDraw) {
        displayResult("It's a Draw!", false, false, true);
    } else {
        if (winningCombination) {
            highlightWinningCells(winningCombination); // Highlight the winning cells
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

    // Always show both "Play Again" and "Start New Game" buttons after any result
    buttons.playAgainSameMode.classList.remove('hidden');
    buttons.startNewGame.classList.remove('hidden');

    // Re-enable pointer events on the board after a short delay,
    // in case the user clicks outside the popup before it fully appears.
    setTimeout(() => gameElements.board.style.pointerEvents = 'auto', 500);
}


// --- Initialization ---
/**
 * Ensures the DOM is fully loaded before initializing event listeners and showing the welcome screen.
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners(); // Set up all interactive elements
    showScreen('welcome');      // Ensure the welcome screen is shown first
});
// Splash animation logic
document.addEventListener('DOMContentLoaded', () => {
  const logoSplash = document.getElementById('logo-splash');
  const logoImg = logoSplash?.querySelector('img');
  if (!logoSplash || !logoImg) return;

  setTimeout(() => {
    logoImg.style.opacity = '1';
    logoImg.style.transform = 'scale(1)';
  }, 500);

  setTimeout(() => {
    logoSplash.style.opacity = '0';
    setTimeout(() => {
      logoSplash.style.display = 'none';
      showScreen('welcome');
    }, 1000);
  }, 3000);
});
