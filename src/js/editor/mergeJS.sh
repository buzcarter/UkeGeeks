#!/bin/bash
# Script to merge all the Editor and ChordBuilder JS
# !!! ORDER IS IMPORTANT !!!
cat \
ugsEditorPlus.namespace.js \
ugsEditorPlus.options.js \
ugsEditorPlus.actions.js \
ugsEditorPlus.songUi.js \
ugsEditorPlus.styles.js \
ugsEditorPlus.themes.js \
ugsEditorPlus.optionsDlg.js \
ugsEditorPlus.reformat.js \
ugsEditorPlus.autoReformat.js \
ugsEditorPlus.topMenus.js \
ugsEditorPlus.submenuUi.js \
ugsEditorPlus.newSong.js \
ugsEditorPlus.updateSong.js \
ugsEditorPlus.deleteSong.js \
ugsEditorPlus.typeahead.js \
ugsEditorPlus.resize.js \
ugsEditorPlus.chordBuilder.js \
ugsEditorPlus.songAmatic.js \
ugsEditorPlus.stickyChords.js \
ugsChordBuilder.js \
ugsChordBuilder.chooserList.js \
ugsChordBuilder.editorUi.js > ../../../js/ugsEditorPlus.merged.js
