import { checkWin } from './utils.js';

export default class T3GameEngine {
  constructor(config = {}) {
    this.initializeConfig(config);
    this.state = {};
    this.stateUndoStack = [];
    this.stateRedoStack = [];
    this.resetState();
    this.resetScores();
  }

  initializeConfig(config) {
    this.config = {
      boardSize: config.boardSize ?? 3,
      matchSize: config.matchSize ?? (config.boardSize >= 4 ? 4 : 3),
    };
    const { ok, message } = this.validateBoardAndMatchSize(
      this.config.boardSize,
      this.config.matchSize
    );
    if (!ok) {
      throw new Error(message);
    }
  }

  resetState() {
    Object.assign(this.state, {
      board: Array(this.config.boardSize * this.config.boardSize).fill(null),
      currentPlayer: 'x',
      winner: null,
      winningCombination: null,
      isGameOver: false,
    });
    this.stateUndoStack = [];
    this.stateRedoStack = [];
  }

  resetScores(scores = { x: 0, o: 0, draw: 0 }) {
    this.state.scores = { ...scores };
  }

  makeMove(index) {
    if (!this.isMoveAvailable(index)) return null;
    this.stateUndoStack.push(structuredClone(this.state));
    this.state.board[index] = this.state.currentPlayer;
    this.stateRedoStack = [];
    this.handleMoveOutcome();
    return this.state;
  }

  undoMove() {
    if (this.stateUndoStack.length === 0) return null;
    this.stateRedoStack.push(structuredClone(this.state));
    this.state = this.stateUndoStack.pop();
    return this.state;
  }

  redoMove() {
    if (this.stateRedoStack.length === 0) return null;
    this.stateUndoStack.push(structuredClone(this.state));
    this.state = this.stateRedoStack.pop();
    return this.state;
  }

  handleMoveOutcome() {
    const winnerResult = checkWin(this.state.board, this.config.boardSize, this.config.matchSize);
    if (winnerResult) this.applyWinnerState(winnerResult);
    else if (this.isBoardFull(this.state.board)) this.applyDrawState();
    else this.switchPlayer();
  }

  applyWinnerState(winnerResult) {
    this.state.winner = winnerResult.winner;
    this.state.winningCombination = winnerResult.winningCombination;
    this.state.isGameOver = true;
    this.state.scores[this.state.winner]++;
  }

  applyDrawState() {
    this.state.isGameOver = true;
    this.state.scores.draw++;
  }

  switchPlayer() {
    this.state.currentPlayer = this.state.currentPlayer === 'x' ? 'o' : 'x';
  }

  isMoveAvailable(index) {
    if (index < 0 || index >= this.state.board.length) {
      throw new Error(`Index ${index} is out of bounds for board size ${this.config.boardSize}`);
    }
    return !this.state.isGameOver && this.state.board[index] === null;
  }

  isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  updateBoardAndMatchSize(newBoardSize, newMatchSize) {
    const validation = this.validateBoardAndMatchSize(newBoardSize, newMatchSize);
    if (!validation.ok) {
      throw new Error(validation.message);
    }
    this.config.boardSize = newBoardSize;
    this.config.matchSize = newMatchSize;
    this.resetState();
  }

  validateBoardAndMatchSize(boardSize, matchSize) {
    if (boardSize < 3 || matchSize < 3) {
      return { ok: false, message: 'Board size and match size must be at least 3.' };
    }
    if (matchSize > boardSize) {
      return { ok: false, message: 'Match size cannot be greater than board size.' };
    }
    if (boardSize >= 4 && matchSize < 4) {
      return {
        ok: false,
        message: 'For a board size of 4 or more, the match size must be at least 4.',
      };
    }
    return { ok: true, message: '' };
  }

  serialize() {
    return JSON.stringify({
      config: this.config,
      state: this.state,
      stateUndoStack: this.stateUndoStack,
      stateRedoStack: this.stateRedoStack,
    });
  }

  restore(serializedData) {
    const data = JSON.parse(serializedData);
    this.config = data.config;
    this.state = data.state;
    this.stateUndoStack = data.stateUndoStack;
    this.stateRedoStack = data.stateRedoStack;
  }
}
