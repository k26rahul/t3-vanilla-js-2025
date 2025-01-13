import { evaluateWinner, validateBoardAndMatchSize } from './utils.js';

export { validateBoardAndMatchSize };

const GameStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export default class T3GameEngine {
  constructor(config = {}) {
    this.validateAndSetConfig(config);
    this.state = {};
    this.scores = { x: 0, o: 0, draw: 0 };
    this.resetState();
  }

  validateAndSetConfig(config) {
    const newConfig = {
      boardSize: config.boardSize ?? 3,
      matchSize: config.matchSize ?? (config.boardSize >= 4 ? 4 : 3),
    };
    const { ok, message } = validateBoardAndMatchSize(newConfig.boardSize, newConfig.matchSize);
    if (!ok) {
      throw new Error(message);
    }
    this.config = newConfig;
  }

  updateConfigAndResetState(newConfig) {
    const updatedConfig = {
      ...this.config,
      ...newConfig,
    };
    this.validateAndSetConfig(updatedConfig);
    this.resetState();
  }

  resetState() {
    Object.assign(this.state, {
      board: Array(this.config.boardSize * this.config.boardSize).fill(null),
      currentPlayer: 'x',
      winner: null,
      winningPattern: null,
      isGameOver: false,
      gameStatus: GameStatus.NOT_STARTED,
      moveUndoStack: [],
      moveRedoStack: [],
    });
  }

  makeMove(index) {
    if (!this.isMoveAvailable(index)) return null;

    this.state.gameStatus = GameStatus.IN_PROGRESS;
    this.state.moveUndoStack.push({ index, player: this.state.currentPlayer });
    this.state.moveRedoStack = [];

    this.state.board[index] = this.state.currentPlayer;
    this.evaluateMoveOutcome();
    return this.state;
  }

  redoMove() {
    if (this.state.moveRedoStack.length === 0) return null;

    const lastMove = this.state.moveRedoStack.pop();
    this.state.moveUndoStack.push(lastMove);

    this.state.board[lastMove.index] = lastMove.player;
    this.evaluateMoveOutcome();
    return lastMove;
  }

  undoMove() {
    if (this.state.moveUndoStack.length === 0) return null;

    const lastMove = this.state.moveUndoStack.pop();
    this.state.moveRedoStack.push(lastMove);

    this.state.board[lastMove.index] = null;
    this.state.currentPlayer = lastMove.player;

    if (this.state.gameStatus === GameStatus.COMPLETED) {
      if (this.state.winner) {
        // decrement scores only if they are above zero when undoing a final move (cause resetScores)
        if (this.scores[this.state.winner] > 0) {
          this.scores[this.state.winner] -= 1;
        }
      } else {
        if (this.scores.draw > 0) {
          this.scores.draw -= 1;
        }
      }
    }

    this.state.isGameOver = false;
    this.state.winner = null;
    this.state.winningPattern = null;

    this.state.gameStatus = GameStatus.IN_PROGRESS;
    return lastMove;
  }

  evaluateMoveOutcome() {
    const winnerResult = evaluateWinner(
      this.state.board,
      this.config.boardSize,
      this.config.matchSize
    );
    if (winnerResult) {
      this.setWinnerState(winnerResult);
      this.scores[winnerResult.winner] += 1;
    } else if (this.isBoardFull(this.state.board)) {
      this.setDrawState();
      this.scores.draw += 1;
    } else {
      this.switchPlayer();
    }
  }

  setWinnerState(winnerResult) {
    this.state.winner = winnerResult.winner;
    this.state.winningPattern = winnerResult.winningPattern;
    this.setGameOverState();
  }

  setDrawState() {
    this.setGameOverState();
  }

  setGameOverState() {
    this.state.isGameOver = true;
    this.state.gameStatus = GameStatus.COMPLETED;
  }

  switchPlayer() {
    this.state.currentPlayer = this.state.currentPlayer === 'x' ? 'o' : 'x';
  }

  isMoveAvailable(index) {
    return !this.state.isGameOver && this.state.board[index] === null;
  }

  isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  serialize() {
    return JSON.stringify({
      config: this.config,
      state: this.state,
      scores: this.scores,
    });
  }

  restore(serializedData) {
    const data = JSON.parse(serializedData);
    this.config = data.config;
    this.state = data.state;
    this.scores = data.scores;
  }

  resetScores(newScores = { x: 0, o: 0, draw: 0 }) {
    this.scores = { ...newScores };
  }
}
