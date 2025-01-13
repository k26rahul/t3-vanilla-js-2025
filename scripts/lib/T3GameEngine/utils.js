export function evaluateWinner(board, boardSize, matchSize) {
  const winningPatterns = generateWinningPatterns(boardSize, matchSize);
  for (const pattern of winningPatterns) {
    const a = pattern[0];
    if (board[a] && pattern.every(index => board[index] === board[a])) {
      return {
        winner: board[a],
        winningPattern: pattern,
      };
    }
  }
  return null;
}

const winningPatternsCache = {};
export function generateWinningPatterns(boardSize, matchSize) {
  const cacheKey = `${boardSize}-${matchSize}`;
  if (winningPatternsCache[cacheKey]) {
    return winningPatternsCache[cacheKey];
  }

  const patterns = [];
  const size = boardSize;
  const match = matchSize;

  // Rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - match; col++) {
      const pattern = [];
      for (let k = 0; k < match; k++) {
        pattern.push(row * size + col + k);
      }
      patterns.push(pattern);
    }
  }

  // Columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - match; row++) {
      const pattern = [];
      for (let k = 0; k < match; k++) {
        pattern.push((row + k) * size + col);
      }
      patterns.push(pattern);
    }
  }

  // Main diagonals (top-left to bottom-right)
  for (let row = 0; row <= size - match; row++) {
    for (let col = 0; col <= size - match; col++) {
      const pattern = [];
      for (let k = 0; k < match; k++) {
        pattern.push((row + k) * size + col + k);
      }
      patterns.push(pattern);
    }
  }

  // Anti diagonals (top-right to bottom-left)
  for (let row = 0; row <= size - match; row++) {
    for (let col = match - 1; col < size; col++) {
      const pattern = [];
      for (let k = 0; k < match; k++) {
        pattern.push((row + k) * size + col - k);
      }
      patterns.push(pattern);
    }
  }

  winningPatternsCache[cacheKey] = patterns;
  return patterns;
}

export function validateBoardAndMatchSize(boardSize, matchSize, strictRules = true) {
  if (boardSize < 3 || matchSize < 3) {
    return { ok: false, message: 'Board size and match size must be at least 3.' };
  }
  if (matchSize > boardSize) {
    return { ok: false, message: 'Match size cannot be greater than board size.' };
  }
  if (strictRules && boardSize >= 4 && matchSize < 4) {
    return {
      ok: false,
      message: 'For a board size of 4 or more, the match size must be at least 4.',
    };
  }
  return { ok: true, message: '' };
}
