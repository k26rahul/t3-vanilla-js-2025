import { evaluateWinner, validateBoardAndMatchSize } from './utils.js';

export { validateBoardAndMatchSize, GameStatus };

const GameStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export default class T3GameEngine {
  constructor(config = {}) {
    this.config = {};
    this.validateAndSetConfig(config);

    this.state = {};
    this.resetState();

    this.scores = {};
    this.resetScores();
  }

  validateAndSetConfig(newConfig) {
    newConfig = { ...this.config, ...newConfig };
    const boardSize = newConfig.boardSize ?? 3;
    const matchSize = newConfig.matchSize ?? (boardSize >= 4 ? 4 : 3);
    const { ok, message } = validateBoardAndMatchSize(boardSize, matchSize);
    if (!ok) throw new Error(message);
    Object.assign(this.config, {
      boardSize,
      matchSize,
    });
  }

  updateConfigAndResetState(newConfig) {
    this.validateAndSetConfig(newConfig);
    this.resetState();
  }

  resetState() {
    Object.assign(this.state, {
      board: Array(this.config.boardSize * this.config.boardSize).fill(null),
      currentPlayer: 'x',
      winner: null,
      winningPattern: null,
      gameStatus: GameStatus.NOT_STARTED,
      moveUndoStack: [],
      moveRedoStack: [],
      get isGameOver() {
        return this.gameStatus === GameStatus.COMPLETED;
      },
    });
  }

  resetScores() {
    Object.assign(this.scores, {
      x: 0,
      o: 0,
      draw: 0,
    });
  }

  makeAiMove() {
    const aiIndex = this.getAiMove();
    if (aiIndex === null) return null;
    return this.makeMove(aiIndex);
  }

  getAiMove() {
    const availableMoves = this.getAvailableMoves();
    if (availableMoves.length === 0) return null;
    return availableMoves[0];
  }

  makeMove(index) {
    if (!this.isMoveAvailable(index)) return null;
    this.state.gameStatus = GameStatus.IN_PROGRESS;

    const lastMove = { index, player: this.state.currentPlayer };
    this.state.moveUndoStack.push(lastMove);
    this.state.moveRedoStack = [];

    this.state.board[index] = this.state.currentPlayer;
    this.evaluateMoveOutcome();
    return lastMove;
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
    this.undoGameOverIfNeeded();
    return lastMove;
  }

  undoGameOverIfNeeded() {
    if (this.state.gameStatus !== GameStatus.COMPLETED) return;
    const scoreKey = this.state.winner ? this.state.winner : 'draw';
    if (this.scores[scoreKey] > 0) this.scores[scoreKey] -= 1;
    this.state.winner = null;
    this.state.winningPattern = null;
    this.state.gameStatus = GameStatus.IN_PROGRESS;
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
    this.state.gameStatus = GameStatus.COMPLETED;
  }

  setDrawState() {
    this.state.gameStatus = GameStatus.COMPLETED;
  }

  switchPlayer() {
    this.state.currentPlayer = this.state.currentPlayer === 'x' ? 'o' : 'x';
  }

  isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  isMoveAvailable(index) {
    return !this.state.isGameOver && this.state.board[index] === null;
  }

  getAvailableMoves() {
    return this.state.board.reduce((acc, cell, idx) => {
      if (cell === null) acc.push(idx);
      return acc;
    }, []);
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
}
