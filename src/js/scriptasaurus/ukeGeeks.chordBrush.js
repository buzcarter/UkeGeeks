fdRequire.define('scriptasaurus/ukeGeeks.chordBrush', (require, module) => {
  const imageSvg = require('scriptasaurus/ukeGeeks.imageSvg');
  const settings = require('scriptasaurus/ukeGeeks.settings');
  const ugsImage = require('scriptasaurus/ukeGeeks.image');

  /**
    * Again this is a constructor replacement
    * @method init
    * @return {void}
    */
  function init() {}

  /**
    * Puts a new Canvas within ChordBox and draws the chord diagram on it.
    * @method plot
    * @param chordBox {DOMElement} Handle to the DOM element where the chord is to be drawn.
    * @param chord {expandedChord} Chord Diagram to be drawn.
    * @param fretBox {JSON} Appropriate ukeGeeks.settings.fretBox -- either "fretBox" or "inlineFretBox"
    * @param {JSON} fontSettings (optional) Defaults to settings.fonts
    * @param {JSON} colorSettings (optional) Defaults to settings.colors
    * @return {void}
    */
  function plot(chordBox, chord, fretBox, fontSettings, colorSettings) {
    const ugsImg = new ugsImage.image().newImage(fretBox.width, fretBox.height);
    if (!ugsImg) {
      return;
    }

    if (!fontSettings) {
      fontSettings = settings.fonts;
    }
    if (!colorSettings) {
      colorSettings = settings.colors;
    }

    // starting top-left position for chord diagram
    const pos = {
      x: fretBox.topLeftPos.x,
      y: fretBox.topLeftPos.y,
    };
    drawFretboard(ugsImg, pos, fretBox, colorSettings.fretLines);
    // find where the circle centers should be:
    const centers = {
      x: pos.x,
      y: (pos.y + fretBox.dotRadius),
    };

    // find the vertical shift by dividing the freespace between top and bottom (freespace is the row height less circle diameter)
    const fudgeY = (fretBox.fretSpace - 2 * fretBox.dotRadius) / 2;
    const fretRange = getFretRange(chord.dots);
    const firstFret = (fretRange.last <= 5) ? 1 : fretRange.last - 4;

    // now add Dots (with finger numbers, if present)
    for (let i = 0; i < chord.dots.length; i++) {
      const s = chord.dots[i].string;
      const p = {
        x: (centers.x + s * fretBox.stringSpace),
        y: (fudgeY + centers.y + (chord.dots[i].fret - firstFret) * fretBox.fretSpace),
      };
      ugsImg.circle(p.x, p.y, fretBox.dotRadius).style({
        fillColor: colorSettings.dots,
      });
      // check that the dot's radius isn't stupidly small
      if (chord.dots[i].finger > 0 && fretBox.showText && fretBox.dotRadius > 4) {
        ugsImg.text(p.x, p.y + 5, chord.dots[i].finger).style({
          fillColor: colorSettings.dotText,
          fontFamily: fontSettings.dot,
        });
      }
    }

    // If the chord is above the normal first 5 frets we need to add labels for the first and last frets
    if (firstFret != 1) {
      // Label the starting and ending frets (0-12). It's assumed that the fretboard covers frets 1-5.
      // If instead the top fret is 6, say, well, this is the method called to add that "6".
      // The Y position calculation is a bit klunky. How big of a fret range is present in the chord?
      const txtPos = {
        x: 0,
        y: pos.y + fretBox.fretSpace * (0.96 * (5.0 - (fretRange.last - fretRange.first))),
        // Old Y caculcation: pos.y + (0.8 * fretBox.fretSpace)
      };
      ugsImg.text(txtPos.x, txtPos.y, fretRange.first).style({
        fontFamily: fontSettings.fret,
        fillColor: colorSettings.fretText,
        textAlign: 'left',
      });

      // no point in double plotting a fret (i.e. barred 8th fret) so only add second label if
      // first and last frets are different. Also, it's odd to see both 8 & 9, so only show if there's
      // at least one fret between first and last (i.e. 8 & 10)
      if ((fretRange.last - fretRange.first) > 1) {
        txtPos.y = pos.y + (4.8 * fretBox.fretSpace);
        ugsImg.text(txtPos.x, txtPos.y, fretRange.last).style({
          fontFamily: fontSettings.fret,
          fillColor: colorSettings.fretText,
          textAlign: 'left',
        });
      }
    }

    // TODO: top offset
    if (fretBox.showText) {
      ugsImg.text((pos.x + 1.5 * fretBox.stringSpace), (pos.y - 5), chord.name).style({
        fontFamily: fontSettings.text,
        fillColor: colorSettings.text,
      });
    }

    mutedStrings(ugsImg, fretBox, chord.muted, colorSettings.xStroke);
    // ukeGeeks.imageCanvas.appendChild(chordBox, ugsImg);
    imageSvg.appendChild(chordBox, ugsImg, 'ugs-diagrams--chord-img');
  }

  /// //////////////////////////////////////////////////////////////////////////
  //
  // PRIVATE methods
  //
  /// //////////////////////////////////////////////////////////////////////////

  /**
    * @method _drawFretboard
    * @private
    * @param ugsImg {ukeGeeksImage} image builder tool instance
    * @param pos {XYPosObject} Object with two properties: x & y ints, position in pixels
    * @param fretBox {settings}
    * @return {void}
    */
  function drawFretboard(ugsImg, pos, fretBox, fretColor) {
    // width offset, a "subpixel" adjustment
    let i; const
      offset = fretBox.lineWidth / 2;
    const stringHeight = settings.numFrets * fretBox.fretSpace;
    const fretWidth = 3 * fretBox.stringSpace;

    const fretboard = ugsImg.newGroup('fretboard').style({
      fillColor: 'none',
      strokeColor: fretColor,
      strokeWidth: fretBox.lineWidth,
    });

    // add "C" & "E" strings
    for (i = 1; i < 3; i++) {
      const x = pos.x + i * fretBox.stringSpace + offset;
      fretboard.vLine(x, pos.y + offset, stringHeight);
    }
    // add frets
    for (i = 1; i < settings.numFrets; i++) {
      const y = pos.y + i * fretBox.fretSpace + offset;
      fretboard.hLine(pos.x + offset, y, fretWidth);
    }

    fretboard.rectangle(pos.x + offset, pos.y + offset, fretWidth, stringHeight);
    fretboard.endGroup();
  }

  /**
    * TODO: Loop over the muted array, dropping X's whenever a string position is TRUE
    * @method _mutedStrings
    * @private
    * @param  ugsImg {ukeGeeksImage} image builder tool instance
    * @param  {JSON} fretBox  See Settings.fretBox
    * @param  {bool} muted    Is this string "muted"?
    * @param  {string} strokeColor Valid CSS hex color (shorthand not recommended)
    * @return {void}
    */
  function mutedStrings(ugsImg, fretBox, muted, strokeColor) {
    const x = fretBox.topLeftPos.x + fretBox.lineWidth / 2;
    const y = fretBox.topLeftPos.y + fretBox.lineWidth / 4;
    for (let i = 0; i < muted.length; i++) {
      if (muted[i]) {
        drawX(ugsImg, {
          x: x + i * fretBox.stringSpace,
          y,
        }, fretBox, strokeColor);
      }
    }
  }

  /**
    * Plots an "X" centered at POSITION
    * @method _drawX
    * @private
    * @param ugsImg {ukeGeeksImage} image builder tool instance
    * @param centerPos {XyPositionJson} JSON with two properties: x & y ints, position in pixels, format {x: <int>, y: <int>}
    * @param  {JSON} fretBox  See Settings.fretBox
    * @param  {string} strokeColor Valid CSS hex color (shorthand not recommended)
    * @return {void}
    */
  function drawX(ugsImg, pos, fretBox, strokeColor) {
    pos.x -= fretBox.xWidth / 2;
    pos.y -= fretBox.xWidth / 2;

    const x = ugsImg.newGroup('X').style({
      strokeColor: strokeColor || 'black',
      strokeWidth: fretBox.xStroke,
    });
    x.line(pos.x, pos.y, pos.x + fretBox.xWidth, pos.y + fretBox.xWidth);
    x.line(pos.x, pos.y + fretBox.xWidth, pos.x + fretBox.xWidth, pos.y);
  }

  /**
    * Returns first & last frets, 0 if none found.
    * @method _getFretRange
    * @private
    * @param dots {array<data.dot>} Array of ukeGeeks.data.dot objects
    * @return {JSON}
    */
  function getFretRange(dots) {
    let max = -1;
    let min = 300;

    for (let i = 0; i < dots.length; i++) {
      if (dots[i].fret > max) {
        max = dots[i].fret;
      }
      if (dots[i].fret < min) {
        min = dots[i].fret;
      }
    }
    return {
      first: (min < 300) ? min : 0,
      last: (max > 0) ? max : 0,
    };
  }

  /**
    * Adds a chord diagram to the DOM
    * @module
    * @namespace ukeGeeks
    */
  module.exports = {
    init,
    plot,
  };
});
