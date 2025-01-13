import appContext from '../appContext.js';
import { applyAndRemoveAnimationClasses } from '../utils.js';
import T3GameEngine, { validateBoardAndMatchSize } from '../lib/T3GameEngine/T3GameEngine.js';

export { initializeGame, initializeGameControls };

const $t3Grid = document.querySelector('.t3-grid');
const $statusDisplay = document.querySelector('.status-display');
const $scoreX = document.querySelector('.score-value[data-score-x]');
const $scoreO = document.querySelector('.score-value[data-score-o]');
const $scoreDraw = document.querySelector('.score-value[data-score-draw]');

const $buttonClearScore = document.getElementById('clear-score');
const $buttonResetBoard = document.getElementById('reset-board');
const $buttonUndo = document.getElementById('undo');
const $buttonRedo = document.getElementById('redo');

const $selectBoardSize = document.getElementById('board-size');
const $selectMatchSize = document.getElementById('match-size');
const $selectGameMode = document.getElementById('game-mode');
const $selectAiDifficulty = document.getElementById('ai-difficulty');
const $selectAiPlaysAs = document.getElementById('ai-plays-as');

let t3GameEngine = null;

function initializeGame() {
  appContext.t3GameEngine = new T3GameEngine();
  t3GameEngine = appContext.t3GameEngine;
  window.t3GameEngine = t3GameEngine;
  startNewGame();
}

function startNewGame() {
  t3GameEngine.resetState();
  updateStatusDisplay();
  buildBoard();
}

function buildBoard() {
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

  document.querySelectorAll('.t3-cell').forEach((cell, index) => {
    cell.addEventListener('click', () => makeMove(index, cell));
  });
}

function makeMove(index, cell) {
  if (!t3GameEngine.isMoveAvailable(index)) {
    if (t3GameEngine.state.isGameOver) {
      startNewGame();
    }
    return;
  }
  const currentPlayer = t3GameEngine.state.currentPlayer;
  t3GameEngine.makeMove(index);
  fillCell(cell, currentPlayer);
  updateStatusDisplay();
  handleGameOver();
}

function redoMove() {
  const lastMove = t3GameEngine.redoMove();
  if (lastMove) {
    const cell = document.querySelector(`.t3-cell[data-cell="${lastMove.index}"]`);
    fillCell(cell, lastMove.player);
    updateStatusDisplay();
    handleGameOver();
  }
}

function undoMove() {
  const wasGameOver = t3GameEngine.state.isGameOver;
  const lastMove = t3GameEngine.undoMove();
  if (lastMove) {
    const cell = document.querySelector(`.t3-cell[data-cell="${lastMove.index}"]`);
    unfillCell(cell);
    updateStatusDisplay();
    handleUndoGameOver();
    if (wasGameOver) updateScoresDisplay();
  }
}

function fillCell(cell, player) {
  cell.classList.add('filled');
  const span = cell.querySelector('span');
  span.textContent = getPlayerSymbol(player);
  applyAndRemoveAnimationClasses(span, ['animated', 'bounceIn']);
}

function unfillCell(cell) {
  const span = cell.querySelector('span');
  applyAndRemoveAnimationClasses(span, ['animated', 'bounceOut'], () => {
    cell.classList.remove('filled');
    span.textContent = '';
  });
}

function handleGameOver() {
  const { isGameOver, winner, winningPattern } = t3GameEngine.state;
  if (isGameOver) {
    if (winner) {
      winningPattern.forEach(index => {
        const cell = document.querySelector(`.t3-cell[data-cell="${index}"]`);
        cell.classList.add('winning');

        const span = cell.querySelector('span');
        applyAndRemoveAnimationClasses(span, ['animated', 'bounceIn']);
      });
    }
    updateScoresDisplay();
    $t3Grid.classList.add('game-over');
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
  }
}

function updateStatusDisplay() {
  const state = t3GameEngine.state;
  if (state.isGameOver) {
    $statusDisplay.textContent = state.winner
      ? `${getPlayerSymbol(state.winner)} Wins!`
      : "It's a Draw!";
  } else {
    $statusDisplay.textContent = `${getPlayerSymbol(state.currentPlayer)}'s Turn`;
  }
}

function updateScoresDisplay() {
  $scoreX.textContent = t3GameEngine.scores.x || '_';
  $scoreO.textContent = t3GameEngine.scores.o || '_';
  $scoreDraw.textContent = t3GameEngine.scores.draw || '_';
}

function getPlayerSymbol(player) {
  return player === 'x' ? '✖️' : '⭕';
}

function initializeGameControls() {
  updateMatchSizeOptionsAndConfigureEngine(t3GameEngine.config.boardSize);

  $buttonClearScore.addEventListener('click', () => clearScore());
  $buttonResetBoard.addEventListener('click', () => resetBoard());
  $buttonUndo.addEventListener('click', () => undoMove());
  $buttonRedo.addEventListener('click', () => redoMove());

  $selectBoardSize.addEventListener('change', event =>
    changeBoardSize(parseInt(event.target.value))
  );
  $selectMatchSize.addEventListener('change', event =>
    changeMatchSize(parseInt(event.target.value))
  );

  $selectGameMode.addEventListener('change', event => changeGameMode(event.target.value));
  $selectAiDifficulty.addEventListener('change', event => changeAiDifficulty(event.target.value));
  $selectAiPlaysAs.addEventListener('change', event => changeAiPlaysAs(event.target.value));
}

function confirmResetGame() {
  return (
    t3GameEngine.state.gameStatus === 'IN_PROGRESS' &&
    !confirm('Are you sure you want to reset the game?')
  );
}

function clearScore() {
  if (confirm('Are you sure you want to reset the scores?')) {
    t3GameEngine.resetScores();
    updateScoresDisplay();
  }
}

function resetBoard() {
  if (confirmResetGame()) {
    return;
  }
  startNewGame();
}

function changeBoardSize(boardSize) {
  if (confirmResetGame()) {
    return;
  }
  updateMatchSizeOptionsAndConfigureEngine(boardSize);
  startNewGame();
}

function changeMatchSize(matchSize) {
  if (confirmResetGame()) {
    return;
  }
  t3GameEngine.updateConfigAndResetState({ matchSize });
  startNewGame();
}

function changeGameMode(gameMode) {
  if (confirmResetGame()) {
    return;
  }
  appState.gameMode = gameMode;
  startNewGame();
}

function changeAiDifficulty(difficulty) {
  appState.aiDifficulty = difficulty;
}

function changeAiPlaysAs(playsAs) {
  appState.aiPlaysAs = playsAs;
}

function updateMatchSizeOptionsAndConfigureEngine(boardSize) {
  const options = $selectMatchSize.querySelectorAll('option');
  let matchSize = null;
  let firstEnabledOption = null;
  let currentSelectedOption = null;

  options.forEach(option => {
    const optionValue = parseInt(option.value);
    const { ok: isOptionEnabled } = validateBoardAndMatchSize(boardSize, optionValue);
    option.disabled = !isOptionEnabled;
    option.textContent = isOptionEnabled ? optionValue : `${optionValue} (not available)`;
    if (isOptionEnabled && !firstEnabledOption) firstEnabledOption = option;
    if (option.selected) currentSelectedOption = option;
  });

  if (currentSelectedOption.disabled) {
    firstEnabledOption.selected = true;
    matchSize = parseInt(firstEnabledOption.value);
  } else {
    matchSize = parseInt(currentSelectedOption.value);
  }

  t3GameEngine.updateConfigAndResetState({
    boardSize,
    matchSize: matchSize,
  });
}
