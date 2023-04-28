/* Beállítások */
const CELLS_X = 8
const CELLS_Y = 8
const CELLS_BORDER_PX = 2
const FRAMERATE = 30  // lehet később event alapú update, idk.
const BGSTYLE = "#4c096c"
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

canv.addEventListener("click", canvClickHandler)

function canvClickHandler(e) {
    /// négyzet koordináta kiszámolása
    // igazítás grid pozícióhoz
    let x = e.clientX - canvX - gridX
    let y = e.clientY - canvY - gridY
    console.debug(`click ${x} ${y}`)
    let mezoX = Math.floor(x / cellWidth)
    let mezoY = Math.floor(y / cellHeight)
    console.debug(`mezo ${mezoX} ${mezoY}`)
}

function drawBG() {
    ctx.beginPath()
    ctx.fillStyle = BGSTYLE
    ctx.fillRect(-10, -10, canvW + 10, canvH + 10)
    ctx.closePath()
}

function drawGrid() {
    ctx.strokeStyle = "rgb(128, 128, 128)"
    ctx.lineWidth = CELLS_BORDER_PX
    ctx.beginPath()
    ctx.strokeRect(gridX, gridY, cellWidth, cellHeight)
    ctx.closePath()
}

function loop() {
    drawBG()
    drawGrid()
}

setInterval(loop, 1000 / FRAMERATE)