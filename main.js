/* Beállítások */
const CELLS_X = 8
const CELLS_Y = 8
const CELLS_BORDER_PX = 1
const CELLS_BORDER_SELECTED_PX = 2.5
const FRAMERATE = 30  // lehet később event alapú update, idk.
const CELLS_BG_STYLE = "#4c096c"
const CELL_SELECTED_STYLE = "#e1d866"
const CELL_VALID_STYLE = "#e7e1b3"
/* Beállítások vége */

// canvas-ban ,5 pixelre kéne rajzolni, hogy egész pixelre essenek a dolgok

let canv = document.getElementById("canvas1")
let ctx = canv.getContext("2d")

let canvW = canv.getBoundingClientRect().width
let canvH = canv.getBoundingClientRect().height
let canvX = canv.getBoundingClientRect().x
let canvY = canv.getBoundingClientRect().y

let cellWidth = Math.min(canvW, canvH) / CELLS_X
let cellHeight = Math.min(canvW, canvH) / CELLS_Y

let gridX = (canvW / 2) - (cellWidth * CELLS_X / 2)
let gridY = (canvH / 2) - (cellHeight * CELLS_Y / 2)

// 2D mezőtömb kőizék tárolására
let cells = new Array(CELLS_X);
for (let i = 0; i < cells.length; i++) cells[i] = new Array(CELLS_Y);

canv.addEventListener("click", canvClickHandler)

function canvClickHandler(e) {
    /// négyzet koordináta kiszámolása
    // igazítás grid pozícióhoz
    let x = e.clientX - canvX - gridX
    let y = e.clientY - canvY - gridY
    //console.debug(`click ${x} ${y}`)
    // osztás
    let mezoX = Math.floor(x / cellWidth)
    let mezoY = Math.floor(y / cellHeight)
    //console.debug(`mezo ${mezoX} ${mezoY}`)
    interactWithCell(mezoX, mezoY)
}

/**
 * Kiválasztott mező
 * @type {null|Position}
 */
let selectedCell = null;

/**
 * Mezővel való interakció kezelése (kijelölés, csere stb.)
 * @param x Mező oszlop 0-base
 * @param y Mező sor 0-base
 */
function interactWithCell(x, y) {
    if (selectedCell === null) {
        selectedCell = new Position(x, y)
        return
    }
    if (!(selectedCell instanceof Position)) {
        selectedCell = null
        return
    }
    // ha egymás mellett van, swap.
    if (selectedCell.x !== x && Math.abs(selectedCell.x - x) <= 1 && selectedCell.y === y ||
        selectedCell.y !== y && Math.abs(selectedCell.y - y) <= 1 && selectedCell.x === x) {
        swapCells(selectedCell, new Position(x, y))
    }
    // mindig null, mert ha messze katt, akkor "cancel"-ként kezeljük
    selectedCell = null
}

/**
 *
 * @param a
 * @param b
 */
function swapCells(a, b) {
    // TODO
}

function drawBG() {
    ctx.beginPath()
    ctx.fillStyle = CELLS_BG_STYLE
    ctx.fillRect(-10, -10, canvW + 10, canvH + 10)
    ctx.closePath()
}

function drawGrid() {
    ctx.strokeStyle = "rgb(128, 128, 128)"
    ctx.lineWidth = CELLS_BORDER_PX
    for (let i = 0; i < CELLS_X; i++) {
        for (let j = 0; j < CELLS_Y; j++) {
            ctx.beginPath()
            ctx.strokeRect(gridX + i * cellWidth, gridY + j * cellHeight, cellWidth, cellHeight)
            ctx.closePath()
        }
    }
}

function drawSelection() {
    if (!(selectedCell instanceof Position)) {
        return
    }

    // valid mezők
    ctx.strokeStyle = CELL_VALID_STYLE
    for (let i = selectedCell.x - 1; i <= selectedCell.x + 1; i += 2) {
        ctx.beginPath()
        ctx.strokeRect(i * cellWidth,
            selectedCell.y * cellHeight,
            cellWidth,
            cellHeight)
        ctx.closePath()
    }
    for (let i = selectedCell.y - 1; i <= selectedCell.y + 1; i += 2) {
        ctx.beginPath()
        ctx.strokeRect(selectedCell.x * cellWidth,
            i * cellHeight,
            cellWidth,
            cellHeight)
        ctx.closePath()
    }

    // selected mező
    ctx.strokeStyle = CELL_SELECTED_STYLE
    ctx.lineWidth = CELLS_BORDER_SELECTED_PX
    ctx.beginPath()
    ctx.strokeRect(selectedCell.x * cellWidth,
        selectedCell.y * cellHeight,
        cellWidth,
        cellHeight)
    ctx.closePath()
}

function loop() {
    drawBG()
    drawGrid()  // lehet nemkell, még idk.
    if (selectedCell !== null) drawSelection()
}

let theInterval = null

function startLoop() {
    theInterval = setInterval(() => {
        window.requestAnimationFrame(loop)
    }, 1000 / FRAMERATE)
}

startLoop()
