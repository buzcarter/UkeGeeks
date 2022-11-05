/**
 * Plots cursor moving across its own canvas context.
 * @class cursorCanvas
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
fdRequire.define('ugsChordBuilder/cursorCanvas', (require, module) => {
  // dependencies
  const optsCursor = ugsChordBuilder.settings.cursor;
  const optsDot = ugsChordBuilder.settings.dot;

  let _context = null;

  let _handImage = null;
  let _imgOk = false;

  let _dotCursor = true;
  let _finger = 1;

  let _lastPos = {
    x: 0,
    y: 0,
  };

  function init(ctx) {
    _context = ctx;
    loadImage();
  }

  function erase(pos) {
    const radius = optsCursor.radius + optsCursor.strokeWidth;
    // Need to allow for dot, image, and the finger number -- magic number for now:
    _context.clearRect(pos.x - radius, pos.y - radius, radius + 50, radius + 60);
    /*
    if (_imgOk) {
      _context.clearRect(pos.x - radius, pos.y - radius, radius + _handImage.width, radius + _handImage.height);
    } else {
      _context.clearRect(pos.x - radius, pos.y - radius, 2 * radius, 2 * radius);
    }
    */
  }

  function drawHandCursor(pos) {
    _context.drawImage(_handImage, pos.x, pos.y);

    _context.font = `${optsDot.fontWeight} ${optsDot.fontSize}px ${optsDot.fontFamily}`;
    _context.textAlign = 'left';
    _context.fillStyle = 'black'; // opts_dot.fontColor;
    _context.fillText(_finger, pos.x + 0.8 * _handImage.width, pos.y + _handImage.height);
    // not centering pos.x - 0.5 * _handImage.width, pos.y - 0.5 * _handImage.height);
  }

  function loadImage() {
    _handImage = new Image();
    _handImage.onload = () => {
      _imgOk = true;
    };
    _handImage.src = optsCursor.imageUri;
  }

  function drawDotCursor(pos) {
    _context.beginPath();
    _context.arc(pos.x, pos.y, optsCursor.radius, 0, 2 * Math.PI, false);
    _context.fillStyle = optsCursor.fillColor;
    _context.fill();
    _context.lineWidth = optsCursor.strokeWidth;
    _context.strokeStyle = optsCursor.strokeColor;
    _context.stroke();
  }

  function setCursor(isDot, finger) {
    _dotCursor = isDot;
    _finger = finger;
  }

  function draw(pos) {
    erase(_lastPos);
    if (!_imgOk || _dotCursor) {
      drawDotCursor(pos);
    } else {
      drawHandCursor(pos);
    }
    _lastPos = pos;
  }

  module.exports = {
    init,
    setCursor,
    draw,
  };
});
