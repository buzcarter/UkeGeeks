/**
 * "Properties, Options, Preferences" such as fretboard size and colors; dot attributes, the cursors, fonts etc.
 * @class settings
 * @namespace ugsChordBuilder
 * @static
 * @final
 * @singleton
 */
fdRequire.define('ugsChordBuilder/settings', (require, module) => {
  // "Revealing Module Pattern"

  // dependencies:
  const ents = ugsChordBuilder.entities;

  // 'Geneva, "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, sans-serif';
  /**
   * San-serif font stack used when drawing text on Canvas.
   * @property {String} FONT_STACK
   * @final
   * @constant
   */
  const FONT_STACK = 'Arial, "Helvetica Neue", Helvetica, Verdana, sans-serif';

  /**
   * Fretboard upper left hand corner position (pseudo-constants)
   * @method anchorPos
   * @type {Position}
   * @static
   */
  const anchorPos = {
    x: 75,
    y: 75,
  };

  const cursor = {
    fillColor: 'rgba(220, 216, 73, 0.35)', // 'rgba(245, 127, 18, 0.3)',
    strokeWidth: 1,
    strokeColor: '#AAB444', // '#F57F12',
    radius: 9,
    imageUri: '/img/editor/hand-cursor.png',
  };

  const fretBoard = {
    numFrets: 5,
    maxFret: 16,
    stringNames: ['G', 'C', 'E', 'A'],
    strokeWidth: 4,
    strokeColor: '#8F8569',
    fretSpace: 35,
    stringSpace: 30,
  };

  const dot = {
    fillColor: '#F68014',
    radius: 11,
    strokeWidth: 2,
    strokeColor: '#D56333',
    fontWeight: 'bold',
    fontFamily: FONT_STACK,
    fontSize: 16,
    fontColor: '#ffffff',
  };

  const fretLabel = {
    fontFamily: FONT_STACK,
    fontSize: 28, // Pixels
    color: '#6A6A63',
    lightColor: '#EAEAE8', // D6D6D6' //A4A4A3'
  };

  const stringLabel = {
    fontFamily: FONT_STACK,
    fontSize: 34, // Pixels
    color: '#DCD849', // #AAB444'//
  };

  const chord = {
    nameMaxLength: 20,
  };

  /**
   * Dimensions of a single target
   * @method targetDimensions
   * @return {JSON} {width: ?, height: ? }
   */
  function targetDimensions() {
    return {
      height: fretBoard.fretSpace,
      width: fretBoard.stringSpace,
    };
  }

  /**
   * Top left-hand corner where Targets begin positioning
   * @method targetAnchorPos
   * @return {postion}
   */
  function targetAnchorPos() {
    const dimensions = targetDimensions();
    return new ents.Position(
      anchorPos.x - 0.5 * dimensions.width,
      anchorPos.y - dimensions.height - 0.2 * fretBoard.strokeWidth,
    );
  }

  /**
   * re-centers the fretboard's anchor position
   * @method centerFretboard
   * @param  {element} canvas
   * @return {void}
   */
  function centerAnchor(canvas) {
    anchorPos.x = (0.5 * canvas.width) - (0.5 * (fretBoard.stringNames.length - 1) * fretBoard.stringSpace) - fretBoard.strokeWidth;
    anchorPos.y = (0.5 * canvas.height) - (0.5 * fretBoard.numFrets * fretBoard.stringSpace);
  }

  module.exports = {
    // Properties
    anchorPos,
    cursor,
    fretBoard,
    dot,
    fretLabel,
    stringLabel,
    chord,
    // Methods
    targetDimensions,
    targetAnchorPos,
    centerAnchor,
  };
});
