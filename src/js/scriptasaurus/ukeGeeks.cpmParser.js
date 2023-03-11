fdRequire.define('scriptasaurus/ukeGeeks.cpmParser', (require, module) => {
  const ugsData = require('scriptasaurus/ukeGeeks.data');
  const chordImport = require('scriptasaurus/ukeGeeks.chordImport');
  const toolsLite = require('scriptasaurus/ukeGeeks.toolsLite');

  /**
  * Number of columns defined
   * @property _columnCount
  * @private
  * @type int
  */
  let columnCount = 1;

  /**
  * Under development, bool indicating whether any chords were found within the lyrics.
  * Helpful for tablature-only arrangements.
  * TODO: do not rely on this!!!
   * @property _hasChords
  * @private
  * @type bool
  */
  let hasChords = false; // TODO:

  /**
   * Song's key. May be set via command tag {key: C} otherwise use the first chord found (if available)
   * @property _firstChord
   * @private
   * @type string
   */
  let firstChord = '';

  /**
   * Again this is a constructor replacement. Just here for consistency. Does nothing.
   * @method init
   * @return {void}
   */
  function init() {}

  /**
   * Accepts CPM text, returning HTML marked-up text
   * @method parse
   * @param text {string} string RAW song
   * @return {songObject}
   */
  function parse(text) {
    const song = new ugsData.song();
    text = stripHtml(text);
    let songDom = domParse(text);
    songDom = parseInstr(songDom);
    songDom = parseSimpleInstr(songDom);
    songDom = markChordLines(songDom);
    song.body = doExport(songDom);
    if (columnCount > 1) {
      song.body = `<div class="${classNames.ColumnWrap} ${classNames.ColumnCount}${columnCount}">`
        + `<div class="${classNames.Column}">${song.body}</div>`
        + '</div>';
    }
    song.hasChords = hasChords;
    let tmp;
    // Song Title
    tmp = getInfo(songDom, blockTypeEnum.Title);
    if (tmp.length > 0) {
      song.title = tmp[0];
    }
    // Artist
    tmp = getInfo(songDom, blockTypeEnum.Artist);
    if (tmp.length > 0) {
      song.artist = tmp[0];
    }
    // Song Subtitle
    tmp = getInfo(songDom, blockTypeEnum.Subtitle);
    if (tmp.length > 0) {
      song.st = tmp[0];
    }
    if (tmp.length > 1) {
      song.st2 = tmp[1];
    }
    // Album
    tmp = getInfo(songDom, blockTypeEnum.Album);
    if (tmp.length > 0) {
      song.album = tmp[0];
    }
    // UkeGeeks "Extras"
    tmp = getInfo(songDom, blockTypeEnum.UkeGeeksMeta);
    if (tmp.length > 0) {
      song.ugsMeta = tmp;
    }
    // Key
    tmp = getInfo(songDom, blockTypeEnum.Key);
    if (tmp.length > 0) {
      song.key = tmp[0];
    } else if (firstChord !== '') {
      // Setting Key to first chord found
      song.key = firstChord;
    }
    // Chord Definitions
    tmp = getInfo(songDom, blockTypeEnum.ChordDefinition);

    tmp.forEach((t) => {
      song.defs.push(chordImport.runLine(`{define: ${t}}`));
    });
    return song;
  }

  /*
    TODO: add ukeGeeks Meta support:
    $regEx = "/{(ukegeeks-meta|meta)\s*:\s*(.+?)}/i";
  */
  const regExes = {
    blocks: /\s*{\s*(start_of_tab|sot|start_of_chorus|soc|end_of_tab|eot|end_of_chorus|eoc)\s*}\s*/im,
    tabBlock: /\s*{\s*(start_of_tab|sot)\s*}\s*/im,
    chorusBlock: /\s*{\s*(start_of_chorus|soc)\s*}\s*/im,
  };

  /**
  * All of the CSS classnames used by UkeGeeks JavaScript
   * @property _classNames
  * @private
  * @type JSON
  */
  let classNames = {
    Comment: 'ugsComment',
    Tabs: 'ugsTabs',
    Chorus: 'ugsChorus',
    PreChords: 'ugsChords', // preformatted with chords
    PrePlain: 'ugsPlain', // preformated, no chords
    NoLyrics: 'ugsNoLyrics', // preformated, chords ONLY -- no lyrics (text) between 'em
    ColumnWrap: 'ugsWrap',
    ColumnCount: 'ugsColumnCount',
    Column: 'ugsColumn',
    NewPage: 'ugsNewPage',
  };

  /**
  * Enumeration defining the types of nodes used within this class to parse CPM
   * @property _blockTypeEnum
  * @private
  * @type JSON-enum
  */
  let blockTypeEnum = {
    // Multiline Nodes
    TextBlock: 1, // temporary type, should be replaced with Chord Text or Plain Text
    ChorusBlock: 2,
    TabBlock: 3,
    // Single Line "Instruction" Nodes
    Comment: 101,
    Title: 102,
    Subtitle: 103,
    Album: 104,
    ChordDefinition: 105,
    UkeGeeksMeta: 106,
    ColumnBreak: 107, // Defining this as an instruction instead of a node since I'm not requiring a Begin/End syntax and it simplifies processing
    Artist: 108,
    NewPage: 109,
    Key: 110,
    // Text Types
    ChordText: 201,
    PlainText: 202,
    ChordOnlyText: 203, //
    // Undefined
    Undefined: 666,
  };

  /**
   * Retuns the block type (_blockTypeEnum) of passed in line.
   * @method _getBlockType
   * @private
   * @param line {songNode}
   * @return {_blockTypeEnum}
   */
  function getBlockType(line) {
    // TODO: verify line's type in documentation
    if (regExes.chorusBlock.test(line)) {
      return blockTypeEnum.ChorusBlock;
    }
    if (regExes.tabBlock.test(line)) {
      return blockTypeEnum.TabBlock;
    }
    return blockTypeEnum.TextBlock;
  }

  /**
   * Convert passed in song to HTML block
   * @method _export
   * @private
   * @param song {songNodeArray}
   * @return {strings}
   */
  function doExport(song) {
    const nl = '\n';
    let html = '';
    let nextType;
    song.forEach((songBlock, i) => {
      const { type } = songBlock;
      /*
      if (type == _blockTypeEnum.Title){
        html += '<h1>' + songBlock.lines[0] + '</h1>' + nl;
      }
      else if (type == _blockTypeEnum.Subtitle){
        html += '<h2>' + songBlock.lines[0] + '</h2>' + nl;
      }
      else if (type == _blockTypeEnum.Album){
        html += '<h3 class="ugsAlbum">' + songBlock.lines[0] + '</h3>' + nl;
      }
      else if (type == _blockTypeEnum.UkeGeeksMeta){
        html += '<h3>' + songBlock.lines[0] + '</h3>' + nl;
      }
      else
      */
      switch (type) {
        case blockTypeEnum.Comment:
          html += `<h6 class="${classNames.Comment}">${songBlock.lines[0]}</h6>${nl}`;
          break;
        case blockTypeEnum.NewPage:
          html += `<hr class="${classNames.NewPage}" />${nl}`;
          break;
        case blockTypeEnum.ChordText:
        case blockTypeEnum.PlainText:
        case blockTypeEnum.ChordOnlyText: {
          // TODO: beware undefined's!!!
          // Repack the text, only open/close <pre> tags when type changes
          // problem: exacerbates WebKit browsers' first chord position bug.
          if (songBlock.lines[0].length < 1) {
            // prevent empty blocks (usually caused by comments mixed in header tags)
            return;
          }
          let myClass = (type == blockTypeEnum.PlainText) ? classNames.PrePlain : classNames.PreChords;
          if (type == blockTypeEnum.ChordOnlyText) {
            myClass += ` ${classNames.NoLyrics}`;
          }
          const myType = type;
          const lastType = ((i - 1) >= 0) ? song[i - 1].type : blockTypeEnum.Undefined;
          nextType = ((i + 1) < song.length) ? nextType = song[i + 1].type : blockTypeEnum.Undefined;
          html += (lastType != myType) ? (`<pre class="${myClass}">`) : nl;
          html += songBlock.lines[0];
          html += (nextType != myType) ? (`</pre>${nl}`) : '';
        }
          break;
        case blockTypeEnum.ChorusBlock:
          html += `<div class="${classNames.Chorus}">${nl}`;
          html += doExport(songBlock.lines);
          html += `</div>${nl}`;
          break;
        case blockTypeEnum.TabBlock:
          html += `<pre class="${classNames.Tabs}">`;
          songBlock.lines.forEach((line) => {
            html += line + nl;
          });
          html += `</pre>${nl}`;
          break;
        case blockTypeEnum.TextBlock:
          html += doExport(songBlock.lines);
          break;
        case blockTypeEnum.ColumnBreak:
          html += `</div><div class="${classNames.Column}">`;
          break;
      }
    });
    return html;
  }

  /**
   * Debugging tool for Firebug. Echos the song's structure.
   * @method _echo
   * @private
   * @param song {songNodeArray}
   * @return {void}
  */
  // eslint-disable-next-line no-unused-vars
  function echo(song) {
    song.forEach((songBlock, i) => {
      // eslint-disable-next-line no-console
      console.log(`>> ${i}. ${songBlock.type} node, ${songBlock.lines.length} lines`);
      songBlock.lines.forEach((line) => {
        // eslint-disable-next-line no-console
        console.log(line);
      });
    });
  }

  /**
   * Explodes passed in text block into an array of songNodes ready for further parsing.
   * @method _domParse
   * @private
   * @param text {string}
   * @return {songNodeArray}
   */
  function domParse(text) {
    const song = [];
    let block = null;
    text.split('\n')
      .filter((line) => line[0] !== '#')
      .forEach((line) => {
        const isMarker = regExes.blocks.test(line);
        if (isMarker || block === null) {
          // save last block, start new one...
          if (block !== null) {
            song.push(block);
          }
          block = {
            type: getBlockType(line),
            lines: [],
          };
          if (!isMarker) {
            // Don't miss that first line!
            block.lines.push(line);
          }
        } else {
          const s = toolsLite.trim(line);
          if (s.length > 0) {
            block.lines.push(s);
          }
        }
      });

    if (block.lines.length) {
      song.push(block);
    }

    return song;
  }

  /**
 * Goes through songNodes, those nodes that are "instructions" are exploded and
 * a "the resulting "songDomElement" built, this songDomElement then replaces the
 * original line.
 *
 * The regular expression look for instructions with this format:
 * {commandVerb: commandArguments}
 *
 * @method _parseInstr
 * @private
 * @param song {songNodeArray}
 * @return {songNodeArray}
 */
  function parseInstr(song) {
    const regEx = {
      instr: /\{[^}]+?:.*?\}/im,
      cmdArgs: /\{.+?:(.*)\}/gi,
      cmdVerb: /\{(.+?)\s*:.*\}/gi,
    };

    song.forEach((songBlock) => {
      songBlock.lines = songBlock.lines.map((line) => {
        if (!regEx.instr.test(line)) {
          return line;
        }

        const args = line.replace(regEx.cmdArgs, '$1');
        let verb = line.replace(regEx.cmdVerb, '$1').toLowerCase();
        verb = verb.replace(/\r/, ''); // IE7 bug
        let blockType;

        switch (verb) {
          case 'title':
          case 't':
            blockType = blockTypeEnum.Title;
            break;
          case 'artist':
            blockType = blockTypeEnum.Artist;
            break;
          case 'subtitle':
          case 'st':
            blockType = blockTypeEnum.Subtitle;
            break;
          case 'album':
            blockType = blockTypeEnum.Album;
            break;
          case 'comment':
          case 'c':
            blockType = blockTypeEnum.Comment;
            break;
          case 'key':
          case 'k':
            blockType = blockTypeEnum.Key;
            break;
          case 'define':
            blockType = blockTypeEnum.ChordDefinition;
            break;
          case 'ukegeeks-meta':
            blockType = blockTypeEnum.UkeGeeksMeta;
            break;
          default:
            blockType = `Undefined-${verb}`;
            break;
        }

        return {
          type: blockType,
          lines: [toolsLite.trim(args)],
        };
      });
    });
    return song;
  }

  /**
   * A "Simple Instruction" is one that accepts no arguments. Presently this only handles Column Breaks.
   * @method _parseSimpleInstr
   * @private
   * @param song {songNodeArray}
   * @return {songNodeArray}
   */
  function parseSimpleInstr(song) {
    const regEx = {
      columnBreak: /\s*{\s*(column_break|colb|np|new_page)\s*}\s*/im,
    };
    song.forEach((songBlock) => {
      songBlock.lines = songBlock.lines.map((line) => {
        if (!regEx.columnBreak.test(line)) {
          return line;
        }

        const verb = line.replace(regEx.columnBreak, '$1').toLowerCase();
        switch (verb) {
          case 'column_break':
          case 'colb':
            columnCount++;
            line = {
              type: blockTypeEnum.ColumnBreak,
              lines: [],
            };
            break;
          case 'new_page':
          case 'np':
            line = {
              type: blockTypeEnum.NewPage,
              lines: [],
            };
            break;
        }
        return line;
      });
    });

    return song;
  }

  /**
   * Runs through songNodes and if the line contains at least one chord it's type is et to
   * ChordText, otherwise it's marked as "PlainText", meaning straight lyrics
   * @method _markChordLines
   * @private
   * @param song {songNodeArray}
   * @return {songNodeArray}
   */
  function markChordLines(song) {
    const regEx = {
      chord: /\[(.+?)]/i,
      allChords: /\[(.+?)]/img,
    };

    let chordFound;
    let hasOnlyChords;

    song
      .filter((songBlock) => songBlock.type == blockTypeEnum.TextBlock || songBlock.type === blockTypeEnum.ChorusBlock)
      .forEach((songBlock) => {
        songBlock.lines = songBlock.lines.map((line) => {
          if (typeof line !== 'string') {
            return line;
          }

          chordFound = regEx.chord.test(line);
          hasChords = hasChords || chordFound;
          hasOnlyChords = chordFound && (toolsLite.trim(line.replace(regEx.allChords, '')).length < 1);

          if (chordFound && firstChord === '') {
            const m = line.match(regEx.chord);
            if (m) {
              firstChord = m[1];
            }
          }

          return {
            // eslint-disable-next-line no-nested-ternary
            type: (hasOnlyChords ? blockTypeEnum.ChordOnlyText : (chordFound ? blockTypeEnum.ChordText : blockTypeEnum.PlainText)),
            lines: [line],
          };
        });
      });

    return song;
  }

  /**
   * Searches the songNodes for the specified block type, retunrs all matching node line (text) values.
   * @method _getInfo
   * @private
   * @param song {songNodeArray}
   * @param type {_blockTypeEnum}
   * @return {array}
   */
  function getInfo(song, type) {
    const rtn = [];
    song.forEach((songBlock) => {
      if (songBlock.type === type) {
        rtn.push(songBlock.lines[0]);
      } else if (songBlock.type === blockTypeEnum.TextBlock) {
        songBlock.lines
          .filter((line) => line.type === type)
          .forEach((line) => rtn.push(line.lines[0]));
      }
    });
    return rtn;
  }

  /**
   * Removes HTML "pre" tags and comments.
   * @method _stripHtml
   * @private
   * @param text {string}
   * @return {string}
   */
  function stripHtml(text) {
    const regEx = {
      pre: /<\/?pre>/img, // HTML <pre></pre>
      htmlComment: /<!--(.|\n)*?-->/gm, // HTML <!-- Comment -->
    };
    return text.replace(regEx.pre, '').replace(regEx.htmlComment, '');
  }

  /**
 * @module
 * Reads a text block and returns an object containing whatever ChordPro elements it recognizes.
 *
 * A cleaned, HTML version of song is included.
 */
  module.exports = {
    init,
    parse,
  };
});
