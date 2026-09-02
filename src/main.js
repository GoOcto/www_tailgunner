import paper from 'paper';
import { AnimationController } from './AnimationController.js';

const FIXED_W = 960, FIXED_H = 720;
const canvas = document.getElementById('gameCanvas');
canvas.width = FIXED_W;
canvas.height = FIXED_H;
paper.setup(canvas);
paper.view.viewSize = new paper.Size(FIXED_W, FIXED_H);
canvas.style.width = '';
canvas.style.height = '';

const controller = new AnimationController(canvas);
const keysDown = new Set();
window.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        keysDown.add('Space');
        controller.net.show();
    }
});
window.addEventListener('keyup', e => {
    if (e.code === 'Space') {
        keysDown.delete('Space');
        controller.net.hide();
    }
});
window.addEventListener('blur', () => {
    keysDown.clear();
    controller.net.hide();
});
paper.view.onFrame = event => controller.onFrame(event);
paper.view.onResize = () => controller.onResize();
