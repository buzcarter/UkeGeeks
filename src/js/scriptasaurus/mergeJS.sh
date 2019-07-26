#!/bin/bash
# Script to merge all the SCRIPTASAURUS engine JS
# !!! ORDER IS IMPORTANT !!!
cat \
ukeGeeks.namespace.js \
ukeGeeks.definitions.js \
ukeGeeks.settings.js \
ukeGeeks.data.js \
ukeGeeks.toolsLite.js \
ukeGeeks.chordImport.js \
ukeGeeks.transpose.js \
ukeGeeks.definitions.sopranoUkuleleGcea.js \
ukeGeeks.canvasTools.js \
ukeGeeks.chordBrush.js \
ukeGeeks.chordParser.js \
ukeGeeks.cpmParser.js \
ukeGeeks.chordPainter.js \
ukeGeeks.tabs.js \
ukeGeeks.overlapFixer.js \
ukeGeeks.scriptasaurus.js > ../../../js/ukeGeeks.scriptasaurus.merged.js
