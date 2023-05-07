/**
 * @param id {*} típus/szín azonosító
 * @param texture {Image} textúra (kép)/szín
 * @param boom {boolean} true/false, bomba-e
 */
class Stone {
    id;
    image;
    boom;
    /**
     * rajzolódjon-e a loop-ban (animációnál használatos)
     * @type {boolean}
     */
    doDraw = true;
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
        let dup = new Stone(this.id, this.image, this.boom)
        dup.doDraw = this.doDraw
        dup.boom = this.boom
        return dup
    }
}

const stonePaths = {
    "blue": "images/blue.png",
    "green": "images/green.png",
    "purple": "images/purple.png",
    "red": "images/red.png",
    "yellow": "images/yellow.png"
}