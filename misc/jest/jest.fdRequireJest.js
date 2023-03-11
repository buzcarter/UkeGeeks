const path = require('path');

const srcRootPath = path.join(__dirname, '../../src/js/');

function loadAll() {
  const modules = [
    // ordered (for destructuring)
    'scriptasaurus/ukeGeeks.definitions',
    'scriptasaurus/ukeGeeks.settings',
    'scriptasaurus/ukeGeeks.data',
    // normal module includes
    'scriptasaurus/ukeGeeks.toolsLite',
    'scriptasaurus/ukeGeeks.chordImport',
    'scriptasaurus/ukeGeeks.transpose',
    'scriptasaurus/ukeGeeks.definitions.sopranoUkuleleGcea',
    'scriptasaurus/ukeGeeks.chordBrush',
    'scriptasaurus/ukeGeeks.chordParser',
    'scriptasaurus/ukeGeeks.cpmParser',
    'scriptasaurus/ukeGeeks.chordPainter',
    'scriptasaurus/ukeGeeks.tabs',
    'scriptasaurus/ukeGeeks.overlapFixer',
    'scriptasaurus/ukeGeeks.image',
    'scriptasaurus/ukeGeeks.imageSvg',
  ];

  // eslint-disable-next-line global-require
  modules.forEach((name) => require(path.join(srcRootPath, name)));
}

global.fdRequireJest = {
  loadAll,
};
