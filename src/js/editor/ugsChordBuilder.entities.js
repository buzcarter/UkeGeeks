fdRequire.define('ugsChordBuilder/entities', (require, module) => {
/**
 * Entities (data containers) shared between the class libraries. Private
 * JSON objects used internally by a class are not included here.
 * @class entities
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
  const entities = {
  /**
   * @class entities.BoundingBox
   * @constructor
   * @param  {Position} pos   Position (JSON) object
   * @param  {JSON} dimensions JSON Object of form: {width: {int}, height: {int}}
   */
    BoundingBox(pos, dimensions) {
    /**
     * @property x
     * @type {int}
     */
      this.x = pos ? pos.x : 0;
      /**
     * @property y
     * @type {int}
     */
      this.y = pos ? pos.y : 0;
      /**
     * @property width
     * @type {int}
     */
      this.width = dimensions ? dimensions.width : 1;
      /**
     * @property height
     * @type {int}
     */
      this.height = dimensions ? dimensions.height : 1;
    },

    /**
   * Describes a fingering Dot on the fretboard
   * @class entities.Dot
   * @constructor
   * @param  {int} string
   * @param  {int} fret
   * @param  {int} finger
   */
    Dot(string, fret, finger) {
    /**
     * String number, on sporano (GCEA), G is 0th string, and so on
     * @property string
     * @type {int}
     */
      this.string = string;
      /**
     * @property fret
     * @type {int}
     */
      this.fret = fret || 0;
      /**
     * @property finger
     * @type {int}
     */
      this.finger = finger || 0;
    },

    /**
   * @class entities.Position
   * @constructor
   * @param  {int} x
   * @param  {int} y
   */
    Position(x, y) {
    /**
     * @property x
     * @type {int}
     */
      this.x = x || 0;
      /**
     * @property y
     * @type {int}
     */
      this.y = y || 0;
    },
  };

  module.exports = {
    entities,
  };
});
