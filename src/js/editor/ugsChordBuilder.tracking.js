/**
 * Tracks curor position relative to fretboard's hot (clickable) regions
 * @class tracking
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
fdRequire.define('ugsChordBuilder/tracking', (require, module) => {
  // dependencies:
  const ents = ugsChordBuilder.entities;
  const { settings } = ugsChordBuilder;

  let targetBox = null;

  function getTarget() {
    if (targetBox) {
      return targetBox;
    }

    const dimensions = settings.targetDimensions();
    dimensions.width *= settings.fretBoard.stringNames.length;
    dimensions.height *= (settings.fretBoard.numFrets + 1);
    targetBox = new ents.BoundingBox(settings.targetAnchorPos(), dimensions);

    return targetBox;
  }

  /**
   * Returns TRUE if the two objects overlap
   * @method  collision
   * @param  {BoundingBox} object1
   * @param  {BoundingBox} object2
   * @return {bool}
   */
  function collision(object1, object2) {
    return (object1.x < object2.x + object2.width) && (object1.x + object1.width  > object2.x) && (object1.y < object2.y + object2.height) && (object1.y + object1.height > object2.y);
  }

  /**
   * Converts position (x,y) to the fret
   * @method toDot
   * @param  {position} pos
   * @return {dot}
   */
  function toDot(pos) {
    const cursorBox = new ents.BoundingBox(pos);
    const box = getTarget();
    if (!collision(cursorBox, box)) {
      return null;
    }

    const dimensions = settings.targetDimensions();
    return new ents.Dot(
      Math.floor((pos.x - box.x) / dimensions.width),
      Math.floor((pos.y - box.y) / dimensions.height),
    );
  }

  module.exports = {
    toDot,
  };
});
