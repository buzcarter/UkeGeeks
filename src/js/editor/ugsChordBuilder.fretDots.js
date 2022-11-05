/**
 * Did I overlook this or was it deliberate? Either case, the "fret" in the dot object is
 * merely the fret in the visible diagram -- that is, a value between 0 and maxFrets, not
 * the actual fret on the instrument... beware.
 *
 * Unless otherwise stated all "dot" parames are of type ugsChordBuilder.entities.dot
 * @class fretDots
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
fdRequire.define('ugsChordBuilder/fretDots', (require, module) => {
  // dependencies:
  const ents = ugsChordBuilder.entities;
  const anchorPos = ugsChordBuilder.settings.anchorPos;
  const optsBoard = ugsChordBuilder.settings.fretBoard;
  const optsDot = ugsChordBuilder.settings.dot;

  // locals
  const underscoreDots = [];

  function getDots() {
    return underscoreDots.slice();
  }

  function slide(numSteps) {
    if (!inRange(numSteps)) {
      return false;
    }
    for (let i = 0; i < underscoreDots.length; i++) {
      underscoreDots[i].fret = underscoreDots[i].fret + numSteps;
    }
    return true;
  }

  function inRange(numSteps) {
    for (let i = 0; i < underscoreDots.length; i++) {
      if ((underscoreDots[i].fret + numSteps < 1) || (underscoreDots[i].fret + numSteps > optsBoard.numFrets)) {
        return false;
      }
    }
    return true;
  }

  function toggleDot(dot) {
    if (dot.fret == 0) {
      clearColumn(dot.string);
      return;
    }

    const index = find(dot);
    if (index < 0) {
      underscoreDots.push(dot);
    } else {
      underscoreDots.splice(index, 1);
    }
  }

  function toggleFinger(dot, finger) {
    const index = find(dot);
    if (index < 0) {
      return false;
    }

    underscoreDots[index].finger = underscoreDots[index].finger == finger ? 0 : finger;
    return true;
  }

  /**
   * Clears all saved dots.
   * @method reset
   */
  function reset() {
    for (let i = 0; i < optsBoard.stringNames.length; i++) {
      clearColumn(i);
    }
  }

  /**
   * Returns index of Dot within _dots or -1 if not found.
   * @method find
   * @param  {entities.dot} dot
   * @return {int}
   */
  function find(dot) {
    for (let i = underscoreDots.length - 1; i >= 0; i--) {
      if (underscoreDots[i].string == dot.string && underscoreDots[i].fret == dot.fret) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Clears all dots for a particular string.
   * @method clearColumn
   * @param string {int}
   */
  function clearColumn(string) {
    for (let i = underscoreDots.length - 1; i >= 0; i--) {
      if (underscoreDots[i].string == string) {
        underscoreDots.splice(i, 1);
      }
    }
  }

  function getPosition(dot) {
    return new ents.Position(
      anchorPos.x + 0.47 * optsBoard.strokeWidth + dot.string * optsBoard.stringSpace,
      anchorPos.y + 0.47 * optsBoard.strokeWidth + (dot.fret - 0.5) * optsBoard.fretSpace,
    );
  }

  function drawDot(context, pos) {
    context.beginPath();
    context.arc(pos.x, pos.y, optsDot.radius, 0, 2 * Math.PI, false);
    context.fillStyle = optsDot.fillColor;
    context.fill();
    context.lineWidth = optsDot.strokeWidth;
    context.strokeStyle = optsDot.strokeColor;
    context.stroke();
  }

  function addLabel(context, pos, text) {
    context.font = `${optsDot.fontWeight} ${optsDot.fontSize}px ${optsDot.fontFamily}`;
    context.textAlign = 'center';
    context.fillStyle = optsDot.fontColor;
    context.fillText(text, pos.x, pos.y + 0.3 * optsDot.fontSize);
  }

  function draw(context) {
    for (let i = underscoreDots.length - 1; i >= 0; i--) {
      const pos = getPosition(underscoreDots[i]);
      drawDot(context, pos);
      if (underscoreDots[i].finger > 0) {
        addLabel(context, pos, underscoreDots[i].finger);
      }
    }
  }

  module.exports = {
    getDots,
    slide,
    toggleDot,
    toggleFinger,
    reset,
    draw,
  };
});
