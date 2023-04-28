/* Beállítások */
const CELLS_X = 8
const CELLS_Y = 8
const CELLS_BORDER_PX = 2
const FRAMERATE = 30  // lehet később event alapú update, idk.
const BGSTYLE = "#4c096c"
/* Beállítások vége */

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