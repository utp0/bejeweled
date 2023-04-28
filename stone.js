/**
 * @param id típus/szín azonosító
 * @param texture textúra (kép)/szín
 * @param boom true/false, bomba-e
 */
class Stone {
    id;
    image;
    boom;
    constructor(id, image, boom) {
        this.id = id
        this.image = image
        this.boom = boom
    }

    /**
     * Saját magáról ad egy új példányt
     * @returns {Stone}
     */
    duplicate() {
        return new Stone(this.id, this.image, this.boom)
    }
}

const stonePaths = {
    "blue": "images/blue.png",
    "green": "images/green.png",
    "purple": "images/purple.png",
    "red": "images/red.png",
    "yellow": "images/yellow.png"
}