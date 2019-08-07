/**
 *
 * @class chordFinder
 * @namespace ugsChordBuilder
 */
ugsChordBuilder.chordFinder = function() {
  //console.log('ugsChordBuilder.chordFinder');
  var _canvas = null,
    _context = null

  var _chord = {
    rootNote: 'A',
    chordType: ''
  };

  var init = function() {
    _canvas = document.getElementById('chordFinderMyCanvas');
    if (!_canvas.getContext){
      return false;
    }

    _context = _canvas.getContext('2d');

    var ele = document.getElementById('chordFinderRootNote');
    addRootOptions(ele);
    ele.addEventListener('change', onRootNoteChange, false);

    ele = document.getElementById('chordFinderChordType');
    addChordTypeOptions(ele);
    ele.addEventListener('change', onChordTypeChange, false);

    ukeGeeks.definitions.addInstrument(ukeGeeks.definitions.sopranoUkuleleGcea);
    ukeGeeks.definitions.useInstrument();

    ugsChordBuilder.chordCanvas.init(_context, _canvas);
    redraw();
    return true;
  };

  var addRootOptions = function(ele) {
    var notes = ['A', 'A#/Bb', 'B', 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab'];
    var s = '';
    var value = '';
    for (var i = 0; i < notes.length; i++) {
      value = notes[i].indexOf('/') > 0 ? notes[i].substring(0, notes[i].indexOf('/')) : notes[i];
      s += '<option value="' + value + '">' + notes[i] + '</option>';
    };
    ele.innerHTML = s;
  };

  var addChordTypeOptions = function(ele) {
    var chordTypes = ['maj', 'm', '7', 'm7', '7sus4', 'dim', 'aug', 'maj7', 'sus2', 'sus4', '6', 'm6', '9' ];
    var s = '';
    var value = '';
    for (var i = 0; i < chordTypes.length; i++) {
      value = chordTypes[i] == 'maj' ? '' : chordTypes[i];
      s += '<option value="' + value + '">' + chordTypes[i] + '</option>';
    };
    ele.innerHTML = s;
  };

  var redraw = function() {
    var name = _chord.rootNote + _chord.chordType;
    var definition = ukeGeeks.definitions.get(name);
    // clear
    for (var i = 0; i < ugsChordBuilder.settings.fretBoard.stringNames.length; i++) {
      ugsChordBuilder.fretDots.toggleDot(new ugsChordBuilder.entities.Dot(i));
    };
    // map definition to our render(er)
    for (var i = 0; i < definition.dots.length; i++) {
      if (definition.dots[i].fret > 0) {
        ugsChordBuilder.fretDots.toggleDot(new ugsChordBuilder.entities.Dot(definition.dots[i].string, definition.dots[i].fret));
      }
    };
    // draw, but hide the cursor
    ugsChordBuilder.chordCanvas.draw(new ugsChordBuilder.entities.Position(-100, -100), 1);
  };

  var onRootNoteChange = function(evt) {
    _chord.rootNote = this.value;
    redraw();
  };

  var onChordTypeChange = function(evt) {
    _chord.chordType = this.value;
    redraw();
  };

  this.run = function() {
    init();
  };

};
