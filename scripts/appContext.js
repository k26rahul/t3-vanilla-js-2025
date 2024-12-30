export let t3GameEngine = null;

const GameMode = {
  SINGLE: 'SINGLE',
  TWO: 'TWO',
};

const AiDifficulty = {
  DUMB: 'DUMB',
  EASY: 'EASY',
  NORMAL: 'NORMAL',
  HARD: 'HARD',
  IMPOSSIBLE: 'IMPOSSIBLE',
};

export let appState = {
  gameMode: GameMode.SINGLE,
  aiDifficulty: AiDifficulty.NORMAL,
  aiPlaysAs: 'x', // 'x' or 'o'
};

export function setEngineContext(engine) {
  t3GameEngine = engine;
}
