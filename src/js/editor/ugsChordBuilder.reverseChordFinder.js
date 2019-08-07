/**
 *
 * @class reverseFinder
 * @namespace ugsChordBuilder
 */
ugsChordBuilder.reverseFinder = function() {
  //console.log('ugsChordBuilder.reverseFinder');
  var _cursorCanvas = null;

  var _chordDictionary = [];

  var _startingFret = 1;

  var init = function() {
    /*
    var ele = document.getElementById('startingFret');
    addStartingFretOptions(ele);
    ele.addEventListener('change', onFretChange, false);
    */

    _cursorCanvas = document.getElementById('reverseChordFinderCursorCanvas');
    if (!_cursorCanvas.getContext){
      return false;
    }

    var cursorContext = _cursorCanvas.getContext('2d');
    var diagramContext = document.getElementById('reverseChordFinderDiagramCanvas').getContext('2d');

    _cursorCanvas.addEventListener('mousemove', onMouseMove, false);
    _cursorCanvas.addEventListener('click', onMouseClick, false);

    ugsChordBuilder.chordCanvas.init(diagramContext, _cursorCanvas);
    ugsChordBuilder.cursorCanvas.init(cursorContext);

    redraw();
    return false;
  };
  /*
  var addStartingFretOptions = function(ele) {
    var s = '';
    for (var i = 1; i < 17; i++) {
      s += '<option value="' + i + '">' + i + '</option>';
    };
    ele.innerHTML = s;
  };

  var onFretChange = function(evt) {
    _startingFret = parseInt(this.value);
    redraw();
  };
*/
  var onMouseMove = function(evt) {
    ugsChordBuilder.cursorCanvas.draw(getPosition(_cursorCanvas, evt));
  };

  var onMouseClick = function(evt) {
    var pos = getPosition(_cursorCanvas, evt);
    var dot = ugsChordBuilder.tracking.toDot(pos);
    if (dot) {
      ugsChordBuilder.fretDots.toggleDot(dot);
      redraw(pos);
      updateMatchField();
    }
  };

  var getPosition = function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new ugsChordBuilder.entities.Position(
      evt.clientX - rect.left,
      evt.clientY - rect.top
    );
  };

  var redraw = function(pos) {
    pos = pos || new ugsChordBuilder.entities.Position(0, 0);
    ugsChordBuilder.chordCanvas.draw(pos, _startingFret);
  };

  var updateMatchField = function() {
    var fingerprint = getFingerprint();
    var matches = findMatches(fingerprint);
    var s = '';
    for (var i = 0; i < matches.length; i++) {
      s += '<li>' + matches[i] + '</li>';
    };
    document.getElementById('reverseChordFinderMyMatches').innerHTML = s;
    document.getElementById('reverseChordFinderFingerprint').innerHTML = fingerprint;
  };

  var preloadNotes = function() {
    ukeGeeks.definitions.addInstrument(ukeGeeks.definitions.sopranoUkuleleGcea);
    ukeGeeks.definitions.useInstrument();
    var definitions = ukeGeeks.definitions.getChords();
    _chordDictionary = [];
    for (var i = 0; i < definitions.length; i++) {
      _chordDictionary[definitions[i].name] = toNotes(definitions[i]);
    }
    //console.log(_chordDictionary['C']);
  };

  var findMatches = function(fingerprint) {
    var c = [];
    //console.log('find "' + fingerprint + '"');
    for (var key in _chordDictionary) {
      if (_chordDictionary[key] == fingerprint) {
        c.push(key)
      }
    }
    return c;
  };

  var getFingerprint = function() {
    var strings = ugsChordBuilder.export.getPrimaryFrets(_startingFret);
    for (var i = 0; i < strings.length; i++) {
      strings[i] = toNoteName(i, strings[i]);
    };
    return arrayToUniqueString(strings);;
  };

  var toNoteName = function(stringIndex, fret) {
    return ukeGeeks.transpose.shift(ugsChordBuilder.settings.fretBoard.stringNames[stringIndex], fret);
  };

  /**
   * returns "signature" for given chord's frets.
   * @method toNotes
   * @return {string}
   */
  var toNotes = function(chord) {
    var strings = [];
    for (var i = 0; i < ugsChordBuilder.settings.fretBoard.stringNames.length; i++) {
      strings.push(0);
    };

    for (var i = 0; i < chord.dots.length; i++) {
      if (strings[chord.dots[i].string] < chord.dots[i].fret) {
        strings[chord.dots[i].string] = chord.dots[i].fret;
      }
    };

    for (var i = 0; i < strings.length; i++) {
      strings[i] = toNoteName(i, strings[i]);
    };

    // TODO: include muted
    // console.log(chord.name + ': ' + s);
    return arrayToUniqueString(strings);
  };

  var toUnique = function(source) {
    // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
    var unique = {};
    var copied = [];
    for (var i = 0; i < source.length; i++) {
      if (unique.hasOwnProperty(source[i])) {
        continue;
      }
      unique[source[i]] = true;
      copied.push(source[i]);
    }
    return copied;
  };

  var sortAlpha = function(source) {
    // Sort credit:
    // http://stackoverflow.com/questions/17522877/sorting-an-array-based-on-alphabets
    return source.sort(function(a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
  };

  var arrayToUniqueString = function(source) {
    var copied = toUnique(source);
    copied = sortAlpha(copied);
    var s = '';
    for (var i = 0; i < copied.length; i++) {
      s += copied[i];
      if (i < copied.length - 1) {
        s += ' ';
      }
    };
    return s;
  };

  this.run = function() {
    init();
    preloadNotes();
  };

};
