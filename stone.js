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
