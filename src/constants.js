const HIGH_SCORE_KEY = "tailgunner.highScore";
const storedHighScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;

export const gameState = { ships: 0, score: 0, energy: 80, mode: "demo", highScore: storedHighScore, lastScore: 0 };
export const beamColor = '#88dddd';
export const beamWidth = 1.2;

export function saveHighScore() {
	localStorage.setItem(HIGH_SCORE_KEY, String(gameState.highScore));
}