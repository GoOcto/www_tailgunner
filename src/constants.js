const HIGH_SCORE_KEY = "tailgunner.highScore";
const storedHighScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;

export const gameState = { ships: 0, score: 0, energy: 80, mode: "demo", highScore: storedHighScore, lastScore: 0 };
export const beamColor = '#88dddd';
export const beamWidth = 1.2;

// Optional debug/visual effect: draw all strokes at 0.5 opacity and re-draw every vertex on
// top as a solid dot at opacity 1. Flip this to true to enable it.
export const VERTEX_HIGHLIGHT_EFFECT = true;
export const VERTEX_HIGHLIGHT_OPACITY = 0.75;


export function saveHighScore() {
	localStorage.setItem(HIGH_SCORE_KEY, String(gameState.highScore));
}