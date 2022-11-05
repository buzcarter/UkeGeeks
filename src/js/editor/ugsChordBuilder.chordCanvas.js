/**
 * Plots chord diagram (fretboard with fret labels) on its canvas context.
 * @class chordCanvas
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
fdRequire.define('ugsChordBuilder/chordCanvas', (require, module) => {
  // dependencies
  const ents = ugsChordBuilder.entities;
  const centerAnchor = ugsChordBuilder.settings.centerAnchor;
  const anchorPos = ugsChordBuilder.settings.anchorPos;
  const fretLabel = ugsChordBuilder.settings.fretLabel;
  const stringLabel = ugsChordBuilder.settings.stringLabel;
  const fretBoard = ugsChordBuilder.settings.fretBoard;

  let _context = null;
  let _canvas = null;

  function init(ctx, ele) {
    _context = ctx;
    _canvas = ele;
    centerAnchor(_canvas);
  }

  function erase() {
    _context.clearRect(0, 0, _canvas.width, _canvas.height);
  }

  function addLabel(text, color, pos) {
    _context.font = `${fretLabel.fontSize}px ${fretLabel.fontFamily}`;
    _context.textAlign = 'right';
    _context.fillStyle = color;
    _context.fillText(text, pos.x, pos.y);
  }

  function addLabels(startingFret) {
    const pos = new ents.Position(
      anchorPos.x - 0.3 * fretLabel.fontSize,
      anchorPos.y + fretLabel.fontSize,
    );
    let color = startingFret > 1 ? fretLabel.color : fretLabel.lightColor;
    for (let i = 0; i < fretBoard.numFrets; i++) {
      addLabel(startingFret + i, color, pos);
      pos.y += fretBoard.fretSpace;
      color = fretLabel.lightColor;
    }
  }

  function addStringName(text, pos) {
    _context.font = `${stringLabel.fontSize}px ${stringLabel.fontFamily}`;
    _context.textAlign = 'center';
    _context.fillStyle = stringLabel.color;
    _context.fillText(text, pos.x, pos.y);
  }

  function addStringNames() {
    const pos = new ents.Position(
      anchorPos.x + 0.5 * fretBoard.strokeWidth,
      anchorPos.y - 0.25 * fretLabel.fontSize,
    );

    for (let i = 0; i < fretBoard.stringNames.length; i++) {
      addStringName(fretBoard.stringNames[i], pos);
      pos.x += fretBoard.stringSpace;
    }
  }

  function drawFretboard() {
    let i;
    let x;
    let y;

    // width offset, a "subpixel" adjustment
    const offset = fretBoard.strokeWidth / 2;
    // locals
    const stringHeight = fretBoard.numFrets * fretBoard.fretSpace;
    const fretWidth = (fretBoard.stringNames.length - 1) * fretBoard.stringSpace;
    // build shape
    _context.beginPath();
    // add "C" & "E" strings
    for (i = 1; i < (fretBoard.stringNames.length - 1); i++) {
      x = anchorPos.x + i * fretBoard.stringSpace + offset;
      _context.moveTo(x, anchorPos.y + offset);
      _context.lineTo(x, anchorPos.y + stringHeight + offset);
    }
    // add frets
    for (i = 1; i < fretBoard.numFrets; i++) {
      y = anchorPos.y + i * fretBoard.fretSpace + offset;
      _context.moveTo(anchorPos.x + offset, y);
      _context.lineTo(anchorPos.x + fretWidth + offset, y);
    }
    //
    _context.rect(anchorPos.x + offset, anchorPos.y + offset, fretWidth, stringHeight);
    // stroke shape
    _context.strokeStyle = fretBoard.strokeColor;
    _context.lineWidth = fretBoard.strokeWidth;
    _context.stroke();
    _context.closePath();
  }

  function draw(pos, startingFret) {
    erase();
    // ugsChordBuilder.debugTargets.drawTargets(_context);
    addLabels(startingFret);
    addStringNames();
    drawFretboard();
    ugsChordBuilder.fretDots.draw(_context);
  }

  module.exports = {
    init,
    draw,
  };
});
