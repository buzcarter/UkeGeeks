fdRequire.define('ugsChordBuilder/export', (require, module) => {
  const fretDots = require('ugsChordBuilder/fretDots');
  const settings = require('ugsChordBuilder/settings');

  const optsBoard = settings.fretBoard;
  const optsChord = settings.chord;

  let _fretOffset = null;

  /**
   * Class for "reorganized" dots, think of this as a necklace where the
   * thread, the instrument string, has zero or more beads, or dots -- fret plus finger
   * @class  StringDots
   * @constructor
   * @private
   * @param  {int} string
   * @param  {dot_Array} dots
   */
  function StringDots(string, dots) {
    this.string = string;
    this.dots = dots || [];
    // this.fingers = fingers ? fingers : [];
  }

  function getStringDots() {
    // initialize empty string array
    let stringNumber;
    const aryStringDots = [];
    for (stringNumber = 1; stringNumber <= optsBoard.stringNames.length; stringNumber++) {
      aryStringDots.push(new StringDots(stringNumber));
    }

    // add dots
    const dots = fretDots.getDots();
    for (stringNumber = aryStringDots.length - 1; stringNumber >= 0; stringNumber--) {
      for (let i = dots.length - 1; i >= 0; i--) {
        if (aryStringDots[stringNumber].string == dots[i].string + 1) {
          aryStringDots[stringNumber].dots.push(dots[i]);
        }
      }
    }

    return aryStringDots;
  }

  /**
   * Returns the minimum & maximum fret found withing array (of dots)
   * @method getMinMax
   * @param  {dot_array} ary
   * @return {JSON}
   */
  function getMinMax(ary) {
    let max = 0;
    let min = 900;
    for (let i = ary.length - 1; i >= 0; i--) {
      if (ary[i].fret > max) {
        max = ary[i].fret;
      }
      if (ary[i].fret < min) {
        min = ary[i].fret;
      }
    }
    return {
      max,
      min: (min < 900) ? min : max,
    };
  }

  /**
   * Handles the offset, translates from fret (on the diagram's N frets) to the insturment's complete fretbaord
   * @method  fretNumber
   * @param  {int} fret
   * @return {int}
   */
  function fretNumber(fret) {
    return fret > 0 ? _fretOffset + fret : 0;
  }

  /**
   * Not too surprisingly this finds "fret" within dots and returns finger. If there isn't a dot
   * for fret returns zed.
   * @method  getFinger
   * @param  {array} dots
   * @param  {int} fret
   * @return {int}
   */
  function getFinger(dots, fret) {
    for (let i = 0; i < dots.length; i++) {
      if (dots[i].fret == fret) {
        return dots[i].finger;
      }
    }
    return 0;
  }

  /**
   * Returns an array of ints, one for each string, with the HIGHEST REAL fret appearing on that string.
   * Default is zed per string.
   * @method getPrimaryFrets
   * @param  {int} startingFret
   * @return {int}
   */
  function getPrimaryFrets(startingFret) {
    _fretOffset = startingFret - 1;
    const dotsPerString = getStringDots();
    const primaries = [];
    for (let i = 0; i < dotsPerString.length; i++) {
      const minMax = getMinMax(dotsPerString[i].dots);
      primaries.push(fretNumber(minMax.max));
    }
    return primaries;
  }

  /**
   * Returns complete ChordPro definition statement
   * @method getDefinition
   * @param  {string} chordName
   * @param  {int} startingFret
   * @return {string}
   */
  function getDefinition(chordName, startingFret) {
    chordName = scrub(chordName);
    const name = (chordName && chordName.length > 0) ? chordName : 'CHORDNAME';
    let fretsStr = '';
    let fingersString = '';
    let addsString = '';

    _fretOffset = startingFret - 1;
    const dotsPerString = getStringDots();
    for (let i = 0; i < dotsPerString.length; i++) {
      const minMax = getMinMax(dotsPerString[i].dots);
      fretsStr += `${fretNumber(minMax.max)} `;
      fingersString += `${getFinger(dotsPerString[i].dots, minMax.max)} `;
      if (minMax.max != minMax.min) {
        addsString += ` add: string ${dotsPerString[i].string} fret ${fretNumber(minMax.min)} finger ${getFinger(dotsPerString[i].dots, minMax.min)}`;
      }
    }

    // no double spaces, no space before the closing "}"
    return (`{define: ${name} frets ${fretsStr} fingers ${fingersString}${addsString}}`).replace(/\s+/g, ' ').replace(' }', '}');
  }

  /**
   * Returns "highlighted" (HTML-ified) ChordPro definition statement.
   * @method getDefinition
   * @param  {string} chordName
   * @param  {int} startingFret
   * @return {string}
   */
  function getDefinitionHtml(chordName, startingFret) {
    chordName = scrub(chordName);
    // Keep regexs simple by a couple cheats:
    // First, using 'X07MX001' as my CSS clasname prefix to avoid collisions.
    // We temporarily remove the name, then put it back in the very last step.
    let html = getDefinition(chordName, startingFret);
    html = html.replace(` ${chordName}`, ' X07Myq791wso01');
    html = html.replace(/\b(\d+)\b/g, '<span class="chordPro-X07MX001number">$1</span>');
    html = html.replace(/\b(frets?|fingers?|string)\b/g, '<span class="chordPro-X07MX001attribute">$1</span>');
    html = html.replace(/\b(define|add)\b/g, '<span class="chordPro-X07MX001keyword">$1</span>');
    return html
      .replace('X07Myq791wso01', `<span class="chordPro-string">${chordName}</span>`)
      .replace(/X07MX001/g, '')
      .replace(/ +/g, ' ');
  }

  /**
   * Returns "safe" version of chord name, removing disallowed characters and reserved names (such as "add:")
   * @method scrub
   * @param  {string} chordName
   * @return {string}
   */
  function scrub(name) {
    // paranoia protection: no reserved words (makes life easier for parsing)
    const disallow = /^(frets|fingers|add:)$/i;
    // trim leading & trailing spaces, internal spaces get smushed into single dash
    let cleaned = name.replace(/^\s*(.*?)\s*$/, '$1').replace(/\s+/g, '-');
    if (disallow.test(cleaned)) {
      cleaned = '';
    }
    return cleaned.substring(0, optsChord.nameMaxLength);
  }

  module.exports = {
    getPrimaryFrets,
    getDefinition,
    getDefinitionHtml,
  };
});
