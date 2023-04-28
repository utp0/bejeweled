/**
 * @param id típus/szín azonosító
 * @param texture textúra (kép)/szín
 * @param boom true/false, bomba-e
 */
class Stone {
    id;
    texture;
    boom;
    constructor(id, texture, boom) {
        this.id = id
        this.texture = texture
        this.boom = boom
    }
}

const stonePaths = {
    "blue": "images/blue.png",
    "green": "images/green.png",
    "purple": "images/purple.png",
    "red": "images/red.png",
    "yellow": "images/yellow.png"
}