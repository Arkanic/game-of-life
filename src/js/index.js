import {Universe, Cell} from "wasm-internals";

import FPS from "./src/fps";

const constants = {
    cell: {
        size: 10
    },
    color: {
        grid: "#CCCCCC",
        dead: "#FFFFFF",
        alive: "#000000"
    }
};

let canvas = document.getElementById("game-canvas");
let playPause = document.getElementById("play-pause");
let clearCells = document.getElementById("clear-cells");

canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight;

let universe = Universe.new(Math.floor(canvas.width / constants.cell.size), Math.floor(canvas.height / constants.cell.size));
let width = universe.width();
let height = universe.height();

// disused, using relative size is much better than fixed attempt
//canvas.width = (constants.cell.size + 1) * width + 1;
//canvas.height = (constants.cell.size + 1) * height + 1;
//canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);

let ctx = canvas.getContext("2d");

let fps = new FPS("fps");
let animationId = null;

function renderLoop() {
    fps.render();

    drawGrid();
    drawCells();

    for(let i = 0; i < 9; i++) {
        universe.tick();
    }

    animationId = requestAnimationFrame(renderLoop);
}

function isPaused() {
    return animationId === null;
}

function play() {
    playPause.textContent = "Pause";
    renderLoop();
}

function pause() {
    playPause.textContent = "Play";
    cancelAnimationFrame(animationId);
    animationId = null;
}

playPause.addEventListener("click", (e) => {
    if(isPaused()) play();
    else pause();
});

function drawGrid() {
    ctx.beginPath();
    ctx.strokStyle = constants.color.grid;

    for(let i = 0; i < width; i++) {
        ctx.moveTo(i * (constants.cell.size + 1) + 1, 0);
        ctx.lineTo(i * (constants.cell.size + 1) + 1, (constants.cell.size + 1) * height + 1);
    }

    for(let i = 0; i < height; i++) {
        ctx.moveTo(0, i * (constants.cell.size + 1) + 1);
        ctx.lineTo((constants.cell.size + 1) * width + 1, i * (constants.cell.size + 1) + 1);
    }

    ctx.stroke();
}

function getIndex(row, column) {
    return row * width + column;
}

function drawCells() {
    const cells = universe.cells();

    ctx.beginPath();
    
    for(let row = 0; row < height; row++) {
        for(let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            let render = false;
            if(cells[idx] === Cell.Alive) {
                ctx.fillStyle = constants.color.alive;
                render = true;
            } else if(cells[idx] === Cell.Dead) {
                ctx.fillStyle = constants.color.dead;
                render = true;
            }

            let {size} = constants.cell;

            if(render) {
                ctx.fillRect(
                    col * (size + 1) + 1,
                    row * (size + 1) + 1,
                    size,
                    size
                );
            }
        }
    }

    ctx.stroke();
}

canvas.addEventListener("click", (e) => {
    let boundingArea = canvas.getBoundingClientRect();

    let scaleX = canvas.width / boundingArea.width;
    let scaleY = canvas.height / boundingArea.height;

    let canvasLeft = (e.clientX - boundingArea.left) * scaleX;
    let canvasTop = (e.clientY - boundingArea.top) * scaleY;

    let {size} = constants.cell;

    let row = Math.min(Math.floor(canvasTop / (size + 1)), height - 1);
    let col = Math.min(Math.floor(canvasLeft / (size + 1)), width - 1);

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells();
});

clearCells.addEventListener("click", (e) => {
    universe.clear_cells();
});

play();