/* Beállítások */
const GAME_TIME_SECS = 120
const CELLS_X = 8
const CELLS_Y = 8
const CELLS_BORDER_PX = 1
const CELLS_BORDER_SELECTED_PX = 5
const CELLS_BORDER_VALID_PX = 3
const FRAMERATE = 60  // csak kb, mer setInterval nem fix, utólag nincs időm erre
const ANIMATION_SECONDS_LONG = 0.3
const ANIMATION_SECONDS_SHORT = 0.15
const CELLS_BG_STYLE = "#4c096c"
const CELL_SELECTED_STYLE = "#e1d866"
const CELL_VALID_STYLE = "#e7e1b3"
const TEXT_STYLE = "#dcdcdc"
const STONE_SIZE_MULTIPLIER = 0.8
const DESTROY_AMOUNT = 3
const BOMB_RND_LIMIT = 0.1  // [0.0 .. 1.0[
const BOMB_SQUARE_SIDE = 3
/* Beállítások vége */

let canv = document.getElementById("canvas1")
let ctx = canv.getContext("2d")

let canvW = canv.getBoundingClientRect().width
let canvH = canv.getBoundingClientRect().height
let canvX = canv.getBoundingClientRect().x
let canvY = canv.getBoundingClientRect().y

let cellWidth = Math.min(canvW, canvH) / CELLS_X
let cellHeight = Math.min(canvW, canvH) / CELLS_Y

// ez 4:3 képarányban jó, max a sidebar-t bele kell számolni, ha vmiért ez változna
//let gridX = (canvW / 2) - (cellWidth * CELLS_X / 2)  // HOR közép
let gridX = (canvW) - (cellWidth * CELLS_X)  // HOR jobbra tol
let gridY = (canvH / 2) - (cellHeight * CELLS_Y / 2)  // VER közép

// TODO: "global" változókat össze kéne gyűjteni mondjuk ide

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

let isAlreadyMusic = false

function canvClickHandler(e) {
    let mp = document.getElementById("bgmusic")
    mp.play()
    mp.volume = .1

    if (doHandleClickEvents === false || activeAnimsAsyncCtrlNum > 0) {
        selectedCell = null
        return
    }
    /// négyzet koordináta kiszámolása
    // igazítás grid pozícióhoz
    let x = e.clientX - canvX - gridX
    let y = e.clientY - canvY - gridY
    //console.debug(`click ${x} ${y}`)
    // osztás
    let mezoX = Math.floor(x / cellWidth)
    let mezoY = Math.floor(y / cellHeight)
    //console.debug(`mezo ${mezoX} ${mezoY}`)
    if (mezoX >= 0 && mezoX < CELLS_X && mezoY >= 0 && mezoY < CELLS_Y) {
        interactWithCell(mezoX, mezoY)
    }
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
        selectedCell = null
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
    let startCell = cells[a.x][a.y].duplicate()
    if (startCell == null) return false
    /**
     * @type {Position[]}
     */
    let destroyArray = [a]
    /**
     *
     * @type {Position[]}
     */
    let bombsArray = []
    // ha saját maga bomba, adjuk hozzá
    if(cells[a.x][a.y].boom === true) {
        bombsArray.push(a)
    }

    /// bal-jobb
    // bal
    for (let x = a.x - 1; x >= 0; x--) {
        if (cells[x][a.y] != null && cells[x][a.y].id === startCell.id) {
            destroyArray.push(new Position(x, a.y))
            if (cells[x][a.y].boom === true) bombsArray.push(new Position(x, a.y))
        } else break
    }
    // jobb
    for (let x = a.x + 1; x < CELLS_X; x++) {
        if (cells[x][a.y] != null && cells[x][a.y].id === startCell.id) {
            destroyArray.push(new Position(x, a.y))
            if (cells[x][a.y].boom === true) bombsArray.push(new Position(x, a.y))
        } else break
    }

    if (destroyArray.length >= DESTROY_AMOUNT) {
        for (let i = 0; i < destroyArray.length; i++) {
            if (cells[destroyArray[i].x][destroyArray[i].y] != null)
                points++
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
            if (cells[a.x][y].boom === true) bombsArray.push(new Position(a.x, y))
        } else break
    }
    // le
    for (let y = a.y + 1; y < CELLS_Y; y++) {
        if (cells[a.x][y] != null && cells[a.x][y].id === startCell.id) {
            destroyArray.push(new Position(a.x, y))
            if (cells[a.x][y].boom === true) bombsArray.push(new Position(a.x, y))
        } else break
    }

    if (destroyArray.length >= DESTROY_AMOUNT) {
        for (let i = 0; i < destroyArray.length; i++) {
            if (cells[destroyArray[i].x][destroyArray[i].y] != null)
                points++
            cells[destroyArray[i].x][destroyArray[i].y] = null
        }
        didAThing = true
    }

    destroyArray = []
    // bomba
    if (didAThing) {
        for (let i = 0; i < bombsArray.length; i++) {
            let a = bombsArray[i]
            let xI = a.x - Math.floor(BOMB_SQUARE_SIDE / 2)
            let xImax = xI + BOMB_SQUARE_SIDE - 1
            for (; xI <= xImax; xI++) {
                let yI = a.y - Math.floor(BOMB_SQUARE_SIDE / 2)
                let yImax = yI + BOMB_SQUARE_SIDE - 1
                for (; yI <= yImax; yI++) {
                    if (xI >= 0 && xI < CELLS_X && yI >= 0 && yI < CELLS_Y) {
                        destroyArray.push(new Position(xI, yI))
                    }
                }
            }
        }
    }

    if (destroyArray.length >= DESTROY_AMOUNT) {
        for (let i = 0; i < destroyArray.length; i++) {
            if (cells[destroyArray[i].x][destroyArray[i].y] != null)
                points++
            cells[destroyArray[i].x][destroyArray[i].y] = null
        }
        didAThing = true
    }

    if (didAThing) {
        // pling
        sounds["point"].pause()
        sounds["point"].currentTime = 0
        sounds["point"].play()
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
            if (!(cells[i][j] instanceof Stone) || !cells[i][j].doDraw)
                continue
            let x = gridX + i * cellWidth + (cellWidth * (1 - STONE_SIZE_MULTIPLIER) / 2)
            let y = gridY + j * cellHeight + (cellHeight * (1 - STONE_SIZE_MULTIPLIER) / 2)
            ctx.drawImage(cells[i][j].image,
                x,
                y,
                cellWidth * STONE_SIZE_MULTIPLIER,
                cellHeight * STONE_SIZE_MULTIPLIER
            )
            if (cells[i][j].boom === true) {
                ctx.drawImage(
                    bombImg,
                    x + cellWidth / 2,
                    y + cellHeight / 2,
                    cellWidth * STONE_SIZE_MULTIPLIER * .5,
                    cellHeight * STONE_SIZE_MULTIPLIER * .5
                )
            }
        }
    }
}

let bombImg = new Image()
bombImg.src = "images/explosion.png"

/**
 * Aktív animációk száma
 * @type {Number}
 */
let activeAnimsAsyncCtrlNum = 0

/**
 *
 * @type {AnimateMoveInfo[]|AnimateScaleInfo[]}
 */
let activeAnimsArray = []

/**
 *
 * @returns {boolean} ha volt, true. ha nem volt, false
 */
function emptiesHandler() {
    let found = false;
    // üres hely keresése lentről
    for (let x = 0; x < CELLS_X; x++) {
        for (let y = CELLS_Y - 1; y >= 0; y--) {
            if (cells[x][y] == null) {
                found = true
                /**
                 * csak null oszlop-e; üres-e tetejéig
                 * @type {boolean}
                 */
                let onlyNulls = true
                // üres, felfele loopolva minde essen le
                let downY = 1
                for (let inY = y - 1; inY >= 0; inY--) {
                    ranOnce = true
                    if (cells[x][inY] == null) {
                        downY++
                        continue
                    }
                    onlyNulls = false
                    let anim = new AnimateMoveInfo(
                        new Position(x, inY),
                        new Position(x, inY + downY),
                        ANIMATION_SECONDS_LONG,
                        cells[x][inY].duplicate()
                    )

                    /** animáció létrehozás/indítása */
                    activeAnimsArray.push(anim)
                    // ledobni őket ahova
                    cells[anim.toPos.x][anim.toPos.y] = cells[anim.fromPos.x][anim.fromPos.y].duplicate()
                    cells[anim.fromPos.x][anim.fromPos.y] = null
                    // anim
                    cells[anim.toPos.x][anim.toPos.y].doDraw = false  // rajzolás off anim-ig
                    let speedY = (anim.toPos.y - anim.fromPos.y) * (1 / FRAMERATE) / anim.timeSeconds
                    activeAnimsAsyncCtrlNum++
                    let curAnimInterval = setInterval(() => {
                        // fromPos-t használom jelen pozíciónak mer jó lesz az úgy
                        anim.fromPos.y += speedY
                        if (anim.fromPos.y >= anim.toPos.y) {
                            if (cells[anim.toPos.x][anim.toPos.y] instanceof Stone)
                                cells[anim.toPos.x][anim.toPos.y].doDraw = true  // jank?
                            clearInterval(curAnimInterval)
                            anim.stone = null  // ez alapján a tömbből máshol törölni is lehet őket
                            activeAnimsAsyncCtrlNum--
                        }
                    }, 1000 / FRAMERATE)
                }
                // ha üres az oszlop fentig, feltölteni randommal
                if (onlyNulls) {
                    for (let inY = 0; inY <= y; inY++) {
                        //if(cells[x][inY] != null) continue
                        /** animáció létrehozás/indítása */
                        let rndInt =
                            Math.floor(Math.random() * stoneTemplates.length)
                        cells[x][inY] = stoneTemplates[rndInt].duplicate()
                        // bonba
                        if (Math.random() <= BOMB_RND_LIMIT) {
                            cells[x][inY].boom = true
                        }
                        let anim = new AnimateScaleInfo(
                            new Position(x, inY),
                            0,
                            1,
                            ANIMATION_SECONDS_SHORT,
                            cells[x][inY].duplicate()
                        )
                        activeAnimsArray.push(anim)
                        // anim
                        cells[x][inY].doDraw = false  // rajzolás off anim-ig
                        let speed = (anim.endScaleMul - anim.startScaleMul) * (1 / FRAMERATE) / anim.timeSeconds
                        activeAnimsAsyncCtrlNum++
                        let curAnimInterval = setInterval(() => {
                            anim.startScaleMul += speed
                            if (anim.startScaleMul >= anim.endScaleMul) {
                                if (cells[anim.pos.x][anim.pos.y] instanceof Stone)
                                    cells[anim.pos.x][anim.pos.y].doDraw = true  // jank?
                                clearInterval(curAnimInterval)
                                anim.stone = null  // ez alapján a tömbből máshol törölni is lehet őket
                                activeAnimsAsyncCtrlNum--
                            }
                        }, 1000 / FRAMERATE)
                    }
                }
            }
        }
    }
    return found
}

const textPos = new Position(-2.3, 0.5)
let textPx = 36 * (Math.min(cellWidth, cellHeight) / 72.25)  // 72.25: 800x600-on cellWidth

/**
 * pontok
 * @type {number}
 */
let points = 0

/**
 * Még vanó másodpercek
 * @type {number|string}
 */
let timeLeftSecs = GAME_TIME_SECS

function drawSideUI() {
    // gridX és gridY-hoz igazítva sima kéne legyen
    // szabad helyet nem ellenőriz, canvas w/h-hoz nem lesz nyúlva
    ctx.font = textPx + "px Arial"
    ctx.fillStyle = TEXT_STYLE
    let x = gridX + textPos.x * cellWidth
    let y = gridY + textPos.y * cellHeight
    let maxWidth = cellWidth * 1.85

    // score
    ctx.fillText("SCORE", x, y, maxWidth)
    y += textPx
    ctx.fillText(points.toString(), x, y, maxWidth)

    // time
    y += textPx * 1.5
    ctx.fillText("TIME", x, y, maxWidth)
    y += textPx
    ctx.fillText(timeLeftSecs.toString(), x, y, maxWidth)

    // leaderboard
    y += textPx * 2.5
    x -= cellWidth * .23
    maxWidth *= 1.3
    ctx.fillText("LEADERBOARD", x, y, maxWidth)
    y += textPx
    ctx.font = textPx * .8 + "px Arial"
    if (leaderboard == null || leaderboard.length === 0) {
        ctx.fillText("-- empty --", x, y, maxWidth)
    } else {
        for (let i = 0; y < canvH && i < leaderboard.length; y += textPx * .8, i++) {
            ctx.fillText(leaderboard[i][0] + " " + leaderboard[i][1], x, y, maxWidth)
        }
    }
}


/**
 * true ha épp fut egy loop
 * @type {boolean}
 */
let loopInProgress = false

/**
 * game mechanic frissítéseket ki lehet kapcsolni
 * @type {boolean}
 */
let doBoardUpdates = true

/**
 * fő game loop funkció, meghív egyéb részfolyamatokat
 */
function loop() {
    if (loopInProgress) return
    loopInProgress = true

    while (doBoardUpdates && !activeAnimsAsyncCtrlNum) {
        if (emptiesHandler())
            break
        searchDestroyAll()
        break
    }
    drawBG()
    drawGrid()  // lehet nemkell, még idk.
    drawStones()
    if (selectedCell !== null) drawSelection()
    animsHandler()
    drawSideUI()
    // if (timeCheck()) gameEndHandler()
    timeCheck()

    loopInProgress = false
}

function animsHandler() {
    for (let i = 0; i < activeAnimsArray.length; i++) {
        // kész animok törlése
        if (activeAnimsArray[i].stone === null)
            activeAnimsArray.splice(i, 1)
    }
    for (let i = 0; i < activeAnimsArray.length; i++) {
        // menő animációk rajzolása

        ctx.beginPath()

        if (activeAnimsArray[i].stone instanceof Stone && activeAnimsArray[i].stone.image instanceof Image) {
            if (activeAnimsArray[i] instanceof AnimateScaleInfo) {
                // scale animok
                ctx.drawImage(activeAnimsArray[i].stone.image,
                    gridX + activeAnimsArray[i].pos.x * cellWidth + (cellWidth * (1 - activeAnimsArray[i].startScaleMul) / 2),
                    gridY + activeAnimsArray[i].pos.y * cellHeight + (cellHeight * (1 - activeAnimsArray[i].startScaleMul) / 2),
                    cellWidth * activeAnimsArray[i].startScaleMul,
                    cellHeight * activeAnimsArray[i].startScaleMul
                )
            } else if (activeAnimsArray[i] instanceof AnimateMoveInfo) {
                // move animok
                ctx.drawImage(activeAnimsArray[i].stone.image,
                    gridX + activeAnimsArray[i].fromPos.x * cellWidth + (cellWidth * (1 - STONE_SIZE_MULTIPLIER) / 2),
                    gridY + activeAnimsArray[i].fromPos.y * cellHeight + (cellHeight * (1 - STONE_SIZE_MULTIPLIER) / 2),
                    cellWidth * STONE_SIZE_MULTIPLIER,
                    cellHeight * STONE_SIZE_MULTIPLIER
                )
            }
        }
        ctx.closePath()
    }
}

function gameEndHandler() {
    timeCheck = timeCheck_
    let ok = false
    let uName = null
    while (!ok) {
        uName =
            prompt("Elért pontszám: " + points.toString() + ". Név (min 3, max 10 karakter):", "player")
        if (uName === null) {
            ok = true
            return
        }
        uName = uName.trim()
        if (uName.length <= 10 && uName.length >= 3) ok = true
    }
    // leaderboardra
    let newLeaderboard = []
    let isInserted = false
    for (let i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i][1].toLowerCase() !== uName.toLowerCase()) {
            if (!isInserted && points > leaderboard[i][0]) {
                newLeaderboard.push([points, uName])
                isInserted = true
            }
            newLeaderboard.push(leaderboard[i])
        }
    }
    if (!isInserted) newLeaderboard.push([points, uName])
    leaderboard = newLeaderboard
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard))
}

let timeCheck = timeCheck_

/**
 * időlejárat-ellenőrző, le tiltja az inputok kezelését
 * @returns {boolean} le-e járt az idő
 */
function timeCheck_() {
    if (timeInterval === null) return false
    if (timeLeftSecs <= 0) {
        clearInterval(timeInterval)
        doHandleClickEvents = false
        doBoardUpdates = false
        timeInterval = null
        timeLeftSecs = "GAME OVER"
        console.debug("time")
        timeCheck = gameEndHandler
        return true
    }
    return false
}

function loadLeaderboard() {
    let locLB = localStorage.getItem("leaderboard")
    if (locLB == null) {
        locLB = JSON.stringify([])
        localStorage.setItem("leaderboard", locLB)
        loadLeaderboard()
        return
    }
    try {
        leaderboard = JSON.parse(locLB)
    } catch (e) {
        let bruh = "String JSON formázása nem megfelelő a localstorage-ban, leaderboard nem elérhető"
        console.debug(bruh)
        alert(bruh)
        leaderboard = null
    }
}

/**
 *
 * @type {null|Array}
 */
let leaderboard = null

let timeInterval = null

function initGame() {
    // random tábla generálás
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            let rndInt =
                Math.floor(Math.random() * stoneTemplates.length)
            cells[i][j] = stoneTemplates[rndInt].duplicate()
            // bonba
            if (Math.random() <= BOMB_RND_LIMIT) {
                cells[i][j].boom = true
            }
        }
    }
    // hehe
    if (searchDestroyAll()) {
        setTimeout(() => {
            initGame();
        }, 0)
        return
    }
    loadLeaderboard()
    startLoop()
    // time
    timeInterval = setInterval(() => {
        timeLeftSecs--
    }, 1000)
}

let theInterval = null

function startLoop() {
    points = 0
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
    img.src = stonePaths[key]  // ez a listener def után kell, local túl gyors
    //imageObjects.push(img)
    let stone = new Stone(key, img, false)
    stoneTemplates.push(stone)
})

let sounds = {"point": new Audio("sounds/point.wav")}

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
