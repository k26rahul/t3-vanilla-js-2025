export function checkWin(board, boardSize, matchSize) {
  const winningCombinations = generateWinningCombinations(boardSize, matchSize);
  for (const combination of winningCombinations) {
    const a = combination[0];
    if (board[a] && combination.every(index => board[index] === board[a])) {
      return {
        winner: board[a],
        winningCombination: combination,
      };
    }
  }
  return null;
}

const winningCombinationsCache = {};

export function generateWinningCombinations(boardSize, matchSize) {
  const cacheKey = `${boardSize}-${matchSize}`;
  if (winningCombinationsCache[cacheKey]) {
    return winningCombinationsCache[cacheKey];
  }

  const combinations = [];
  const size = boardSize;
  const match = matchSize;

  // Rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - match; col++) {
      const combination = [];
      for (let k = 0; k < match; k++) {
        combination.push(row * size + col + k);
      }
      combinations.push(combination);
    }
  }

  // Columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - match; row++) {
      const combination = [];
      for (let k = 0; k < match; k++) {
        combination.push((row + k) * size + col);
      }
      combinations.push(combination);
    }
  }

  // Main diagonals (top-left to bottom-right)
  for (let row = 0; row <= size - match; row++) {
    for (let col = 0; col <= size - match; col++) {
      const combination = [];
      for (let k = 0; k < match; k++) {
        combination.push((row + k) * size + col + k);
      }
      combinations.push(combination);
    }
  }

  // Anti diagonals (top-right to bottom-left)
  for (let row = 0; row <= size - match; row++) {
    for (let col = match - 1; col < size; col++) {
      const combination = [];
      for (let k = 0; k < match; k++) {
        combination.push((row + k) * size + col - k);
      }
      combinations.push(combination);
    }
  }

  winningCombinationsCache[cacheKey] = combinations;
  return combinations;
}
