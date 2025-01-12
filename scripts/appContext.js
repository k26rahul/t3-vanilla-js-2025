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
  boardSize: 3,
  matchSize: 3,
  t3GameEngine: null,
  scores: {
    x: 0,
    o: 0,
    draw: 0,
  },
  gameMode: GameMode.SINGLE_PLAYER,
  aiDifficulty: AiDifficulty.NORMAL,
  aiPlaysAs: 'x', // 'x' or 'o'
};

export { GameMode, AiDifficulty };
export default appContext;
