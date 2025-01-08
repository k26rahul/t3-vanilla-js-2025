// scripts/eventHandlers.js
import { resetGame, makeMove, undoMove, redoMove, updateScoresDisplay } from './gameController.js';
import { appState, t3GameEngine } from './appContext.js';

export function handleCellClick(event) {
  const index = parseInt(event.target.getAttribute('data-cell'));
  if (!t3GameEngine.isMoveAvailable(index)) {
    if (t3GameEngine.state.isGameOver) {
      resetGame();
    }
    return;
  }
  makeMove(index, event.target);
}

export function handleBoardSizeChange(event) {
  if (
    t3GameEngine.state.gameStatus === 'PROGRESSING' &&
    !confirm('Are you sure you want to reset the game?')
  ) {
    return;
  }
  const boardSize = parseInt(event.target.value);
  updateMatchSizeOptions(boardSize);
  resetGame();
}

export function handleMatchSizeChange(event) {
  if (
    t3GameEngine.state.gameStatus === 'PROGRESSING' &&
    !confirm('Are you sure you want to reset the game?')
  ) {
    return;
  }
  const matchSize = parseInt(event.target.value);
  t3GameEngine.updateBoardAndMatchSize(t3GameEngine.config.boardSize, matchSize);
  resetGame();
}

export function handleGameModeChange(event) {
  if (
    t3GameEngine.state.gameStatus === 'PROGRESSING' &&
    !confirm('Are you sure you want to reset the game?')
  ) {
    return;
  }
  appState.gameMode = event.target.value;
  resetGame();
}

export function handleAiDifficultyChange(event) {
  appState.aiDifficulty = event.target.value;
}

export function handleAiPlaysAsChange(event) {
  appState.aiPlaysAs = event.target.value;
}

export function handleClearScoreClick() {
  if (confirm('Are you sure you want to reset the scores?')) {
    t3GameEngine.resetScores();
    updateScoresDisplay();
  }
}

export function handleResetBoardClick() {
  if (
    t3GameEngine.state.gameStatus === 'PROGRESSING' &&
    !confirm('Are you sure you want to reset the game?')
  ) {
    return;
  }
  resetGame();
}

export function handleUndoClick() {
  const wasGameOver = t3GameEngine.state.isGameOver;
  const lastMove = t3GameEngine.undoMove();
  if (lastMove) {
    undoMove(lastMove.index);
    if (wasGameOver) {
      updateScoresDisplay();
    }
  }
}

export function handleRedoClick() {
  const lastMove = t3GameEngine.redoMove();
  if (lastMove) {
    redoMove(lastMove.index, lastMove.player);
  }
}

function updateMatchSizeOptions(boardSize) {
  const options = $selectMatchSize.querySelectorAll('option');
  let firstEnabledOption = null;
  let currentSelectedOption = null;

  options.forEach(option => {
    const optionValue = parseInt(option.value);
    const { ok: isOptionEnabled } = t3GameEngine.validateBoardAndMatchSize(boardSize, optionValue);
    option.disabled = !isOptionEnabled;
    option.textContent = isOptionEnabled ? optionValue : `${optionValue} (not available)`;
    if (isOptionEnabled && !firstEnabledOption) firstEnabledOption = option;
    if (option.selected) currentSelectedOption = option;
  });

  if (currentSelectedOption.disabled) {
    firstEnabledOption.selected = true;
    t3GameEngine.updateBoardAndMatchSize(boardSize, parseInt(firstEnabledOption.value));
  } else {
    t3GameEngine.updateBoardAndMatchSize(boardSize, parseInt(currentSelectedOption.value));
  }
}
