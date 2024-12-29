import { applyAndRemoveAnimationClasses } from './utils.js';

let t3GameEngine = null;
let appState = null;

export function updateGameControllerContext(gameEngine, state) {
  t3GameEngine = gameEngine;
  appState = state;
}

export function resetBoard() {
  t3GameEngine.resetState();
  const boardSize = t3GameEngine.config.boardSize;
  const t3Grid = document.querySelector('.t3-grid');
  t3Grid.innerHTML = '';
  t3Grid.className = `t3-grid t3-grid-${boardSize}x${boardSize}`;

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
    t3Grid.appendChild(cellWrapper);
  }

  document.querySelectorAll('.t3-cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });

  updateStatusDisplay();
  appState.gameStatus = 'idle';
}

export function handleCellClick(event) {
  const index = parseInt(event.target.getAttribute('data-cell'));
  if (!t3GameEngine.isMoveAvailable(index)) {
    if (t3GameEngine.state.isGameOver) {
      resetBoard();
    }
    return;
  }
  const currentPlayer = t3GameEngine.state.currentPlayer;
  t3GameEngine.makeMove(index);
  appState.gameStatus = 'active';
  updateCell(event.target, currentPlayer);
  updateStatusDisplay();
  handleGameOver();
}

function updateCell(cell, currentPlayer) {
  cell.classList.add('filled');
  const span = cell.querySelector('span');
  span.textContent = getPlayerSymbol(currentPlayer);
  applyAndRemoveAnimationClasses(span, 'animated', 'bounceIn');
}

export function updateStatusDisplay() {
  const state = t3GameEngine.state;
  const statusDisplay = document.querySelector('.status-display');
  if (state.isGameOver) {
    statusDisplay.textContent = state.winner
      ? `${getPlayerSymbol(state.winner)} Wins!`
      : "It's a Draw!";
  } else {
    statusDisplay.textContent = `${getPlayerSymbol(state.currentPlayer)}'s Turn`;
  }
}

function handleGameOver() {
  const state = t3GameEngine.state;
  if (state.isGameOver) {
    const winningCombination = state.winningCombination;
    if (winningCombination) {
      winningCombination.forEach(index => {
        const cell = document.querySelector(`.t3-cell[data-cell="${index}"]`);
        cell.classList.add('winning');
        const span = cell.querySelector('span');
        applyAndRemoveAnimationClasses(span, 'animated', 'bounceIn');
      });
    }
    updateScoresDisplay();
    const t3Grid = document.querySelector('.t3-grid');
    t3Grid.classList.add('game-over');
    appState.gameStatus = 'gameOver';
  }
}

function updateScoresDisplay() {
  const state = t3GameEngine.state;
  const scoreX = document.querySelector('.score-value[data-score-x]');
  const scoreO = document.querySelector('.score-value[data-score-o]');
  const scoreDraw = document.querySelector('.score-value[data-score-draw]');
  scoreX.textContent = state.scores.x || '_';
  scoreO.textContent = state.scores.o || '_';
  scoreDraw.textContent = state.scores.draw || '_';
}

export function getPlayerSymbol(player) {
  return player === 'x' ? '✖️' : '⭕';
}

export function initializeControls() {
  document.getElementById('board-size').addEventListener('change', event => {
    if (appState.gameStatus === 'active' && !confirm('Are you sure you want to reset the game?')) {
      return;
    }
    const boardSize = parseInt(event.target.value);
    updateMatchSizeOptions(boardSize);
    resetBoard();
  });

  document.getElementById('match-size').addEventListener('change', event => {
    if (appState.gameStatus === 'active' && !confirm('Are you sure you want to reset the game?')) {
      return;
    }
    const matchSize = parseInt(event.target.value);
    t3GameEngine.updateBoardAndMatchSize(t3GameEngine.config.boardSize, matchSize);
    resetBoard();
  });

  document.getElementById('game-mode').addEventListener('change', event => {
    if (appState.gameStatus === 'active' && !confirm('Are you sure you want to reset the game?')) {
      return;
    }
    appState.gameMode = event.target.value;
    resetBoard();
  });

  document.getElementById('ai-difficulty').addEventListener('change', event => {
    appState.aiDifficulty = event.target.value;
  });

  document.getElementById('ai-plays-as').addEventListener('change', event => {
    appState.aiPlaysAs = event.target.value;
  });

  document.getElementById('clear-score').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the scores?')) {
      t3GameEngine.resetScores();
      updateScoresDisplay();
    }
  });

  document.getElementById('reset-board').addEventListener('click', () => {
    if (appState.gameStatus === 'active' && !confirm('Are you sure you want to reset the game?')) {
      return;
    }
    resetBoard();
  });

  document.getElementById('undo').addEventListener('click', () => {
    t3GameEngine.undoMove();
  });

  document.getElementById('redo').addEventListener('click', () => {
    t3GameEngine.redoMove();
  });

  updateMatchSizeOptions(t3GameEngine.config.boardSize);
}

function updateMatchSizeOptions(boardSize) {
  const matchSizeSelect = document.getElementById('match-size');
  const options = matchSizeSelect.querySelectorAll('option');
  let firstEnabledOption = null;
  let currentSelectedOption = null;

  options.forEach(option => {
    const optionValue = parseInt(option.value);
    const validation = t3GameEngine.validateBoardAndMatchSize(boardSize, optionValue);
    const isOptionEnabled = validation.ok;
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
