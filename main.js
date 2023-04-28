/* Beállítások */
const CELLS_X = 8
const CELLS_Y = 8
const CELLS_BORDER_PX = 1
const CELLS_BORDER_SELECTED_PX = 5
const CELLS_BORDER_VALID_PX = 3
const FRAMERATE = 30  // lehet később event alapú update, idk.
const CELLS_BG_STYLE = "#4c096c"
const CELL_SELECTED_STYLE = "#e1d866"
const CELL_VALID_STYLE = "#e7e1b3"
const STONE_SIZE_MULTIPLIER = 0.8
const DESTROY_AMOUNT = 3
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

/**
 *
 * @type {Stone[][]}
 */
let cells = new Array(CELLS_X);
for (let i = 0; i < cells.length; i++) cells[i] = new Array(CELLS_Y);

canv.addEventListener("click", canvClickHandler)

/**
 * Kattintások kezelésének ideiglenes letiltására alkalmas
 * @type {boolean}
 */
let doHandleClickEvents = true

function canvClickHandler(e) {
    if (doHandleClickEvents === false) return
    /// négyzet koordináta kiszámolása
    // igazítás grid pozícióhoz
    let x = e.clientX - canvX - gridX
    let y = e.clientY - canvY - gridY
    //console.debug(`click ${x} ${y}`)
    // osztás
    let mezoX = Math.floor(x / cellWidth)
    let mezoY = Math.floor(y / cellHeight)
    //console.debug(`mezo ${mezoX} ${mezoY}`)
    if (mezoX >= 0 && mezoX < CELLS_X && mezoY >= 0 && mezoY < CELLS_Y)
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
 * @param a Position
 * @param b Position
 */
function swapCells(a, b) {
    let i = 0
    let egyik = true
    let masik = true
    do {
        let temp = cells[a.x][a.y]
        cells[a.x][a.y] = cells[b.x][b.y]
        cells[b.x][b.y] = temp
        i++
        egyik = searchDestroyTarget(a)
        masik = searchDestroyTarget(b)
    } while (i < 2 && !egyik && !masik)
    // ha nincs eredménye, vissza
}

/**
 * A pozíción megnézi, fekszik-e >=DESTROY_AMOUNT csík, kezeli
 * @param a {Position} pos
 * @returns {boolean} true: valami történt; false: semmi nem történt
 */
function searchDestroyTarget(a) {
    let didAThing = false
    let startCell = cells[a.x][a.y]
    if(startCell == null) return false
    /**
     * @type {Position[]}
     */
    let destroyArray = [a]

    /// bal-jobb
    // bal
    for (let x = a.x - 1; x >= 0; x--) {
        if (cells[x][a.y] != null && cells[x][a.y].id === startCell.id) {
            destroyArray.push(new Position(x, a.y))
        } else break
    }
    // jobb
    for (let x = a.x + 1; x < CELLS_X; x++) {
        if (cells[x][a.y] != null && cells[x][a.y].id === startCell.id) {
            destroyArray.push(new Position(x, a.y))
        } else break
    }

    if (destroyArray.length >= DESTROY_AMOUNT) {
        // TODO: animáció
        for (let i = 0; i < destroyArray.length; i++) {
            cells[destroyArray[i].x][destroyArray[i].y] = null
        }
        didAThing = true
    }

    destroyArray = [a]

    /// fel-le
    // fel
    for (let y = a.y - 1; y >= 0; y--) {
        if (cells[a.x][y] != null && cells[a.x][y].id === startCell.id) {
            destroyArray.push(new Position(a.x, y))
        } else break
    }
    // le
    for (let y = a.y + 1; y < CELLS_Y; y++) {
        if (cells[a.x][y] != null && cells[a.x][y].id === startCell.id) {
            destroyArray.push(new Position(a.x, y))
        } else break
    }

    if (destroyArray.length >= DESTROY_AMOUNT) {
        // TODO: animáció
        for (let i = 0; i < destroyArray.length; i++) {
            cells[destroyArray[i].x][destroyArray[i].y] = null
        }
        didAThing = true
    }
    return didAThing
}

/**
 * Megkeres és kezel minden >=DESTROY_AMOUNT csík kupacot
 * @returns {boolean} true: valami történt; false: semmi nem történt
 */
function searchDestroyAll() {
    let found = false
    // keres
    for (let x = 0; x < CELLS_X; x++) {
        for (let y = 0; y < CELLS_Y; y++) {
            if (cells[x][y] instanceof Stone)
                if (searchDestroyTarget(new Position(x, y)))
                    found = true
        }
    }
    return found
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
    ctx.lineWidth = CELLS_BORDER_VALID_PX
    for (let i = selectedCell.x - 1; i <= selectedCell.x + 1; i += 2) {
        if (i < 0 || i >= CELLS_X) continue
        ctx.beginPath()
        ctx.strokeRect(
            gridX + i * cellWidth,
            gridY + selectedCell.y * cellHeight,
            cellWidth,
            cellHeight)
        ctx.closePath()
    }
    for (let i = selectedCell.y - 1; i <= selectedCell.y + 1; i += 2) {
        if (i < 0 || i >= CELLS_Y) continue
        ctx.beginPath()
        ctx.strokeRect(
            gridX + selectedCell.x * cellWidth,
            gridY + i * cellHeight,
            cellWidth,
            cellHeight)
        ctx.closePath()
    }

    // selected mező
    ctx.strokeStyle = CELL_SELECTED_STYLE
    ctx.lineWidth = CELLS_BORDER_SELECTED_PX
    ctx.beginPath()
    ctx.strokeRect(
        gridX + selectedCell.x * cellWidth,
        gridY + selectedCell.y * cellHeight,
        cellWidth,
        cellHeight)
    ctx.closePath()
}

function drawStones() {
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            if (!(cells[i][j] instanceof Stone)) continue
            ctx.beginPath()
            ctx.drawImage(cells[i][j].image,
                gridX + i * cellWidth + (cellWidth * (1 - STONE_SIZE_MULTIPLIER) / 2),
                gridY + j * cellHeight + (cellHeight * (1 - STONE_SIZE_MULTIPLIER) / 2),
                cellWidth * STONE_SIZE_MULTIPLIER,
                cellHeight * STONE_SIZE_MULTIPLIER
            )
            ctx.closePath()
        }
    }
}

/**
 * true ha épp fut egy loop, hátha túl lassú a gép h
 * @type {boolean}
 */
let loopInProgress = false

/**
 * fő game loop funkció, meghív egyéb részfolyamatokat
 */
function loop() {
    if (loopInProgress === true) return
    loopInProgress = true
    drawBG()
    drawGrid()  // lehet nemkell, még idk.
    drawStones()
    if (selectedCell !== null) drawSelection()
    loopInProgress = false
}

function initGame() {
    // random tábla generálás
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            let rndInt =
                Math.floor(Math.random() * stoneTemplates.length)
            cells[i][j] = stoneTemplates[rndInt].duplicate()
        }
    }
    if(searchDestroyAll()){
        setTimeout(() => {initGame();}, 0)
        return
    }
    startLoop()
}

let theInterval = null

function startLoop() {
    theInterval = setInterval(() => {
        window.requestAnimationFrame(loop)
    }, 1000 / FRAMERATE)
}

// képek betöltése
ctx.beginPath()
ctx.fillStyle = "#FFFFFF"
ctx.font = "60px Arial"
ctx.fillText("Források betöltése...", 0, canvH / 2 + 30)
ctx.closePath()

/**
 * Kő sablonok, nem kéne módosítani
 * @type {Stone[]}
 */
let stoneTemplates = []

Object.keys(stonePaths).forEach((key) => {
    let img = new Image()
    img.isFullyLoadedASD = false
    img.addEventListener("load", () => {
        img.isFullyLoadedASD = true
        console.debug(`loaded ${key}: ${stonePaths[key]}`)
    })
    img.src = stonePaths[key]
    //imageObjects.push(img)
    let stone = new Stone(key, img, false)
    stoneTemplates.push(stone)
})

function checkLoadedness() {
    let unloaded = 0
    for (let i = 0; i < stoneTemplates.length; i++) {
        if (stoneTemplates[i].image.isFullyLoadedASD === false)
            unloaded++
    }
    if (unloaded === 0) {
        // képek betöltve, go
        ctx.beginPath()
        ctx.fillText("Generálás...", 0, canvH / 2 + 30 + 60)
        ctx.closePath()
        initGame()
        return
    }
    setTimeout(() => {
        checkLoadedness();
    }, 50)
}

checkLoadedness()
