/**
 * Resizes an overlay to fill the window (this is a 1.0, so "fill" is relative -- it gets much bigger)
 * @class resize
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/resize', (require, module) => {
  const $ = require('jQuery');

  let $dlg = null;
  let $aceLayer = null;
  let $help = null;
  let editor = null;

  /**
   * miliseconds to fade in/out editor
   * @property FADE_SPEED
   * @final
   * @type {Number}
   */
  const FADE_SPEED = 550;
  /**
   * miliseconds to slide in/out sidebar (help) panel
   * @property SLIDE_SPEED
   * @final
   * @type {Number}
   */
  const SLIDE_SPEED = 400;

  /**
   * Hold the current state of the dialog, we'll store this on the element in "data-sized" attribute
   * @attribute isBig
   * @type {Boolean}
   */
  let isBig = false;

  let isHelpOpen = false;

  /**
   * Initializer: preps handles and sets state varables.
   * @method setup
   * @private
   * @return {void}
   */
  function setup(dlgElement) {
    $dlg = $(dlgElement);
    $('body').append('<div id="aceHeader"><button class="aceSideBtn" title="Show options &amp; help"><span></span><span></span><span></span></button><strong>Edit Song</strong><a href="#exit-fullscreen">Exit fullscreen</a></div><div id="aceEditor"></div><div id="aceHelp"></div>');

    $aceLayer = $('#aceEditor');
    $aceLayer.fadeOut(1);

    $help = $('#aceHelp');

    $('#aceHeader a').click((e) => {
      e.preventDefault();
      hideAce();
    });
    $('#aceHeader button').click(onShowHelpClicked);
  }

  function onShowHelpClicked(e) {
    e.preventDefault();
    showHelp(!isHelpOpen);
  }

  function showHelp(isShow) {
    isHelpOpen = isShow;

    if (isShow) {
      $help.animate({
        left: 0,
      }, SLIDE_SPEED);
      $aceLayer.animate({
        left: '350px',
      }, SLIDE_SPEED);
    } else {
      $help.animate({
        left: '-350px',
      }, SLIDE_SPEED);
      $aceLayer.animate({
        left: 0,
      }, SLIDE_SPEED);
    }
  }

  /**
   * Returns the path of a linked script file (src) up to the starting position of fileName
   * @method getPath
   * @param  {string} fileName
   * @return {string}
   */
  function getPath(fileName) {
    let path = '';
    let lower;
    let pos;

    fileName = fileName.toLowerCase();

    $('script').each((index, item) => {
      lower = item.src.toLowerCase();
      pos = lower.indexOf(fileName);
      if (pos > 0) {
        path = item.src.substr(0, pos);
      }
    });
    return path;
  }

  function showAce() {
    isBig = true;

    $('html').addClass('aceEditorActive');
    $('.overlay').fadeOut(300);

    if (editor !== null) {
      // editor has already been initialized, safe to continue
      copySongToAce();
      return;
    }

    // only execute this block once (thus the null check)
    const path = getPath('ugsEditorPlus');

    LazyLoad.js(`${path}/ace/ace.js`, () => {
      editor = ace.edit('aceEditor');
      editor.setTheme('ace/theme/idle_fingers');
      editor.getSession().setMode('ace/mode/chordpro');
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
      });
      editor.completers = [ugsAce.chordCompleter];
      copySongToAce();

      $help.html(ugsAce.helpHtml);
    });
  }

  function copySongToAce() {
    $aceLayer.fadeIn(FADE_SPEED);
    editor.setValue($('#chordProSource').val());
    editor.gotoLine(1);
    $help.fadeIn(1);
  }

  /**
   * Restores overlay to original position(-ish -- not finished)
   * @method hideAce
   * @private
   * @return {void}
   */
  function hideAce() {
    isBig = false;

    $dlg.show();
    $aceLayer.fadeOut(FADE_SPEED);
    $help.fadeOut(FADE_SPEED);
    if (editor !== null) {
      $('#chordProSource').val(editor.getValue());
    }

    $('html').removeClass('aceEditorActive');
    showHelp(false);
  }

  /**
   * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
   * @method toggle
   * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
   * @return {void}
   */
  function toggle(dlgElement) {
    if ($dlg === null) {
      setup(dlgElement);
    }

    if (isBig) {
      hideAce();
    } else {
      showAce();
    }
    return false;
  }

  module.exports = {
    toggle,
  };
});
