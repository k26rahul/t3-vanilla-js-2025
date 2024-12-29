import T3GameEngine from './lib/T3GameEngine/T3GameEngine.js';
import { applyAndRemoveAnimationClasses } from './utils.js';
import { appState, t3GameEngine, setEngineContext } from './appContext.js';

const $t3Grid = document.querySelector('.t3-grid');
const $statusDisplay = document.querySelector('.status-display');
const $scoreX = document.querySelector('.score-value[data-score-x]');
const $scoreO = document.querySelector('.score-value[data-score-o]');
const $scoreDraw = document.querySelector('.score-value[data-score-draw]');
const $selectBoardSize = document.getElementById('board-size');
const $selectMatchSize = document.getElementById('match-size');
const $selectGameMode = document.getElementById('game-mode');
const $selectAiDifficulty = document.getElementById('ai-difficulty');
const $selectAiPlaysAs = document.getElementById('ai-plays-as');
const $buttonClearScore = document.getElementById('clear-score');
const $buttonResetBoard = document.getElementById('reset-board');
const $buttonUndo = document.getElementById('undo');
const $buttonRedo = document.getElementById('redo');

export function initializeGame() {
  const t3GameEngine = new T3GameEngine();
  window.t3GameEngine = t3GameEngine;
  setEngineContext(t3GameEngine);
  resetGame();
}

export function resetGame() {
  appState.gameStatus = 'initial';
  t3GameEngine.resetState();
  buildBoard();
  updateStatusDisplay();
}

export function buildBoard() {
  const boardSize = t3GameEngine.config.boardSize;
  $t3Grid.innerHTML = '';
  $t3Grid.className = `t3-grid t3-grid-${boardSize}x${boardSize}`;

  const totalCells = boardSize * boardSize;
  for (let i = 0; i < totalCells; i++) {
    const cellWrapper = document.createElement('div');
    cellWrapper.classList.add('t3-cell-wrapper');

    const cell = document.createElement('button');
    cell.classList.add('t3-cell');
    cell.setAttribute('data-cell', i);

    const span = document.createElement('span');
    cell.appendChild(span);

    cellWrapper.appendChild(cell);
    $t3Grid.appendChild(cellWrapper);
  }

  document.querySelectorAll('.t3-cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });
}

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

function makeMove(index, cell) {
  const currentPlayer = t3GameEngine.state.currentPlayer;
  t3GameEngine.makeMove(index);
  appState.gameStatus = 'progressing';
  fillCell(cell, currentPlayer);
  updateStatusDisplay();
  handleGameOver();
}

function undoMove(index) {
  const cell = document.querySelector(`.t3-cell[data-cell="${index}"]`);
  unfillCell(cell);
  updateStatusDisplay();
  handleUndoGameOver();
}

function redoMove(index) {
  const cell = document.querySelector(`.t3-cell[data-cell="${index}"]`);
  const currentPlayer = t3GameEngine.state.currentPlayer;
  fillCell(cell, currentPlayer);
  updateStatusDisplay();
  handleGameOver();
}

function fillCell(cell, currentPlayer) {
  cell.classList.add('filled');
  const span = cell.querySelector('span');
  span.textContent = getPlayerSymbol(currentPlayer);
  applyAndRemoveAnimationClasses(span, ['animated', 'bounceIn']);
}

function unfillCell(cell) {
  const span = cell.querySelector('span');
  applyAndRemoveAnimationClasses(span, ['animated', 'bounceOut'], () => {
    cell.classList.remove('filled');
    span.textContent = '';
  });
}

export function updateStatusDisplay() {
  const state = t3GameEngine.state;
  if (state.isGameOver) {
    $statusDisplay.textContent = state.winner
      ? `${getPlayerSymbol(state.winner)} Wins!`
      : "It's a Draw!";
  } else {
    $statusDisplay.textContent = `${getPlayerSymbol(state.currentPlayer)}'s Turn`;
  }
}

function handleGameOver() {
  const { isGameOver, winner, winningCombination } = t3GameEngine.state;
  if (isGameOver) {
    if (winner) {
      winningCombination.forEach(index => {
        const cell = document.querySelector(`.t3-cell[data-cell="${index}"]`);
        cell.classList.add('winning');
        const span = cell.querySelector('span');
        applyAndRemoveAnimationClasses(span, ['animated', 'bounceIn']);
      });
    }
    updateScoresDisplay();
    $t3Grid.classList.add('game-over');
    appState.gameStatus = 'gameOver';
  }
}

function handleUndoGameOver() {
  if (!t3GameEngine.state.isGameOver) {
    $t3Grid.classList.remove('game-over');
    document.querySelectorAll('.winning').forEach(cell => {
      cell.classList.remove('winning');
      const span = cell.querySelector('span');
      applyAndRemoveAnimationClasses(span, ['animated', 'bounceOut'], () => {
        applyAndRemoveAnimationClasses(span, ['animated', 'bounceIn']);
      });
    });
    appState.gameStatus = 'progressing';
  }
}

function updateScoresDisplay() {
  const state = t3GameEngine.state;
  $scoreX.textContent = state.scores.x || '_';
  $scoreO.textContent = state.scores.o || '_';
  $scoreDraw.textContent = state.scores.draw || '_';
}

export function getPlayerSymbol(player) {
  return player === 'x' ? '✖️' : '⭕';
}

export function initializeControls() {
  updateMatchSizeOptions(t3GameEngine.config.boardSize);

  $selectBoardSize.addEventListener('change', event => {
    if (
      appState.gameStatus === 'progressing' &&
      !confirm('Are you sure you want to reset the game?')
    ) {
      return;
    }
    const boardSize = parseInt(event.target.value);
    updateMatchSizeOptions(boardSize);
    resetGame();
  });

  $selectMatchSize.addEventListener('change', event => {
    if (
      appState.gameStatus === 'progressing' &&
      !confirm('Are you sure you want to reset the game?')
    ) {
      return;
    }
    const matchSize = parseInt(event.target.value);
    t3GameEngine.updateBoardAndMatchSize(t3GameEngine.config.boardSize, matchSize);
    resetGame();
  });

  $selectGameMode.addEventListener('change', event => {
    if (
      appState.gameStatus === 'progressing' &&
      !confirm('Are you sure you want to reset the game?')
    ) {
      return;
    }
    appState.gameMode = event.target.value;
    resetGame();
  });

  $selectAiDifficulty.addEventListener('change', event => {
    appState.aiDifficulty = event.target.value;
  });

  $selectAiPlaysAs.addEventListener('change', event => {
    appState.aiPlaysAs = event.target.value;
  });

  $buttonClearScore.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the scores?')) {
      t3GameEngine.resetScores();
      updateScoresDisplay();
    }
  });

  $buttonResetBoard.addEventListener('click', () => {
    if (
      appState.gameStatus === 'progressing' &&
      !confirm('Are you sure you want to reset the game?')
    ) {
      return;
    }
    resetGame();
  });

  $buttonUndo.addEventListener('click', () => {
    const lastMove = t3GameEngine.undoMove();
    if (lastMove) {
      undoMove(lastMove.index);
    }
  });

  $buttonRedo.addEventListener('click', () => {
    const lastMove = t3GameEngine.redoMove();
    if (lastMove) {
      redoMove(lastMove.index);
    }
  });
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
