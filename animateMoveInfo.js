/**
 * @param fromPos {Position}
 * @param toPos {Position}
 * @param frames {Number}
 * @param stone {Stone}
 */
class AnimateMoveInfo {
    fromPos;
    toPos;
    timeSeconds;
    stone;

    constructor(fromPos, toPos, timeSeconds, stone) {
        this.fromPos = fromPos;
        this.toPos = toPos;
        this.timeSeconds = timeSeconds;
        this.stone = stone;
    }
}