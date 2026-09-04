import paper from "paper";
import { beamColor, beamWidth, VERTEX_HIGHLIGHT_EFFECT, VERTEX_HIGHLIGHT_OPACITY } from "./constants.js";

const DOT_RADIUS = beamWidth/2;

// Applies the optional stroke styling: when the effect is on, strokes are drawn at half
// opacity so the vertex dots (opacity 1) stand out on top of them. No-op when disabled.
export function styleStroke(path, opacity = 1) {
	path.opacity = VERTEX_HIGHLIGHT_EFFECT ? opacity * VERTEX_HIGHLIGHT_OPACITY : opacity;
}

// Creates one filled dot per point (opacity 1) and adds them to the given group. Returns an
// array of the created dot items (empty array when the effect is disabled), so callers can
// reposition/hide/fade them alongside the strokes they highlight.
export function addVertexDots(group, points) {
	if (!VERTEX_HIGHLIGHT_EFFECT) return [];
	return points.map((point) => {
		const dot = new paper.Path.Circle({ center: point, radius: DOT_RADIUS, fillColor: beamColor });
		group.addChild(dot);
		return dot;
	});
}

// Repositions previously created dots to new points (only meaningful when the effect is on).
export function updateVertexDots(dots, points) {
	if (!VERTEX_HIGHLIGHT_EFFECT) return;
	dots.forEach((dot, i) => {
		if (points[i]) dot.position = points[i];
	});
}

// Sets visibility on previously created dots (only meaningful when the effect is on).
export function setVertexDotsVisible(dots, visible) {
	if (!VERTEX_HIGHLIGHT_EFFECT) return;
	dots.forEach((dot) => (dot.visible = visible));
}

// Sets opacity on previously created dots (only meaningful when the effect is on).
export function setVertexDotsOpacity(dots, opacity) {
	if (!VERTEX_HIGHLIGHT_EFFECT) return;
	dots.forEach((dot) => (dot.opacity = opacity));
}
