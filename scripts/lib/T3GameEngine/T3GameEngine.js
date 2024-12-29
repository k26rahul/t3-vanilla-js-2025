import { checkWin } from './utils.js';

export default class T3GameEngine {
  constructor(config = {}) {
    this.initializeConfig(config);
    this.state = {};
    this.moveUndoStack = [];
    this.moveRedoStack = [];
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
    this.moveUndoStack = [];
    this.moveRedoStack = [];
  }

  resetScores(scores = { x: 0, o: 0, draw: 0 }) {
    this.state.scores = { ...scores };
  }

  makeMove(index) {
    if (!this.isMoveAvailable(index)) return null;
    this.moveUndoStack.push({ index, player: this.state.currentPlayer });
    this.state.board[index] = this.state.currentPlayer;
    this.moveRedoStack = [];
    this.handleMoveOutcome();
    return this.state;
  }

  undoMove() {
    if (this.moveUndoStack.length === 0) return null;
    const lastMove = this.moveUndoStack.pop();
    this.moveRedoStack.push(lastMove);
    this.state.board[lastMove.index] = null;
    this.state.currentPlayer = lastMove.player;
    this.state.isGameOver = false;
    this.state.winner = null;
    this.state.winningCombination = null;
    return lastMove;
  }

  redoMove() {
    if (this.moveRedoStack.length === 0) return null;
    const lastMove = this.moveRedoStack.pop();
    this.moveUndoStack.push(lastMove);
    this.state.board[lastMove.index] = lastMove.player;
    this.state.currentPlayer = lastMove.player;
    this.handleMoveOutcome();
    return lastMove;
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
      moveUndoStack: this.moveUndoStack,
      moveRedoStack: this.moveRedoStack,
    });
  }

  restore(serializedData) {
    const data = JSON.parse(serializedData);
    this.config = data.config;
    this.state = data.state;
    this.moveUndoStack = data.moveUndoStack;
    this.moveRedoStack = data.moveRedoStack;
  }
}
