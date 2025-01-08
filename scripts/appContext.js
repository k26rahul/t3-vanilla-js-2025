const GameMode = {
  SINGLE_PLAYER: 'SINGLE_PLAYER',
  TWO_PLAYER: 'TWO_PLAYER',
};

const AiDifficulty = {
  EASY: 'EASY',
  NORMAL: 'NORMAL',
  HARD: 'HARD',
};

let appContext = {
  gameMode: GameMode.SINGLE_PLAYER,
  aiDifficulty: AiDifficulty.NORMAL,
  aiPlaysAs: 'x', // 'x' or 'o'
  engine: null,
};

export { GameMode, AiDifficulty };
export default appContext;
