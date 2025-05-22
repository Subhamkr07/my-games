// --- Bot Logic ---
// Removed `let botDifficultyLevel = 'medium';` from here as it's now managed in app.js

function setBotDifficulty(level) {
    // This function can be removed if not needed, as difficulty is passed directly to getBotMove
    console.log("Bot difficulty (set internally in bot.js if needed, but app.js controls now):", level);
}

// Modified getBotMove to accept botDifficultyLevel as an argument
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

// Medium: Random move, but will try to win if possible, or block if player is about to win.
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

// High: More strategic than medium. Prioritizes center, then corners, then sides.
// Will always take a win or block an opponent's win.
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


// Helper function to find if a player can win in the next move
function findWinningMove(board, playerSymbol) {
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) { // If cell is empty
            board[i] = playerSymbol; // Try placing the symbol
            // Use checkWin from app.js (assuming it's globally accessible due to script order)
            if (checkWin(board, playerSymbol).isWin) {
                board[i] = null; // Reset the cell
                return i; // This is a winning move
            }
            board[i] = null; // Reset the cell
        }
    }
    return -1; // No immediate winning move found
}


// --- Pro Level: Minimax Algorithm (Simplified) ---
function findBestMoveMinimax(currentBoard, botSymbol) {
    let bestScore = -Infinity;
    let move = -1;
    const opponentSymbol = botSymbol === 'X' ? 'O' : 'X';

    // If the board is empty or nearly empty, pick a strategic first move to speed up/simplify
    const emptyCells = currentBoard.filter(cell => cell === null).length;
    if (emptyCells === 9 || emptyCells === 8) { // First or second move of the game
        if (!currentBoard[4]) return 4; // Take center
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => !currentBoard[index]);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
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
      // If minimax doesn't find a definitive best move (e.g., multiple moves with same score, or very early game)
      // fall back to strategic or random reasonable move to make it less predictable or to handle edge cases.
      // This part might not be strictly necessary for minimax if it always finds *a* best move,
      // but it can add a touch of "humanity" or prevent a bug if minimax fails in an edge case.
    if (move === -1) {
        console.log("Minimax couldn't decide, using strategic fallback.");
        return findStrategicMove(currentBoard, botSymbol);
    }
    return move;
}

function minimax(board, depth, isMaximizingPlayer, botSymbol, opponentSymbol) {
    const scores = {
        [botSymbol]: 10,     // Bot wins
        [opponentSymbol]: -10, // Opponent wins
        'draw': 0            // Draw
    };

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
                board[i] = null;
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
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Note: checkWin and isBoardFull are assumed to be accessible from app.js
// due to the script loading order in index.html.
// If bot.js were to be a completely independent module, these would need to be passed in or defined here.