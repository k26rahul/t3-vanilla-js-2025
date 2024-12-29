import T3GameEngine from './lib/T3GameEngine/T3GameEngine.js';
import { updateGameControllerContext, resetBoard, initializeControls } from './gameController.js';

const t3GameEngine = new T3GameEngine();
const appState = {
  gameMode: document.getElementById('game-mode').value, // 'single', 'two'
  aiDifficulty: document.getElementById('ai-difficulty').value, // 'dumb', 'easy', 'normal', 'hard', 'impossible'
  aiPlaysAs: document.getElementById('ai-plays-as').value, // 'x', 'o'
  gameStatus: 'idle', // 'idle', 'active', 'gameOver'
};

updateGameControllerContext(t3GameEngine, appState);
resetBoard();
initializeControls();
