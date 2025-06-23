// --- Bot Logic ---
// botDifficultyLevel is now managed in app.js and passed as an argument to getBotMove.

/**
 * Placeholder function for setting bot difficulty.
 * The actual difficulty is now passed directly to `getBotMove`.
 * @param {string} level - The difficulty level ('medium', 'high', 'pro').
 */
function setBotDifficulty(level) {
    // This function can be removed if not needed, as difficulty is passed directly to getBotMove
    console.log("Bot difficulty (set internally in bot.js if needed, but app.js controls now):", level);
}

/**
 * Determines the bot's next move based on the current board state and difficulty.
 * Includes a slight delay for a more realistic feel.
 * @param {Array<string|null>} currentBoard - The current state of the Tic Tac Toe board.
 * @param {string} botSymbol - The symbol the bot is playing ('X' or 'O').
 * @param {string} difficultyLevel - The chosen difficulty level ('medium', 'high', 'pro').
 * @returns {Promise<number>} A promise that resolves with the index of the bot's chosen move.
 */
function getBotMove(currentBoard, botSymbol, difficultyLevel) {
    // Add a slight delay for realism
    return new Promise(resolve => {
        setTimeout(() => {
            let move;
            switch (difficultyLevel) { // Use the passed difficultyLevel
                case 'pro':
                    move = findBestMoveMinimax(currentBoard, botSymbol);
                    break;
                case 'high':
                    move = findStrategicMove(currentBoard, botSymbol);
                    break;
                case 'medium':
                default:
                    move = findRandomReasonableMove(currentBoard, botSymbol);
                    break;
            }
            resolve(move);
        }, 500 + Math.random() * 500); // Delay between 0.5s and 1s
    });
}

// --- Difficulty Level Strategies ---

/**
 * Finds a reasonable move for the bot (Medium difficulty).
 * Prioritizes winning, then blocking the opponent, then a random available spot.
 * @param {Array<string|null>} board - The current board state.
 * @param {string} botSymbol - The bot's symbol.
 * @returns {number} The index of the chosen move, or -1 if no move is found (shouldn't happen in an active game).
 */
function findRandomReasonableMove(board, botSymbol) {
    const opponentSymbol = botSymbol === 'X' ? 'O' : 'X';

    // 1. Check if bot can win in the next move
    let winningMove = findWinningMove(board, botSymbol);
    if (winningMove !== -1) return winningMove;

    // 2. Check if opponent can win in the next move, and block them
    let blockingMove = findWinningMove(board, opponentSymbol);
    if (blockingMove !== -1) return blockingMove;

    // 3. Play a random available spot
    let availableMoves = [];
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) availableMoves.push(i);
    }
    if (availableMoves.length > 0) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    return -1; // Should not happen if game isn't over
}

/**
 * Finds a strategic move for the bot (High difficulty).
 * Prioritizes winning, then blocking, then center, then corners, then sides.
 * @param {Array<string|null>} board - The current board state.
 * @param {string} botSymbol - The bot's symbol.
 * @returns {number} The index of the chosen move, or -1 if no move is found.
 */
function findStrategicMove(board, botSymbol) {
    const opponentSymbol = botSymbol === 'X' ? 'O' : 'X';

    // 1. Win if possible
    let winningMove = findWinningMove(board, botSymbol);
    if (winningMove !== -1) return winningMove;

    // 2. Block opponent if they can win
    let blockingMove = findWinningMove(board, opponentSymbol);
    if (blockingMove !== -1) return blockingMove;

    // 3. Try to take the center
    if (!board[4]) return 4;

    // 4. Try to take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => !board[index]);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 5. Try to take a side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(index => !board[index]);
    if (availableSides.length > 0) {
        return availableSides[Math.floor(Math.random() * availableSides.length)];
    }
    return findRandomReasonableMove(board, botSymbol); // Fallback if all preferred spots are taken
}


/**
 * Helper function to find if a player can win in the next move.
 * @param {Array<string|null>} board - The current board state.
 * @param {string} playerSymbol - The symbol of the player to check for a win.
 * @returns {number} The index of the winning move, or -1 if no immediate win is found.
 */
function findWinningMove(board, playerSymbol) {
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) { // If cell is empty
            board[i] = playerSymbol; // Temporarily try placing the symbol
            // checkWin and isBoardFull are assumed to be globally accessible from app.js
            if (checkWin(board, playerSymbol).isWin) {
                board[i] = null; // Reset the cell before returning
                return i; // This is a winning move
            }
            board[i] = null; // Reset the cell
        }
    }
    return -1; // No immediate winning move found
}


// --- Pro Level: Minimax Algorithm ---
/**
 * Finds the best move for the bot using the Minimax algorithm.
 * @param {Array<string|null>} currentBoard - The current board state.
 * @param {string} botSymbol - The bot's symbol.
 * @returns {number} The index of the best move.
 */
function findBestMoveMinimax(currentBoard, botSymbol) {
    let bestScore = -Infinity;
    let move = -1;
    const opponentSymbol = botSymbol === 'X' ? 'O' : 'X';

    // Optimization for early game to avoid deep minimax calculations
    const emptyCells = currentBoard.filter(cell => cell === null).length;
    if (emptyCells === 9) { // First move of the game
        return 4; // Always take the center
    }
    if (emptyCells === 8) { // Second move of the game
        if (currentBoard[4] === null) return 4; // Take center if available
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => !currentBoard[index]);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)]; // Take a random corner
        }
    }


    for (let i = 0; i < currentBoard.length; i++) {
        if (!currentBoard[i]) { // If cell is available
            currentBoard[i] = botSymbol;
            let score = minimax(currentBoard, 0, false, botSymbol, opponentSymbol);
            currentBoard[i] = null; // Undo the move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    // Fallback to strategic move if minimax somehow doesn't find a move (edge case, shouldn't happen with full minimax)
    if (move === -1) {
        console.log("Minimax couldn't decide, using strategic fallback.");
        return findStrategicMove(currentBoard, botSymbol);
    }
    return move;
}

/**
 * The core Minimax algorithm function.
 * @param {Array<string|null>} board - The current board state.
 * @param {number} depth - The current depth of the recursion tree.
 * @param {boolean} isMaximizingPlayer - True if it's the maximizing player's turn (bot), false for minimizing (opponent).
 * @param {string} botSymbol - The bot's symbol.
 * @param {string} opponentSymbol - The opponent's symbol.
 * @returns {number} The score of the current board state.
 */
function minimax(board, depth, isMaximizingPlayer, botSymbol, opponentSymbol) {
    const scores = {
        [botSymbol]: 10,     // Bot wins
        [opponentSymbol]: -10, // Opponent wins
        'draw': 0            // Draw
    };

    // Check for terminal states (win or draw)
    let winCheck = checkWin(board, botSymbol);
    if (winCheck.isWin) return scores[botSymbol] - depth; // Subtract depth to prefer faster wins

    winCheck = checkWin(board, opponentSymbol);
    if (winCheck.isWin) return scores[opponentSymbol] + depth; // Add depth to prefer blocking longer

    if (isBoardFull(board)) return scores['draw'];

    if (isMaximizingPlayer) { // Bot's turn (wants to maximize score)
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = botSymbol;
                let score = minimax(board, depth + 1, false, botSymbol, opponentSymbol);
                board[i] = null; // Undo the move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else { // Opponent's turn (wants to minimize bot's score)
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = opponentSymbol;
                let score = minimax(board, depth + 1, true, botSymbol, opponentSymbol);
                board[i] = null; // Undo the move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Note: `checkWin` and `isBoardFull` are defined in `app.js` and are globally accessible
// because `app.js` and `bot.js` are loaded after `ui.js` in `index.html`.