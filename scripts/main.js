import { appState } from './appContext.js';
import { initializeControls, initializeGame } from './gameController.js';

Object.assign(appState, {
  gameMode: document.getElementById('game-mode').value, // 'single', 'two'
  aiDifficulty: document.getElementById('ai-difficulty').value, // 'dumb', 'easy', 'normal', 'hard', 'impossible'
  aiPlaysAs: document.getElementById('ai-plays-as').value, // 'x', 'o'
  gameStatus: 'initial', // 'initial', 'progressing', 'gameOver'
});

initializeGame();
initializeControls();
