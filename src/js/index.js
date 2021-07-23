import {Universe, Cell} from "wasm-internals";
import {memory} from "wasm-internals/wasm_game_of_life_bg.wasm";

import FPS from "./src/fps";

const constants = {
    cell: {
        size: 5
    },
    color: {
        grid: "#CCCCCC",
        dead: "#FFFFFF",
        alive: "#000000"
    }
};

let universe = Universe.new();
let width = universe.width();
let height = universe.height();

let canvas = document.getElementById("game-canvas");
let playPause = document.getElementById("play-pause");

canvas.width = (constants.cell.size + 1) * width + 1;
canvas.height = (constants.cell.size + 1) * height + 1;

let ctx = canvas.getContext("2d");

let fps = new FPS("fps");
let animationId = null;

const renderLoop = () => {
    fps.render();

    drawGrid();
    drawCells();

    for(let i = 0; i < 9; i++) {
        universe.tick();
    }

    animationId = requestAnimationFrame(renderLoop);
}

const isPaused = () => {
    return animationId === null;
}

const play = () => {
    playPause.textContent = "||";
    renderLoop();
}

const pause = () => {
    playPause.textContent = ">";
    cancelAnimationFrame(animationId);
    animationId = null;
}

playPause.addEventListener("click", (e) => {
    if(isPaused()) play();
    else pause();
});

const drawGrid = () => {
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

const getIndex = (row, column) => {
    return row * width + column;
}

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

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

play();