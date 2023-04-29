/**
 * @param fromPos {Position}
 * @param toPos {Position}
 * @param frames {Number}
 * @param stone {Stone}
 */
class AnimateMoveInfo {
    fromPos;
    toPos;
    frames;
    stone;

    constructor(fromPos, toPos, frames, stone) {
        this.fromPos = fromPos;
        this.toPos = toPos;
        this.frames = frames;
        this.stone = stone;
    }
}