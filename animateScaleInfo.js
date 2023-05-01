/**
 * @param pos {Position}
 * @param startScaleMul {Number}
 * @param endScaleMul {Number}
 * @param stone {Stone}
 */
class AnimateScaleInfo {
    pos;
    startScaleMul;
    endScaleMul;
    stone;

    constructor(pos, startScaleMul, endScaleMul, stone) {
        this.pos = pos;
        this.startScaleMul = startScaleMul;
        this.endScaleMul = endScaleMul;
        this.stone = stone;
    }
}