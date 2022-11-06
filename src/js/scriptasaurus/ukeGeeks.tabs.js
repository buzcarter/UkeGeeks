fdRequire.define('scriptasaurus/ukeGeeks.tabs', (require, module) => {
  const settings = require('scriptasaurus/ukeGeeks.settings');
  const toolsLite = require('scriptasaurus/ukeGeeks.toolsLite');
  const imageSvg = require('scriptasaurus/ukeGeeks.imageSvg');
  const ugsImage = require('scriptasaurus/ukeGeeks.image');

  /**
 * Tablature renderer -- reads tab data and draws canvas elements.
 * Creates "packed" versions of the tabs, including a "key line" that's comprised
 * only of '-' and '*' -- the asterisks denoting where a dot will eventually be placed.
 * @class tabs
 * @constructor
 * @namespace ukeGeeks
 */

  /**
   * alias for external Settings dependencies (helps with complression, too)
   * @property tab_settings
   * @private
   * @type {JSON}
   */
  const myTabSettings = settings.tabs;

  // TODO: use ukeGeeks.settings.tuning for NUM_STRINGS and LAST_STRING_NAME??

  /**
   * (Constant) Number of Strings (dashed lines of tablature notation) expected. (For now
   * a constant -- ukueleles "always" have four). Making a variable to help support port
   * for other instruments.
   * @property NUM_STRINGS
   * @private
   * @type int
   */
  const NUM_STRINGS = 4;

  /**
   * (Constant) Last String Name (Note), as above, on Ukulele is a "G". Here for other instruments.
   * @property LAST_STRING_NAME
   * @private
   * @type string
   */
  const LAST_STRING_NAME = 'G';

  /* PUBLIC METHODS
    ---------------------------------------------- */
  /**
   * Again this is a constructor replacement
   * @method init
   * @public
   * @return {void}
   */
  function init() {}

  /**
   * Races through all &lt;pre&gt; tags within h, any with the CSS class of "ugsTabs" will be replaced with the canvas element.
   * @method replace
   * @public
   * @param h {DOM-element}
   * @return {void}
   */
  function replace(h) {
    const tabBlocks = h.getElementsByTagName('pre');
    for (const i in tabBlocks) {
      if (tabBlocks[i].className == 'ugsTabs') {
        const s = tabBlocks[i].innerHTML;
        tabBlocks[i].innerHTML = '';
        loadBlocks(s, tabBlocks[i]);
      }
    }
  }

  /**
   *
   * @method loadBlocks
   * @param text {string} Block of text that contains one or more tablature blocks
   * @param outElement {string or DOM} Either: (string) the Id to a DOM element, or DOM element handle where the canvas/converted text will be placed.
   * @return {void}
   */
  function loadBlocks(text, outElement) {
    const lines = text.split('\n');
    let tab = [];
    for (const i in lines) {
      const s = toolsLite.trim(lines[i]);
      if (s.length > 0) {
        tab.push(s);
      }
      if (tab.length == NUM_STRINGS) {
        redraw(tab, outElement);
        tab = [];
      }
    }
  }

  /**
   *
   * @method redraw
   * @param inTabs {string or array} Block of text or four element array containing tablbature to be parsed
   * @param outElement {string or DOM} Either: (string) the Id to a DOM element, or DOM element handle where the canvas/converted text will be placed.
   * @return {void}
   */
  function redraw(inTabs, outElement) {
    // validate inTabs input...
    // TODO: instead of this if it's text pop the entire processing back to loadBlocks!
    inTabs = (typeof (inTabs) === 'string') ? (inTabs.split('\n')) : inTabs;
    if (inTabs.length < NUM_STRINGS) {
      return;
    }
    // read tabs
    const tabInfo = readTabs(inTabs);
    const labelOffset = (tabInfo.hasLabels) ? myTabSettings.labelWidth : 0;
    const { tabs } = tabInfo;
    // how much space?
    const height = ((NUM_STRINGS - 1) * myTabSettings.lineSpacing) + (2 * myTabSettings.dotRadius) + myTabSettings.bottomPadding;
    // prep canvas
    outElement = (typeof (outElement) === 'string') ? document.getElementById(outElement) : outElement;

    const ugsImg = new ugsImage.image().newImage(getWidth(tabs, labelOffset, false), height);
    const pos = {
      x: myTabSettings.dotRadius + labelOffset,
      y: 1 + myTabSettings.dotRadius,
    };
    const lineWidth = getWidth(tabs, labelOffset, true);
    drawStaff(ugsImg, pos, lineWidth, myTabSettings);
    drawNotes(ugsImg, pos, tabs, myTabSettings, lineWidth);
    if (tabInfo.hasLabels) {
      drawLabels(ugsImg, pos, myTabSettings);
    }

    outElement.innerHTML = imageSvg.toString(ugsImg);
  }

  /**
   * This is insanely long, insanely kludgy, but, insanely, it works. This will read break a block of text into
   * four lines (the ukulele strings), then find which frets are used by each. Then, the hard part, pack un-needed
   * dashes. Once it's done that a 2-dimentional array (strings X frets) is created and returned.
   * @method readTabs
   * @private
   * @param ukeStrings {array<string>} Block of tablbabure to be parsed
   * @return {2-dimentional array}
   */
  function readTabs(ukeStrings) {
    const hasLabels = ukeStrings[NUM_STRINGS - 1][0] == LAST_STRING_NAME;
    if (hasLabels) {
      stripStringLabels(ukeStrings);
    }
    const frets = getFretNumbers(ukeStrings);
    const symbols = getSymbols(ukeStrings);
    const minLength = getMinLineLength(ukeStrings);
    const guide = getGuideLine(symbols, minLength);

    return {
      tabs: getPackedLines(frets, symbols, guide, minLength),
      hasLabels,
    };
  }

  /**
   * @method getWidth
   * @private
   * @param tabs {2Darray}
   * @param labelOffset {int}
   * @param isTruncate {bool} If TRUE returns the length of the line, allowing for a terminating "|" character, othwrwise, it's for canvas width
   * @return {int}
   */
  function getWidth(tabs, labelOffset, isTruncate) {
    if (!isTruncate) {
      return (myTabSettings.noteSpacing * tabs[0].length) + labelOffset + myTabSettings.dotRadius;
    }

    let len = tabs[0].length;
    let plusDot = myTabSettings.dotRadius;
    if (tabs[0][len - 1] == '|') {
      // TODO: too much??? retest
      len -= 1;
      plusDot = 0;
    }

    return myTabSettings.noteSpacing * len + labelOffset + plusDot;
  }

  /**
   * Processes ukeStrings stripping the first character from each line
   * @method stripStringLabels
   * @private
   * @param ukeStrings {array<string>}
   * @return {void}
   */
  function stripStringLabels(ukeStrings) {
    for (let i = 0; i < NUM_STRINGS; i++) {
      ukeStrings[i] = ukeStrings[i].substr(1);
    }
  }

  /**
   * Finds the frets in used for each line. In other words, ignoring
   * spacers ("-" or "|") this returns arrays of numbers, the frets
   * in use, for each line.
   * @method getFretNumbers
   * @private
   * @param ukeStrings {array<string>}
   * @return {void}
   */
  function getFretNumbers(ukeStrings) {
    // first, get the frets
    const reInts = /([0-9]+)/g;
    const frets = [];
    for (let i = 0; i < NUM_STRINGS; i++) {
      frets[i] = ukeStrings[i].match(reInts);
    }
    return frets;
  }

  /**
   * Returns array of the strings with placeholders instead of the numbers.
   * This helps us pack because "12" and "7" now occupy the same space horizontally.
   * @method getSymbols
   * @private
   * @param ukeStrings {array<string>}
   * @return {void}
   */
  function getSymbols(ukeStrings) {
    // convert to symbols
    const reDoubles = /([0-9]{2})/g;
    const reSingle = /([0-9])/g;
    const symbols = [];
    // TODO: verify why using NUM_STRINGS instead of ukeStrings.length (appears in other methods, again, do you recall why?)
    for (let i = 0; i < NUM_STRINGS; i++) {
      symbols[i] = ukeStrings[i].replace(reDoubles, '-*');
      symbols[i] = symbols[i].replace(reSingle, '*');
    }
    return symbols;
  }

  /**
   * Run through all of the strings (array) and return the length of the shortest one.
   * would prefer the max length, but then I'd need to pad the shorter ones and ... well, it's complicated.
   * this gets a TODO: get max!
   * @method getMinLineLength
   * @private
   * @param ukeStrings {array<string>}
   * @return {void}
   */
  function getMinLineLength(ukeStrings) {
    let minLength = 0;
    let line;
    const re = /-+$/gi;

    for (let i = 0; i < ukeStrings.length; i++) {
      line = ukeStrings[i].trim().replace(re, '');
      if (line.length > minLength) {
        minLength = line.length;
      }
    }
    return minLength;
  }

  /**
   * OK, having created symbolic representations for the lines in earlier steps
   * here we go through and "merge" them into a single, master "guide" -- saying
   * "somewhere on this beat you'll pluck (or not) one note". This normalized
   * guide will be the master for the next step.
   * @method getGuideLine
   * @private
   * @param symbols {undefined}
   * @param minLength {int}
   * @return {void}
   */
  function getGuideLine(symbols, minLength) {
    // Build a master pattern "guide" and eliminate double dashes
    let guide = '';
    for (let i = 0; i < minLength; i++) {
      if (symbols[0][i] == '|') {
        guide += '|';
      } else {
        // TODO: assumes 4 strings, use NUM_STRINGS
        guide += ((symbols[0][i] == '*') || (symbols[1][i] == '*') || (symbols[2][i] == '*') || (symbols[3][i] == '*')) ? '*' : '-';
      }
    }
    let reDash = /--/g;
    guide = guide.replace(reDash, '- ');
    reDash = / -/g;
    let lastGuide = guide;
    while (true) {
      guide = guide.replace(reDash, '  ');
      if (guide == lastGuide) {
        break;
      }
      lastGuide = guide;
    }
    return guide;
  }

  /**
   * Using the packed "guide" line we loop over the strings, rebuilding each string
   * with either a space, measure marker, or the note -- as an integer! Now the frets
   * are the same regardless of whether they are single or double digit numbers:
   * a "12" occupies no more horizontal space than a "5".
   * @method getPackedLines
   * @private
   * @param frets {undefined}
   * @param symbols {undefined}
   * @param guide {undefined}
   * @param minLength {int}
   * @return {void}
   */
  function getPackedLines(frets, symbols, guide, minLength) {
    // pack it!
    const packed = [];
    let chrNote = ''; // a temp variable to hold the 'note'
    let guideIdx; // loop index for guide string
    let stringIdx; // loop index for instrument's strings (uke's 4)
    let lineIdx; // index to single line within packed array (along a string)
    let fretCount; // fret marker counter

    for (stringIdx = 0; stringIdx < NUM_STRINGS; stringIdx++) {
      packed.push([]);
    }

    for (stringIdx = 0; stringIdx < NUM_STRINGS; stringIdx++) { // loop over lines
      lineIdx = 0;
      fretCount = 0;
      for (guideIdx = 0; guideIdx < minLength; guideIdx++) { // loop over guide
        if (guide[guideIdx] != ' ') {
          if (symbols[stringIdx][guideIdx] == '*') {
            chrNote = frets[stringIdx][fretCount];
            fretCount++;
          } else {
            chrNote = ((guide[guideIdx] == '|')) ? '|' : '-';
          }
          packed[stringIdx][lineIdx] = chrNote;
          lineIdx++;
        }
      }
    }
    return packed;
  }

  /**
   * Create the staff -- really the four tablature strings
   * @method drawStaff
   * @private
   * @param ugsImg {ukeGeeksImage} image builder tool instance
   * @param pos {xyPos} JSON (x,y) position
   * @param length {int} Length in pixels
   * @param mySettings {settingsObj}
   * @return {voie}
   */
  function drawStaff(ugsImg, pos, length, mySettings) {
    const offset = mySettings.lineWidth / 2;
    const x = pos.x + offset;
    let y = pos.y + offset;
    const staff = ugsImg.newGroup('staff').style({
      strokeColor: mySettings.lineColor,
      strokeWidth: mySettings.lineWidth,
    });
    for (let i = 0; i < NUM_STRINGS; i++) {
      staff.hLine(x, y, length);
      y += mySettings.lineSpacing;
    }
    staff.endGroup();
  }

  /**
   * Loop over the normalized tabs emitting the dots/fingers on the passed in canvase
   * @method drawNotes
   * @private
   * @param ugsImg {ukeGeeksImage} image builder tool instance
   * @param pos {xyPos} JSON (x,y) position
   * @param tabs {array} Array of normalized string data -- space (character) or int (fret number)
   * @param mySettings {settingsObj}
   * @param lineWidth {int} Length in pixels (used only when line ends with a measure mark)
   * @return {void}
   */
  function drawNotes(ugsImg, pos, tabs, mySettings, lineWidth) {
    let c;
    const center = {
      x: 0,
      y: pos.y,
    };

    for (const strIdx in tabs) {
      if (strIdx > 3) {
        return;
      }
      center.x = pos.x;
      for (const chrIdx in tabs[strIdx]) {
        c = tabs[strIdx][chrIdx];
        // (c != '-'){
        if (c == '|') {
          const jnum = parseInt(chrIdx, 10);
          const heavy = (((jnum + 1) < (tabs[strIdx].length - 1)) && (tabs[strIdx][jnum + 1] == '|')) || ((jnum == (tabs[strIdx].length - 1)) && (tabs[strIdx][jnum - 1] == '|'));
          drawMeasure(ugsImg, {
            x: (chrIdx == tabs[strIdx].length - 1) ? pos.x + lineWidth : center.x,
            y: pos.y,
          }, mySettings, heavy);
        } else if (!isNaN(c)) {
          ugsImg.circle(center.x, center.y, mySettings.dotRadius).style({
            fillColor: mySettings.dotColor,
          });
          ugsImg.text(center.x, center.y + 0.5 * mySettings.dotRadius, c).style({
            fontFamily: mySettings.textFont,
            fillColor: mySettings.textColor,
          });
        }
        center.x += mySettings.noteSpacing;
      }
      center.y += mySettings.lineSpacing;
    }
  }

  /**
   * Draws a vertical "measure" demarcation line
   * @method drawMeasure
   * @private
   * @param ugsImg {ukeGeeksImage} image builder tool instance
   * @param pos {xyPos} JSON (x,y) position
   * @param mySettings {settingsObj}
   * @param heavy {bool} if TRUE hevy line
   * @return {void}
   */
  function drawMeasure(ugsImg, pos, mySettings, heavy) {
    const offset = mySettings.lineWidth / 2;
    ugsImg.vLine(pos.x + offset, pos.y, (NUM_STRINGS - 1) * mySettings.lineSpacing).style({
      strokeColor: mySettings.lineColor,
      strokeWidth: (heavy ? 4.5 : 1) * mySettings.lineWidth,
    });
  }

  /**
   * Adds the string letters on the left-side of the canvas, before the tablature string lines
   * @method drawLabels
   * @private
   * @param ugsImg {ukeGeeksImage} image builder tool instance
   * @param pos {xyPos} JSON (x,y) position
   * @param mySettings {settingsObj}
   * @return {void}
   */
  function drawLabels(ugsImg, pos, mySettings) {
    // ['A','E','C','G'];
    const labels = settings.tuning.slice(0).reverse();
    for (let i = 0; i < NUM_STRINGS; i++) {
      ugsImg.text(1, (pos.y + (i + 0.3) * mySettings.lineSpacing), labels[i]).style({
        fontFamily: mySettings.labelFont,
        fillColor: mySettings.lineColor,
        textAlign: 'left',
      });
    }
  }

  module.exports = {
    init,
    replace,
  };
});
