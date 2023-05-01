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
    timeSeconds
    stone;

    constructor(pos, startScaleMul, endScaleMul, timeSeconds, stone) {
        this.pos = pos;
        this.startScaleMul = startScaleMul;
        this.endScaleMul = endScaleMul;
        this.timeSeconds = timeSeconds;
        this.stone = stone;
    }
}