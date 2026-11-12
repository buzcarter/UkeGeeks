/**
 * <ul>
 * <li>Project: UkeGeeks' Song-a-matic Editor</li>
 * <li>Homepage: http://ukegeeks.org</li>
 * <li>Project Repository: https://github.com/buzcarter/UkeGeeks</li>
 * <li>Author: Buz Carter</li>
 * <li>Contact: buz@ukegeeks.org</li>
 * <li>Copyright: Copyright 2010-2014 Buz Carter.</li>
 * <li>License GNU General Public License (http://www.gnu.org/licenses/gpl.html)</li>
 * </ul>
 *
 * <h3>Overview</h3>
 * This library implments the UkeGeeks Scriptasaurus Song-a-matic editor functions, bridging the page UI and scriptasaurus methods.
 *
 * @module ugsEditorPlus
 * @main ugsEditorPlus
 **/
// Must stay var: ugsEditorPlus.reformat.ts declares it again in the same global scope
// (only var allows that), and a top-level var puts it on window for Studio and the Songbook.
// eslint-disable-next-line no-var -- see above
var ugsEditorPlus = window.ugsEditorPlus || {};
;/**
 * Tiny DOM helpers for the editor (replaces what the editor used to get from jQuery):
 * element lookup, show/hide, CSS-transition fades & slides, draggable dialogs, and
 * a JSON POST via fetch. No inline handlers or innerHTML here, so it's CSP friendly.
 * @class dom
 * @namespace ugsEditorPlus
 * @static
 */
ugsEditorPlus.dom = (function () {
    'use strict';
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * named speeds, in milliseconds (same as jQuery's)
     * @property SPEEDS
     * @private
     */
    const SPEEDS = {
        fast: 200,
        normal: 400,
        slow: 600
    };
    // running animations, per element: [{ props: [names], css: 'opacity 400ms ease', id: timer, fade: 'in'|'out' }]
    // (animations of different properties -- say a fade and a slide -- run side by side)
    const _running = new WeakMap();
    /**
     * Where selectors are looked up when no context is given: the element holding the
     * editor (set by songAmatic.init()), so the editor never picks up the host page's
     * elements. null: the whole page (pages that use these helpers without an editor).
     * @property _root
     * @private
     */
    let _root = null;
    _public.setRoot = function (root) {
        _root = root;
    };
    const toMs = function (speed) {
        if (typeof speed === 'number') {
            return speed;
        }
        return (speed && SPEEDS[speed]) || SPEEDS.normal;
    };
    /**
     * First element matching the CSS selector (within optional context element)
     * @method one
     * @param selector {string}
     * @param context {DOM-element} (optional) defaults to the editor's element (see setRoot), else document
     * @return {DOM-element|null}
     */
    _public.one = function (selector, context) {
        return (context || _root || document).querySelector(selector);
    };
    /**
     * All elements matching the CSS selector, as an Array
     * @method all
     * @param selector {string}
     * @param context {DOM-element} (optional) defaults to the editor's element (see setRoot), else document
     * @return {Array}
     */
    _public.all = function (selector, context) {
        return Array.prototype.slice.call((context || _root || document).querySelectorAll(selector));
    };
    /**
     * Returns ele if it's a `type`; throws otherwise. The editor's markup always has the elements
     * it looks up, so a missing one is a broken page: say which, rather than fail later on null.
     * @method checked
     * @private
     * @param ele {DOM-element|null} what the lookup found
     * @param what {string} the lookup, for the error message
     * @param type {function} constructor, e.g. HTMLInputElement
     * @return {DOM-element}
     */
    const checked = function (ele, what, type) {
        if (!(ele instanceof type)) {
            throw new Error('ugsEditorPlus: ' + what + (ele ? ' is not a ' + type.name : ' not found'));
        }
        return ele;
    };
    /**
     * The element with this id; throws if the page doesn't have it or it isn't a `type`
     * @method byId
     * @param id {string}
     * @param type {function} constructor, e.g. HTMLInputElement
     * @return {DOM-element}
     */
    _public.byId = function (id, type) {
        return checked(document.getElementById(id), '#' + id, type);
    };
    /**
     * First element matching the CSS selector (within optional context); throws like byId()
     * @method find
     * @param selector {string}
     * @param type {function} constructor, e.g. HTMLElement
     * @param context {DOM-element} (optional) defaults to the editor's element (see setRoot), else document
     * @return {DOM-element}
     */
    _public.find = function (selector, type, context) {
        return checked((context || _root || document).querySelector(selector), '"' + selector + '"', type);
    };
    /**
     * Nearest ancestor of ele (or ele itself) matching the CSS selector; throws like byId()
     * @method closest
     * @param ele {DOM-element}
     * @param selector {string}
     * @param type {function} constructor, e.g. HTMLElement
     * @return {DOM-element}
     */
    _public.closest = function (ele, selector, type) {
        return checked(ele.closest(selector), '"' + selector + '" around ' + ele.tagName, type);
    };
    /**
     * Attaches handler to the event on every element matching the selector (or to the element(s) passed in)
     * @method on
     * @param target {string|DOM-element|Array} CSS selector, element, or array of elements
     * @param eventName {string}
     * @param handler {function}
     */
    _public.on = function (target, eventName, handler) {
        const list = (typeof target === 'string') ? _public.all(target) : (Array.isArray(target) ? target : [target]);
        list.forEach(function (ele) {
            if (ele) {
                ele.addEventListener(eventName, handler);
            }
        });
    };
    /**
     * Is the element rendered (displayed)? Same rule as jQuery's ":visible"
     * @method isVisible
     * @param ele {DOM-element}
     * @return {bool}
     */
    _public.isVisible = function (ele) {
        return !!(ele && ele.getClientRects().length);
    };
    const running = function (ele) {
        return _running.get(ele) || [];
    };
    const setTransition = function (ele) {
        ele.style.transition = running(ele).map(function (anim) {
            return anim.css;
        }).join(', ');
    };
    // cancel running animations on ele (all of them, or just those touching propNames);
    // leaves the current inline values in place
    const stop = function (ele, propNames) {
        const keep = running(ele).filter(function (anim) {
            const isHit = !propNames || anim.props.some(function (name) {
                return propNames.indexOf(name) >= 0;
            });
            if (isHit) {
                clearTimeout(anim.id);
            }
            return !isHit;
        });
        _running.set(ele, keep);
        setTransition(ele);
    };
    const fadeDirection = function (ele) {
        const fades = running(ele).filter(function (anim) {
            return !!anim.fade;
        });
        const first = fades[0];
        return first ? first.fade : null;
    };
    const isHidden = function (ele) {
        return window.getComputedStyle(ele).display === 'none';
    };
    // display the element; when a stylesheet (or class) hides it fall back to "block"
    const display = function (ele) {
        ele.style.display = '';
        if (isHidden(ele)) {
            ele.style.display = 'block';
        }
    };
    /**
     * Transitions CSS properties from their start to end values.
     * @method animate
     * @param ele {DOM-element}
     * @param props {JSON} property name => [from, to] (or just "to", which starts from the current computed value)
     * @param speed {number|string} milliseconds or "fast", "slow"
     * @param onDone {function} (optional) called when complete (not when interrupted)
     * @return {JSON} the running animation
     */
    _public.animate = function (ele, props, speed, onDone) {
        const ms = toMs(speed);
        const computed = window.getComputedStyle(ele);
        // (Object.keys can't type its result: props' keys are CSS property names, as `animate` documents)
        const names = Object.keys(props);
        // snapshot the starting values BEFORE dropping any running transition: [property, start, end]
        const ends = names.map(function (name) {
            // (never undefined: `names` are props' own keys)
            const value = props[name] ?? '';
            return Array.isArray(value) ? [name, value[0], value[1]] : [name, computed[name], value];
        });
        // drop running transitions of these properties, jump to the start values
        stop(ele, names);
        ends.forEach(function ([name, start]) {
            ele.style[name] = start;
        });
        // force a reflow so the browser "sees" the start values before transitioning
        void ele.offsetWidth;
        const anim = {
            props: names,
            css: names.map(function (name) {
                return name.replace(/[A-Z]/g, '-$&').toLowerCase() + ' ' + ms + 'ms ease';
            }).join(', ')
        };
        _running.set(ele, running(ele).concat(anim));
        setTransition(ele);
        ends.forEach(function ([name, , end]) {
            ele.style[name] = end;
        });
        anim.id = setTimeout(function () {
            _running.set(ele, running(ele).filter(function (other) {
                return other !== anim;
            }));
            setTransition(ele);
            if (onDone) {
                onDone();
            }
        }, ms);
        return anim;
    };
    /**
     * Display element immediately (cancels any fade)
     * @method show
     * @param ele {DOM-element}
     */
    _public.show = function (ele) {
        if (!ele) {
            return;
        }
        stop(ele);
        ele.style.opacity = '';
        display(ele);
    };
    /**
     * Hide element immediately (cancels any fade)
     * @method hide
     * @param ele {DOM-element}
     */
    _public.hide = function (ele) {
        if (!ele) {
            return;
        }
        stop(ele);
        ele.style.opacity = '';
        ele.style.display = 'none';
    };
    /**
     * show() or hide() element
     * @method toggle
     * @param ele {DOM-element}
     * @param isShow {bool}
     */
    _public.toggle = function (ele, isShow) {
        if (isShow) {
            _public.show(ele);
        }
        else {
            _public.hide(ele);
        }
    };
    /**
     * @method fadeIn
     * @param ele {DOM-element}
     * @param speed {number|string} (optional)
     */
    _public.fadeIn = function (ele, speed) {
        if (!ele || (!isHidden(ele) && fadeDirection(ele) !== 'out')) {
            return;
        }
        const from = isHidden(ele) ? 0 : parseFloat(window.getComputedStyle(ele).opacity);
        display(ele);
        _public.animate(ele, { opacity: [String(from), '1'] }, speed, function () {
            ele.style.opacity = '';
        }).fade = 'in';
    };
    /**
     * @method fadeOut
     * @param ele {DOM-element}
     * @param speed {number|string} (optional)
     */
    _public.fadeOut = function (ele, speed) {
        if (!ele || isHidden(ele) || fadeDirection(ele) === 'out') {
            return;
        }
        _public.animate(ele, { opacity: '0' }, speed, function () {
            ele.style.display = 'none';
            ele.style.opacity = '';
        }).fade = 'out';
    };
    /**
     * fadeIn if hidden (or fading out), fadeOut otherwise
     * @method fadeToggle
     * @param ele {DOM-element}
     * @param speed {number|string} (optional)
     */
    _public.fadeToggle = function (ele, speed) {
        if (isHidden(ele) || fadeDirection(ele) === 'out') {
            _public.fadeIn(ele, speed);
        }
        else {
            _public.fadeOut(ele, speed);
        }
    };
    /**
     * Reveals element by growing its height
     * @method slideDown
     * @param ele {DOM-element}
     * @param speed {number|string} (optional)
     */
    _public.slideDown = function (ele, speed) {
        if (!ele || !isHidden(ele)) {
            return;
        }
        display(ele);
        const height = ele.offsetHeight;
        ele.style.overflow = 'hidden';
        _public.animate(ele, { height: ['0px', height + 'px'] }, speed, function () {
            ele.style.height = '';
            ele.style.overflow = '';
        });
    };
    /**
     * Makes the element (a fixed or absolutely positioned dialog) draggable by its handle.
     * Uses pointer events, so mouse, pen & touch all work.
     * @method draggable
     * @param ele {DOM-element} the element that moves
     * @param handleSelector {string} (optional) CSS selector of the "grab" area inside ele; default: ele itself
     */
    _public.draggable = function (ele, handleSelector) {
        const found = handleSelector ? ele.querySelector(handleSelector) : ele;
        if (!(found instanceof HTMLElement)) {
            return;
        }
        const handle = found;
        let drag = null;
        handle.style.cursor = 'move';
        handle.style.touchAction = 'none';
        handle.addEventListener('pointerdown', function (e) {
            if (e.button !== 0 || (e.target instanceof Element && e.target.closest('a, button, input, select, textarea'))) {
                return;
            }
            const rect = ele.getBoundingClientRect();
            drag = {
                id: e.pointerId,
                dx: e.clientX - rect.left,
                dy: e.clientY - rect.top
            };
            // pin position to top/left so moving doesn't stretch/shrink the box
            ele.style.width = window.getComputedStyle(ele).width;
            ele.style.right = 'auto';
            ele.style.bottom = 'auto';
            ele.style.zIndex = '1000';
            ele.classList.add('draggable');
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        handle.addEventListener('pointermove', function (e) {
            if (!drag || e.pointerId !== drag.id) {
                return;
            }
            // keep the handle on screen
            const left = Math.min(Math.max(e.clientX - drag.dx, 40 - ele.offsetWidth), window.innerWidth - 40);
            const top = Math.min(Math.max(e.clientY - drag.dy, 0), window.innerHeight - 30);
            ele.style.left = left + 'px';
            ele.style.top = top + 'px';
        });
        const endDrag = function (e) {
            if (!drag || e.pointerId !== drag.id) {
                return;
            }
            drag = null;
            ele.style.zIndex = '';
            ele.classList.remove('draggable');
        };
        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', endDrag);
    };
    /**
     * POSTs data as JSON, expects JSON back.
     * @method postJson
     * @param uri {string}
     * @param data {JSON}
     * @return {Promise} resolves with the parsed response; rejects on network error, non-2xx status, or bad JSON
     */
    _public.postJson = function (uri, data) {
        return fetch(uri, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        });
    };
    /**
     * Fires a custom event on document
     * @method trigger
     * @param eventName {string}
     * @param detail {JSON} available to listeners as event.detail
     */
    _public.trigger = function (eventName, detail) {
        document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * Options (Features) you can turn on or off. Where available defaults to values defined in UkeGeeks.settings
 *
 * @class options
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.options = {
    /**
     * If true attempts compatibility for versions of Microsoft Internet Explorer prior to IE9
     * @example
     *  Allowed values: true, false
     * @property useLegacyIe
     * @type Boolean
     * @default false
     * @deprecated Does nothing: Song Formatter ignores it. Kept so pages that set it still work.
     */
    useLegacyIe: false,
    /**
     * Folder (with a trailing slash) holding ace-chordpro.min.js, loaded when the Fullscreen editor opens.
     * Empty means "ace/" next to the folder ugsEditorPlus.min.js was loaded from.
     * @example
     *  "/js/ace/"
     * @property aceUrl
     * @type Text
     * @default ""
     */
    aceUrl: "",
    /**
     * If true the Edit Song box is shown when the page loads; false hides it.
     * @example
     *  Allowed values: true, false
     * @property showEditOnLoad
     * @type Boolean
     * @default true
     */
    showEditOnLoad: true,
    /**
     * Lyric's font size (pts)
     * @example
     *  Allowed values: 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 13, 14
     * @property fontSize
     * @type Number
     * @default 12
     */
    fontSize: 12,
    /**
     * Reference diagram size expressed as a percentage (100% being max)
     * @example
     *  Allowed values: 40 ("tiny"), 65 ("small"), 80 ("medium"), 90 ("large"), 100 ("x-large")
     * @property diagramSize
     * @type Integer
     * @default 100
     */
    diagramSize: 100,
    /**
     * Specify where reference diagrams should be show
     * @example
     *  Allowed values: left, top, or none
     * @property diagramPosition
     * @type Text
     * @default left
     */
    diagramPosition: "left",
    /**
     * Specify how chord names within lyrics should be shown
     * @example
     *  Allowed values: inline, above, or miniDiagrams
     * @property lyricStyle
     * @type Text
     * @default above
     */
    lyricStyle: "above",
    /**
     * Specify page width (mock paper)
     * @example
     *  Allowed values: letter, a4, screen
     * @property paper
     * @type Text
     * @default letter
     */
    paper: "letter",
    /**
     * Theme shortname applied on page load.
     * @example
     *  Allowed values: frosty, jellyBean, justBlack, krampus, normal, notebook, pumpkin, reversed, western, zombie
     * @property theme
     * @type Text
     * @default normal
     */
    theme: "normal",
    /**
     * Ukulele tuning ("instrument") for drawing diagrams.
     * @example
     *  Allowed values: soprano or baritone
     * @property tuning
     * @type Text
     * @default soprano
     */
    tuning: "soprano",
    /**
     * Show/hide the square brackets around chord names within lyrics, ex: [Am]
     * @example
     *  Allowed values: true, false
     * @property hideChordEnclosures
     * @type Boolean
     * @default see UkeGeeks.settings
     */
    hideChordEnclosures: false,
    /**
     * Order in which reference diagrams are sorted, either alphabetically (true) or order
     * in which they appear within the song (false).
     * @example
     * Allowed values: true, false
     * @property sortAlphabetical
     * @type Boolean
     * @default see UkeGeeks.settings
     */
    sortAlphabetical: false,
    /**
     * If TRUE chords in the "commonChords" list will be ignored (excluded from reference chord diagrams)
     * @example
     * Allowed values: true, false
     * @property ignoreCommonChords
     * @type Boolean
     * @default see UkeGeeks.settings
     */
    ignoreCommonChords: false,
    /**
     * Array of chords to be ignored when drawing reference diagrams (if "ignoreCommonChords" is enabled)
     * @example
     *  (string or array of strings): as an  array of strings: ["A", "G"] or comma delimited list: "A, G"
     * @property commonChords
     * @type mixed
     * @default see UkeGeeks.settings
     */
    commonChords: []
};
;/**
 * The song's text, wherever it's being edited, and telling the host page when it changes.
 *
 * The text lives in the Edit Song box (#chordProSource), or in Ace while Fullscreen is
 * open. Typing fires the box's own "input" event; code that sets the text (Transpose,
 * Reformat, the Chord Builder, Fullscreen) calls changed().
 *
 * @class songText
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.songText = (function () {
    const _public = {};
    let _handler = null;
    /** the text the host was last told about (at first: the text the editor opened with) */
    let _lastText = null;
    const box = () => ugsEditorPlus.dom.byId('chordProSource', HTMLTextAreaElement);
    _public.init = function () {
        _lastText = box().value;
        box().addEventListener('input', _public.changed);
    };
    _public.get = function () {
        const fullscreenText = ugsEditorPlus.resize.getText();
        return fullscreenText !== null ? fullscreenText : box().value;
    };
    _public.changed = function () {
        const text = _public.get();
        if (text === _lastText) {
            return;
        }
        _lastText = text;
        if (!_handler) {
            return;
        }
        try {
            _handler(text);
        }
        catch (err) {
            // the host's problem: the editor carries on
            console.error('[ugsEditorPlus] onChange:', err);
        }
    };
    _public.setChangeHandler = function (handler) {
        _handler = typeof handler === 'function' ? handler : null;
    };
    return _public;
})();
;/**
 * Does the work by providing "doAction" method to respond to events (does not
 * attach event handlers); Modifes some page elements -- adjust CSS classes on page,
 * runs Scriptasaurus, etc.
 * @class actions
 * @namespace ugsEditorPlus
 * @module ugsEditorPlus
 */
ugsEditorPlus.actions = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @public
     * @type JsonObject
     */
    const _public = {};
    /**
     * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
     * @property _ele
     * @private
     * @type {JSON}
     */
    let _ele = {};
    // misc
    let _song = null;
    //
    let _originalSource = null;
    let _originalChords = [];
    const _regEx = {
        safe: /^([A-G][#b]?)(m|m6|7|m7|dim|maj7|6|sus2|sus4|aug|9)?$/
    };
    /**
     * associative array/JSON of last click value used; intended to be used to prevent
     * rerunning more expensize operations unnecessailry (when the value didn't actually change)
     * @property _prevValues
     * @type {JSON}
     */
    const _prevValues = {
        'placement': 'above',
        'transpose': 'up_0'
    };
    /**
     * Sets up this class; modifies form elements; attaches event handlers, etc
     * @method init
     * @public
     */
    _public.init = function () {
        const dom = ugsEditorPlus.dom;
        _ele = {
            songText: dom.byId('ukeSongText', HTMLElement),
            songContainer: dom.byId('ukeSongContainer', HTMLElement),
            cpmSource: dom.byId('chordProSource', HTMLTextAreaElement),
            scalableArea: dom.byId('scalablePrintArea', HTMLElement)
        };
        document.addEventListener('ugs:option', function (e) {
            doAction(e.detail);
        });
        syncOptions(ugsEditorPlus.options);
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Common "All Powerful" Helper Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * Executes the requested Action using passed in Value
     * @method doAction
     * @private
     * @param change {OptionChange} the event's detail: the Action's name (one of those in the switch below)
     *   and its value (a string from a menu, a boolean from a checkbox)
     */
    const doAction = function (change) {
        // actions that modify song's HTML or reference diagrams require rerunning Scriptasaurus
        let runRequired = false;
        // (for the log below: events come from the page, so an unknown action can still arrive)
        const action = change.action, value = change.value;
        switch (change.action) {
            case 'zoomFonts':
                doSetFontSize(change.value);
                break;
            case 'zoomDiagrams':
                doSetDiagramSize(change.value);
                break;
            case 'layout':
                doLayout(change.value);
                break;
            case 'placement':
                runRequired = doPlacement(change.value);
                break;
            case 'tuning':
                doTuning(change.value);
                runRequired = true;
                break;
            case 'colors':
                doSetTheme(change.value);
                runRequired = true;
                break;
            case 'transpose':
                doTranspose(change.value);
                break;
            case 'paper':
                doSetPageWidth(change.value);
                break;
            case 'showEnclosures':
                setEnclosureVisible(change.value);
                runRequired = true;
                break;
            case 'hideCommonChords':
                setIgnoreCommon(change.value);
                runRequired = true;
                break;
            case 'sortAlphabetical':
                setSortAlphabetical(change.value);
                runRequired = true;
                break;
            case 'setCommonChords':
                setCommonChordsList(change.value);
                runRequired = ukeGeeks.settings.opts.ignoreCommonChords;
                break;
            case 'update':
                doUpdate();
                break;
            default:
                console.log('Unrecognized ' + action + ' > ' + value);
        }
        if (runRequired) {
            _public.run();
        }
    };
    const syncOptions = function (options) {
        // direct menus
        doSetFontSize(options.fontSize);
        doSetDiagramSize(options.diagramSize);
        doLayout(options.diagramPosition);
        doSetPageWidth(options.paper);
        doSetTheme(options.theme);
        doTuning(options.tuning);
        doPlacement(options.lyricStyle);
        // advanced options
        setEnclosureVisible(!options.hideChordEnclosures);
        setIgnoreCommon(options.ignoreCommonChords);
        setCommonChordsList(options.commonChords);
        setSortAlphabetical(options.sortAlphabetical);
    };
    /**
     * Rerun for new song text; updates UI
     * @method doUpdate
     * @private
     */
    const doUpdate = function () {
        _public.run(true);
    };
    /**
     * Rebuilds song, info, chord diagrams using current settings.
     * @method run
     * @param isDoBackup {bool} true forces backup; optional, default false.
     */
    _public.run = function (isDoBackup) {
        isDoBackup = (arguments.length > 0) && isDoBackup;
        // run(markup) HTML-escapes the raw (untrusted) ChordPro text for us
        _song = ukeGeeks.scriptasaurus.run(_ele.cpmSource.value);
        if (_song && _song.chords.length < 1) {
            ugsEditorPlus.autoReformat.run(_ele);
        }
        if (_song) {
            ugsEditorPlus.songUi.update(_song);
            // maintains last copy of USER edited song -- used for transpose etc
            if (isDoBackup || (_originalSource === null)) {
                _originalSource = _ele.cpmSource.value;
                _originalChords = _song.chords;
                const key = _song.key !== '' ? _song.key : (_song.chords[0] ?? '');
                resetTranspose(key);
            }
        }
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Zoom Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * Zooms (scales) fonts
     * @method doSetFontSize
     * @private
     * @param value {string|number} point-size: the clicked menu item's value (string) or options.fontSize (number)
     */
    const doSetFontSize = function (value) {
        const pt = parseFloat(String(value));
        _ele.scalableArea.style.fontSize = pt + 'pt';
    };
    /**
     * Zooms (scales) chord diagrams
     * @method doSetDiagramSize
     * @private
     * @param value {string} percentage, integer between 0 and, well, 100?; value of the clicked value item
     */
    const doSetDiagramSize = function (value) {
        const prct = parseInt(String(value), 10) / 100;
        // apologies for the magic number...
        const columnWidth = Math.round(prct * 225);
        const s = ugsEditorPlus.styles.getSheet('ugsEditorCss');
        // the editor's stylesheet has these rules; without them (or without title="ugsEditorCss"), say so
        const rule = function (selector) {
            const found = s.find(selector);
            if (!found) {
                throw new Error('ugsEditorPlus: no "' + selector + '" rule in the stylesheet titled "ugsEditorCss"');
            }
            return found;
        };
        let m = rule('.scalablePrintArea .ugs-diagrams-wrap svg');
        m.style.width = Math.round(prct * ukeGeeks.settings.fretBox.width) + 'px';
        m.style.height = Math.round(prct * ukeGeeks.settings.fretBox.height) + 'px';
        m = rule('.scalablePrintArea .ugs-diagrams-wrap');
        m.style.width = columnWidth + 'px';
        m = rule('.scalablePrintArea .ugs-source-wrap');
        m.style.marginLeft = (25 + columnWidth) + 'px';
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Layout (Reference Diagram Position) Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * Changes positions for Reference Chord Diagrams -- handled entirely via CSS classes
     * @method doLayout
     * @private
     * @param value {string} value of the clicked value item
     */
    const doLayout = function (value) {
        const classes = document.body.classList;
        classes.toggle('diagramsOnTop', value === 'top');
        classes.toggle('diagramsOnSide', value === 'left');
        classes.toggle('ugsHideDiagrams', value === 'none');
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Chord Name Placement Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * Chord Name placement (&amp; "Mini-chord diagrams"). Returns true if Scriptasaurus should be rerun.
     * @method doPlacement
     * @private
     * @param value {string} value of the clicked value item
     * @return {Boolean}
     */
    const doPlacement = function (value) {
        let isRunRequired = false;
        ukeGeeks.toolsLite.setClass(_ele.songContainer, 'ugsInline', (value === 'inline'));
        // NOTE: ugs already adds the "chord diagrams above" class based on setting,
        // BUT does NOT remove it!!!!
        const isMiniDiagrams = (value === 'miniDiagrams');
        if (!isMiniDiagrams) {
            ukeGeeks.toolsLite.removeClass(_ele.songContainer, 'ugsInlineDiagrams');
        }
        if (isMiniDiagrams || (_prevValues.placement === 'miniDiagrams')) {
            ukeGeeks.settings.inlineDiagrams = isMiniDiagrams;
            isRunRequired = true;
        }
        else if (!isMiniDiagrams && (_prevValues.placement !== 'miniDiagrams')) {
            // we're jumping between "above" and "inline", either way we need to
            // manually fix the overlaps
            ukeGeeks.overlapFixer.Fix(_ele.songText);
        }
        _prevValues.placement = value;
        return isRunRequired;
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Color Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * Change the color scheme -- requires changing CSS Class and reruning (to regenerate reference chord diagrams)
     * @method doSetTheme
     * @private
     * @param value {string} value of the clicked value item
     */
    const doSetTheme = function (value) {
        ugsEditorPlus.themes.set(value);
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Page Width Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * (option dialog) changes body class, moving the right page edge
     * @method doSetPageWidth
     * @private
     * @param value {string} currently selected option value
     */
    const doSetPageWidth = function (value) {
        const opts = ['letter', 'a4', 'screen'];
        const classes = document.body.classList;
        for (let i = 0; i < opts.length; i++) {
            classes.remove('pageWidth_' + opts[i]);
        }
        classes.add('pageWidth_' + value);
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Instrument & Tuning Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * Change the instrument (tuning)
     * @method doTuning
     * @private
     * @param value {string} value of the clicked value item
     */
    const doTuning = function (value) {
        let tuning = ukeGeeks.definitions.instrument.sopranoUke, msg = '<strong>GCEA</strong> Standard Ukulele';
        if (value === 'baritone') {
            tuning = ukeGeeks.definitions.instrument.baritoneUke;
            msg = '<strong>DGBE</strong> Baritone Ukulele';
        }
        if (value === 'alternate') {
            tuning = ukeGeeks.definitions.instrument.alternateUke;
            msg = '<strong>ADF#B</strong> alternate tuning';
        }
        ugsEditorPlus.dom.byId('footTuningInfo', HTMLElement).innerHTML = msg;
        ukeGeeks.scriptasaurus.setTuningOffset(tuning);
    };
    /**
     * Parses Value to decide number of steps "up" or "down", then fires off transpose
     * @method doTranspose
     * @private
     * @param value {string} value of the clicked value item
     */
    const doTranspose = function (value) {
        const sign = value[0] === 'u' ? 1 : -1;
        const steps = parseInt(value.slice(-1), 10);
        transpose(sign * steps);
    };
    /**
     * Rebuilds song as "run", but first transposes chords
     * @method transpose
     * @param steps {int} number of semitones, +/-6
     */
    const transpose = function (steps) {
        const safeChords = [];
        let bad = '', i;
        // find "shiftable" chords
        for (const chord of _originalChords) {
            if (_regEx.safe.test(chord)) {
                safeChords.push(chord);
            }
            else {
                bad += chord + ', ';
            }
        }
        if (bad.length > 0) {
            if (!confirm('Sorry, but some of your chords can\'t be transposed:\n' + bad + '\n\nDo you want to continue anyway?')) {
                return;
            }
        }
        // (run() keeps the original song before anything can transpose)
        if (_originalSource === null) {
            return;
        }
        const newChords = ukeGeeks.transpose.shiftChords(safeChords, steps);
        let s = _originalSource;
        let rEx;
        // "safe" (temp) rename chords (prepend noise "ugsxx_" so a renamed G will be distinguisable from a new G)
        for (i = 0; i < safeChords.length; i++) {
            rEx = new RegExp('\\[' + safeChords[i] + '\\]', 'g');
            s = s.replace(rEx, '[ugsxx_' + i + ']');
        }
        // final rename; placeholder names to desired names
        for (i = 0; i < newChords.length; i++) {
            rEx = new RegExp('\\[ugsxx_' + i + '\\]', 'g');
            s = s.replace(rEx, '[' + newChords[i] + ']');
        }
        // find & replace {key} command (if present)
        rEx = /^\s*\{\s*(key|k)\s*:\s*(\S*?)\s*\}\s*$/im;
        const m = s.match(rEx);
        if (m) {
            const key = m[2] ?? '';
            // (shift() knows every "safe" chord)
            const newKey = (key !== '') && _regEx.safe.test(key) ? ukeGeeks.transpose.shift(key, steps) : null;
            if (newKey !== null) {
                s = s.replace(rEx, m[0].replace(key, newKey));
            }
        }
        // manipulations done, ready to...
        _ele.cpmSource.value = s;
        ugsEditorPlus.songText.changed();
        _public.run();
    };
    /**
        * Sets Transpose menu's selected value to "Original"; adds example chord names
        * @method resetTranspose
        * @private
        * @param keyChord {string}
        */
    const resetTranspose = function (keyChord) {
        const ul = ugsEditorPlus.dom.byId('transposeOptions', HTMLElement);
        const items = ul.getElementsByTagName('li');
        let sample;
        let steps = -6;
        _prevValues['transpose'] = 'up_0';
        ugsEditorPlus.submenuUi.resetTransposeLabel();
        for (const item of items) {
            ukeGeeks.toolsLite.removeClass(item, 'ugsEditor-checked');
            sample = (keyChord.length < 1) ? '' : ukeGeeks.transpose.shift(keyChord, steps);
            // (shift() returns null for a chord it doesn't know; innerHTML treated that as '')
            const em = item.getElementsByTagName('em')[0];
            if (em) {
                em.innerHTML = sample || '';
            }
            if (steps === 0) {
                ukeGeeks.toolsLite.addClass(item, 'ugsEditor-checked');
            }
            steps++;
        }
    };
    /* ----------------------------------------------------------------------------------- *|
    |* "Other Options" Methods
    |* ----------------------------------------------------------------------------------- */
    // a grab bag of single, odd switches... mea culpa
    /**
     * (option dialog) change whether to show/hide the bracket characters
     * @method setEnclosureVisible
     * @private
     * @param isVisible {bool}
     */
    const setEnclosureVisible = function (isVisible) {
        ukeGeeks.settings.opts.retainBrackets = isVisible;
    };
    /**
     * (option dialog) change whether reference diagrams are sorted alphabetically or by their "song order"
     * @method setSortAlphabetical
     * @private
     * @param isAlphabetical {bool}
     */
    const setSortAlphabetical = function (isAlphabetical) {
        ukeGeeks.settings.opts.sortAlphabetical = isAlphabetical;
    };
    /**
     * "Ignore Common" was checked, need to update master chord diagrams
     * @method setIgnoreCommon
     * @private
     * @param isIgnore {bool}
     */
    const setIgnoreCommon = function (isIgnore) {
        ukeGeeks.settings.opts.ignoreCommonChords = isIgnore;
    };
    /**
     * the list of common chords has been change; update UGS setting
     * @method setCommonChordsList
     * @private
     * @param chordList {mixed} Either string, as comma seperated values list, or array of chord names
     * @return {void}
     */
    const setCommonChordsList = function (chordList) {
        if (typeof chordList === 'string') {
            const inputList = chordList.split(/[ ,]+/);
            const cleanList = [];
            for (const input of inputList) {
                const c = ukeGeeks.toolsLite.trim(input);
                if (c.length > 0) {
                    cleanList.push(c);
                }
            }
            chordList = cleanList;
        }
        ukeGeeks.settings.commonChords = chordList;
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * Handles transfering the easy text bits of a Song -- title, artist, etc -- to the page.
 * @class songUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.songUi = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * Sets an element's Inner HTML and sets visibility based on whether the value is empty (or not)
     * @method trySet
     * @private
     * @param id {string} element's Id
     * @param value {string} content value
     */
    const trySet = function (id, value) {
        const hasValue = value && (value.length > 0);
        const h = document.getElementById(id);
        if (!h) {
            return;
        }
        h.innerHTML = hasValue ? value : "";
        h.style.display = hasValue ? 'block' : 'none';
    };
    /**
        * Update various HTML parts (H1 &amp; H2 etc.) using TEXT values of Song
        * @method updateUi
        * @private
        * @param song {Song(Object)}
        */
    _public.update = function (song) {
        let h = ugsEditorPlus.dom.byId('songTitle', HTMLElement);
        h.innerHTML = (song.title.length > 0) ? song.title : 'Untitled-Song';
        trySet('songArtist', song.artist);
        trySet('songAlbum', song.album);
        trySet('songSubtitle', song.st);
        h = ugsEditorPlus.dom.byId('songMeta', HTMLElement);
        if (!song.ugsMeta || (song.ugsMeta.length < 1)) {
            h.style.display = 'none';
        }
        else {
            let s = '';
            for (let i = 0; i < song.ugsMeta.length; i++) {
                s += '<p>' + song.ugsMeta[i] + '</p>';
            }
            h.innerHTML = s;
            h.style.display = 'block';
        }
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * from: http://www.javascriptkit.com/dhtmltutors/externalcss.shtml
 * @class styles
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.styles = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    _public.Rules = [];
    let _sheet = null;
    _public.getSheet = function (title) {
        _sheet = _getSheet(title);
        _public.Rules = _getRules();
        return this;
    };
    const _getSheet = function (title) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            if (sheet && sheet.title === title) {
                return sheet;
            }
        }
        return null;
    };
    const _getRules = function () {
        if (_sheet == null) {
            return [];
        }
        return _sheet.cssRules ? _sheet.cssRules : _sheet.rules;
    };
    _public.find = function (selector) {
        selector = selector.toLowerCase();
        for (let i = 0; i < _public.Rules.length; i++) {
            const rule = _public.Rules[i];
            // style rules only (an @media rule has no selector)
            if (!(rule instanceof CSSStyleRule) || !rule.selectorText) {
                continue;
            }
            if (rule.selectorText.toLowerCase() === selector) {
                return rule;
            }
        }
        return null;
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
;/**
 * Changes the song's color scheme ("theme") by changing both the applied body class
 * and the UkeGeek settings used to draw the diagrams.
 * @class themes
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.themes = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * available color schemes (see UkeGeeks.settings)
     * @property _colorSchemes
     * @type {JSON-Object}
     */
    const _colorSchemes = {
        'normal': {
            name: 'Normal (white paper)',
            selectText: 'Normal colors (white paper)',
            description: 'Simple, legible text on white paper',
            song: {
                fretLines: '#003366',
                dots: '#ff0000',
                dotText: '#ffffff',
                text: '#000000',
                fretText: '#4a4a4a',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#4a4a4a'
            },
            tabs: {
                lines: '#999999',
                dots: '#eaeaea',
                text: '#000000'
            }
        },
        'reversed': {
            name: 'Reversed for projectors',
            selectText: 'Reversed colors (for projectors)',
            description: 'Light text on dark background',
            song: {
                fretLines: '#365F70',
                dots: '#FDD96F',
                dotText: '#000000',
                text: '#FF6040',
                fretText: '#999999',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#999999'
            },
            tabs: {
                lines: '#365F70',
                dots: '#FDD96F',
                text: '#000000'
            }
        },
        'frosty': {
            name: 'Frostcicle',
            selectText: 'Frostcicle (cool blue)',
            description: 'Brrrr... icy cool blues',
            song: {
                fretLines: '#66B4CC',
                dots: '#332335',
                dotText: '#9FE1F9',
                text: '#0896FE',
                fretText: '#E3D8BA',
                /* a muted string's X: the lyrics' blue (the light fret-number color is too faint) */
                xStroke: '#0896FE'
            },
            tabs: {
                lines: '#6699FF',
                dots: '#EFFCF9',
                text: '#00558E'
            }
        },
        'jellyBean': {
            name: 'Jelly Beans',
            selectText: 'Jelly Beans (vibrant)',
            description: 'Sugary, vibrant bowl of jelly beans!',
            song: {
                fretLines: '#49BC45',
                dots: '#FF9417',
                dotText: '#FCF49F',
                text: '#D20070',
                fretText: '#4a4a4a',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#4a4a4a'
            },
            tabs: {
                lines: '#6699FF',
                dots: '#FFF9BA',
                text: '#75003E'
            }
        },
        'justBlack': {
            name: 'Just Black',
            selectText: 'Black (for laser printers)',
            description: 'No color, but black, best for B&W laser printers',
            song: {
                fretLines: '#cccccc',
                dots: '#000000',
                dotText: '#ffffff',
                text: '#000000',
                fretText: '#000000',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#000000'
            },
            tabs: {
                lines: '#cccccc',
                dots: '#000000',
                text: '#ffffff'
            }
        },
        'krampus': {
            name: 'Gruss vom Krampus',
            selectText: 'Krampus (Ye Olde Christmas)',
            description: 'Seasons Greetin\'s, Happy Holidays, Merry Christmas, Krampus Nichte!',
            song: {
                fretLines: '#929867',
                dots: '#A22C27',
                dotText: '#EBD592',
                text: '#4F2621',
                fretText: '#4a4a4a',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#4a4a4a'
            },
            tabs: {
                lines: '#B69C01',
                dots: '#E1EEC8',
                text: '#75003E'
            }
        },
        'western': {
            name: 'Out West',
            selectText: 'Out West (dust country)',
            description: 'Dusty Honky Tonk/Country/Western look',
            song: {
                fretLines: '#B5A679',
                dots: '#CF8300',
                dotText: '#ffffff',
                text: '#386571',
                fretText: '#4a4a4a',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#4a4a4a'
            },
            tabs: {
                lines: '#697665',
                dots: '#F1E3C5',
                text: '#632424'
            }
        },
        'pumpkin': {
            name: 'Pumpkin Pie',
            selectText: 'Pumpkin Pie (fall colors)',
            description: 'Fall \'n Halloween \'n Jack o\'Lantern \'n Thanksgiving Fun',
            song: {
                fretLines: '#8E9A6C',
                dots: '#DA6328',
                dotText: '#FFEE4A',
                text: '#68391D',
                fretText: '#B14623',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#B14623'
            },
            tabs: {
                lines: '#BED379',
                dots: '#FFF4D8',
                text: '#B14623'
            }
        },
        'notebook': {
            name: 'Rock Notebook',
            selectText: 'Rock Notebook (marker)',
            description: 'A strong, hand-scrawled, and edgily unreliable look',
            song: {
                fretLines: '#747CAD',
                dots: '#1C0866',
                dotText: '#ffffff',
                text: '#B22000',
                fretText: '#A4A0B2',
                /* a muted string's X: the fret lines' color (the light fret-number color is too faint) */
                xStroke: '#747CAD'
            },
            tabs: {
                lines: '#A4A0B2',
                dots: '#F1E3C5',
                text: '#2E2ECC'
            }
        },
        'zombie': {
            name: 'Zombies!!!',
            selectText: 'Zombies!!!',
            description: 'Blood \'n gore for Halloween',
            song: {
                fretLines: '#9EB036',
                dots: '#E52501',
                dotText: '#FEDA79',
                text: '#798666',
                fretText: '#B14623',
                /* a muted string's X: drawn on the page, so the fret numbers' color */
                xStroke: '#B14623'
            },
            tabs: {
                lines: '#602749',
                dots: '#F7F9EA',
                text: '#4F5F3E'
            }
        }
    };
    const setBody = function (themeName) {
        const classes = document.body.classList;
        // see: http://stackoverflow.com/questions/921789/how-to-loop-through-javascript-object-literal-with-objects-as-members
        for (const key in _colorSchemes) {
            if (Object.prototype.hasOwnProperty.call(_colorSchemes, key)) {
                classes.remove('theme-' + key);
            }
        }
        classes.add('theme-' + themeName);
    };
    /**
     * Returns text to be deisplayed when the  specified theme is selected.
     * @method  getDescription
     * @param  {string} themeName
     * @return {string}
     */
    _public.getDescription = function (themeName) {
        const scheme = _colorSchemes[themeName];
        return scheme ? scheme.selectText : '';
    };
    /**
     * Populates the UL(identified via CSS selector) with the color scheme List Items (LIs)
     * @method loadList
     * @param  {string} selector
     * @param {string} selectedValue value that should be "checked"
     */
    _public.loadList = function (selector, selectedValue) {
        const ul = ugsEditorPlus.dom.find(selector, HTMLElement);
        ul.textContent = '';
        for (const [key, scheme] of Object.entries(_colorSchemes)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            if (key === selectedValue) {
                li.className = 'ugsEditor-checked';
            }
            a.href = '#' + key;
            a.title = scheme.description;
            a.textContent = scheme.name;
            li.appendChild(a);
            ul.appendChild(li);
        }
    };
    /**
     * Sets body class and UkeGeeks settings to specified theme.
     * @method set
     * @param {string} themeName
     */
    _public.set = function (themeName) {
        setBody(themeName);
        const c = _colorSchemes[themeName];
        if (!c) {
            // not a theme: the page keeps the colors it has
            return;
        }
        ukeGeeks.settings.colors = c.song;
        ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
        ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
        ukeGeeks.settings.tabs.textColor = c.tabs.text;
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
;/**
 * UI mechanics of the Other Options "dialog"'s checkboxes and input
 * fields (does NOT manage "pageWidth" since its standard submenu behavior
 * is already handled in that class)
 * @class optionsDlg
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.optionsDlg = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * Sets up this class by attaching event handlers to form elements;
     * @method init
     * @public
     */
    _public.init = function () {
        const dom = ugsEditorPlus.dom, options = ugsEditorPlus.options;
        // Update Button
        dom.byId('updateBtn', HTMLElement).onclick = function () {
            triggerNotify('update', '');
            return false;
        };
        // show/hide square bracket (chord enclosure)
        const chkEnclosures = dom.byId('chkEnclosures', HTMLInputElement);
        chkEnclosures.checked = options.hideChordEnclosures;
        chkEnclosures.onclick = function () {
            // Boolean "isVisible"
            triggerNotify('showEnclosures', !chkEnclosures.checked);
        };
        // list of chord names to ignore
        const commonChordList = dom.byId('commonChordList', HTMLInputElement);
        commonChordList.value = (typeof options.commonChords === 'string') ? options.commonChords : options.commonChords.join(", ");
        commonChordList.onchange = function () {
            triggerNotify('setCommonChords', commonChordList.value);
        };
        // toggle order of reference diagrams (optional: older pages don't have it)
        const sortAlphaOrNull = document.getElementById('chkSortAlpha');
        if (sortAlphaOrNull instanceof HTMLInputElement) {
            const chkSortAlpha = sortAlphaOrNull;
            chkSortAlpha.checked = options.sortAlphabetical;
            chkSortAlpha.onclick = function () {
                triggerNotify('sortAlphabetical', chkSortAlpha.checked);
            };
        }
        // toggle ignore common chords
        const chkIgnoreCommon = dom.byId('chkIgnoreCommon', HTMLInputElement);
        chkIgnoreCommon.checked = options.ignoreCommonChords;
        chkIgnoreCommon.onclick = function () {
            // Boolean for "isIgnore"
            triggerNotify('hideCommonChords', chkIgnoreCommon.checked);
        };
        // ugh! Event bubbling!
        ugsEditorPlus.dom.on('.ugsEditor-checkboxBlock label, input[type=checkbox]', 'click', function (e) {
            e.stopPropagation();
        });
        ugsEditorPlus.dom.all('.ugsEditor-overlay').forEach(function (dlg) {
            ugsEditorPlus.dom.draggable(dlg, '.ugsEditor-overlayHeader, hgroup');
        });
    };
    const triggerNotify = function (action, value) {
        ugsEditorPlus.dom.trigger('ugs:option', {
            action: action,
            value: value
        });
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;// Must stay var: ugsEditorPlus.namespace.ts declares it too, in the same global scope
// (only var allows that), and a top-level var puts it on window for Studio and the Songbook.
// eslint-disable-next-line no-var -- see above
var ugsEditorPlus = window.ugsEditorPlus || {};
/**
 * Converts a song pasted the way most websites show it -- a line of chord names above each
 * line of lyrics -- into ChordPro, with each chord in [brackets] at its place in the lyrics.
 * Four lines of tablature in a row become a {start_of_tab} block.
 * @class reformat
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.reformat = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    let _hasChords = false;
    /**
     *
     * @property _enums
     * @private
     */
    const _enums = {
        lineTypes: {
            blank: 0,
            chords: 1,
            lyrics: 2,
            tabs: 3
        }
    };
    /** One line of the text, as read() finds it; a new one is a blank line */
    class LineObj {
        constructor() {
            this.source = '';
            this.wordCount = 0;
            this.spaceCount = 0;
            this.words = [];
            this.chordCount = 0;
            this.lineType = _enums.lineTypes.blank;
        }
    }
    const _re = {
        words: /\b(\S+)\b/gi,
        spaces: /(\s+)/g,
        leadingSpace: /(^\s+)/,
        chordNames: /\b[A-G][#b]?(m|m6|m7|m9|dim|dim7|maj7|sus2|sus4|aug|6|7|9|add9|7sus4)?\b/,
        chrdBlock: /\b(\S+\s*)/g,
        tabs: /^\s*(\|{0,2}[A-Gb]?\|{0,2}[-x0-9|:]{4,})/
    };
    // Hal Leonard Uke Chord Finder:
    // + aug
    // o dim
    // -----------------
    // F Fm F+ Fdim
    // F5 Fadd9 Fm(add9) Fsus4
    // Fsus2 F6 Fm6 Fmaj7
    // Fmaj9 Fm7 Fm(maj7) Fm7b5
    // Fm9 Fm11 F7 Fsus4
    // F+7 F7b5 F9 F7#9
    // F7b9 F11 F13 Fdim7
    /**
     * Accepts a text block, returns "ChordPro" text block with chord lines merged into lyric lines with chords enclosed in square-brackets (i.e. [Cdim])
     * @method run
     * @public
     * @param text {string} songstring
     * @return {string} ChordPro format text block
     * @for reformat
     */
    _public.run = function (text) {
        _hasChords = false;
        const lines = read(text);
        return merge(lines);
    };
    /**
     * TRUE if one or more chord lines detected
     * @method hasChords
     * @return {bool}
     */
    _public.hasChords = function () {
        return _hasChords;
    };
    /**
     * Accepts a text block
     * @method read
     * @param text {string} string RAW song
     * @return {array of Lines}
     */
    const read = function (text) {
        const lineAry = [];
        const lines = text.split('\n').map(expandTabs);
        for (const line of lines) {
            const words = line.match(_re.words);
            const l = new LineObj();
            l.source = line;
            if ((words != null) && (words.length > 0)) {
                l.wordCount = words.length;
                l.words = words;
                l.chordCount = countChords(words);
            }
            const spaces = line.match(_re.spaces);
            if ((spaces != null) && (spaces.length > 0)) {
                l.spaceCount = spaces.length;
            }
            l.lineType = toLineType(l);
            lineAry.push(l);
        }
        return lineAry;
    };
    /**
     * Columns between tab stops: 8, as the Edit Song box shows a tab (the browser's default
     * `tab-size`), so chords line up over the lyrics the way they look there.
     * @property TAB_SIZE
     * @final
     */
    const TAB_SIZE = 8;
    /**
     * Replaces each tab with the spaces up to the next tab stop
     * @method expandTabs
     * @param line {string}
     * @return {string}
     */
    const expandTabs = function (line) {
        let out = '';
        for (let i = 0; i < line.length; i++) {
            if (line[i] !== '\t') {
                out += line[i];
                continue;
            }
            do {
                out += ' ';
            } while (out.length % TAB_SIZE !== 0);
        }
        return out;
    };
    /**
     * Guesses as to the line's tyupe --
     * @method toLineType
     * @param line {line}
     * @return {_enums.lineTypes}
     */
    const toLineType = function (line) {
        if ((line.spaceCount + line.wordCount) < 1) {
            return _enums.lineTypes.blank;
        }
        const tabs = line.source.match(_re.tabs);
        if (tabs != null) {
            return _enums.lineTypes.tabs;
        }
        let t = _enums.lineTypes.lyrics;
        if ((line.chordCount > 0) && (line.wordCount === line.chordCount)) {
            t = _enums.lineTypes.chords;
            _hasChords = true;
        }
        return t;
    };
    /**
     * Looks for supported chords.
     * @method countChords
     * @param words {array of words}
     * @return [int] number found
     */
    const countChords = function (words) {
        let count = 0;
        for (const word of words) {
            if (word.match(_re.chordNames)) {
                count++;
            }
        }
        return count;
    };
    /**
     * Return merged song -- chords embedded within lyrics
     * @method merge
     * @param lines {array of Lines}
     * @return [string]
     */
    const merge = function (lines) {
        let s = '';
        for (let i = 0; i < lines.length;) {
            const thisLine = lines[i];
            const nextLine = lines[i + 1];
            i++;
            if (!thisLine) {
                continue;
            }
            // If this line's blank or its the last line...
            if (!nextLine || (thisLine.lineType === _enums.lineTypes.blank)) {
                s += thisLine.source + '\n';
                continue;
            }
            // OK, we've complicated things a bit by adding tabs, so we'll handle this in a helper...
            // (the block is this line and the three after it; nextLine is the first of those)
            const tabBlock = thisLine.lineType === _enums.lineTypes.tabs ? tabBlockAt(lines, i) : null;
            if (tabBlock) {
                s += '{start_of_tab}\n' + [thisLine].concat(tabBlock).map(function (line) {
                    return line.source.replace(_re.leadingSpace, '') + '\n';
                }).join('') + '{end_of_tab}\n';
                i += 3;
                continue;
            }
            // finally, look for a "mergable" pair: this line is chords and the next is lyrics -- if not this we'll just output the current line
            if ((thisLine.lineType !== _enums.lineTypes.chords) || (nextLine.lineType !== _enums.lineTypes.lyrics)) {
                s += (thisLine.lineType === _enums.lineTypes.chords) ? wrapChords(thisLine.source) + '\n' : thisLine.source + '\n';
                continue;
            }
            // OK, if you're here it's because the current line is chords and the next lyrics, meaning, we're gonna merge them!
            i++;
            s += mergeLines(thisLine.source, nextLine.source) + '\n';
        }
        return s;
    };
    /**
     * The three lines from index on, if they're tab lines too, making a block of four with the
     * line before them (merge() has already moved past that one); else null
     * @method tabBlockAt
     * @param lines {array of Lines}
     * @param index {int} index of the line after the first tab line
     * @return [array of Lines] or null
     */
    const tabBlockAt = function (lines, index) {
        // (the block can end the song: slice() just comes back short then)
        const block = lines.slice(index, index + 3);
        const allTabs = block.every(function (line) {
            return line.lineType === _enums.lineTypes.tabs;
        });
        return block.length === 3 && allTabs ? block : null;
    };
    /**
     * Return a single line
     * @method mergeLines
     * @param chordLine {string} the line containing the chord names
     * @param lyricsLine {string} the line of lyrics
     * @return [string] merged lines
     */
    const mergeLines = function (chordLine, lyricsLine) {
        while (lyricsLine.length < chordLine.length) {
            lyricsLine += ' ';
        }
        let s = '';
        // (only called for chord lines, which have chord blocks)
        const blocks = chordLine.match(_re.chrdBlock) || [];
        const lead = chordLine.match(_re.leadingSpace);
        let offset = 0;
        if (lead) {
            s += lyricsLine.substr(offset, lead[0].length);
            offset = lead[0].length;
        }
        for (const block of blocks) {
            s += '[' + block.replace(_re.spaces, '') + ']' + lyricsLine.substr(offset, block.length);
            offset += block.length;
        }
        if (offset < lyricsLine.length) {
            s += lyricsLine.substr(offset, lyricsLine.length);
        }
        return s;
    };
    /**
     * Wraps the words on the line within square brackets " C D " is returned as "[C] [D]"
     * @method wrapChords
     * @param chordLine {string} the line containing the chord names
     * @return [string] each word of input line gets bracketed
     */
    const wrapChords = function (chordLine) {
        const chords = chordLine.replace(_re.spaces, ' ').split(' ');
        let s = '';
        for (const chord of chords) {
            if (chord.length > 0) {
                s += '[' + chord + '] ';
            }
        }
        return s;
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
;/**
 * When a song has no [chords] (actions.run() calls this), tries reformat.run() on it. If that
 * finds chord lines, shows the Reformat dialog: "Yes" puts the converted song in the Edit Song box.
 * The dialog's checkbox stops it asking again until the page reloads.
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.autoReformat = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
     * @property _ele
     * @type {JSON}
     */
    let _ele = {};
    let _formatted;
    let _isDisabled = false;
    _public.run = function (elements) {
        if (_isDisabled) {
            return;
        }
        const dom = ugsEditorPlus.dom;
        // adds the dialog's elements to the ones passed in (the same object, as before)
        _ele = Object.assign(elements, {
            reformatTextBox: dom.byId('reformatSource', HTMLTextAreaElement),
            reformatDlg: dom.byId('reformatDlg', HTMLElement)
        });
        dom.byId('reformatYesBtn', HTMLElement).onclick = function () {
            doOk();
            return false;
        };
        dom.byId('reformatNoBtn', HTMLElement).onclick = function () {
            doClose();
            return false;
        };
        // need to reset on reload
        const chk = dom.byId('reformatDisable', HTMLInputElement);
        chk.checked = false;
        chk.onclick = function () {
            doDisable(chk.checked);
        };
        runNow();
    };
    const doOk = function () {
        _ele.cpmSource.value = _formatted;
        ugsEditorPlus.songText.changed();
        doClose();
        ugsEditorPlus.actions.run(true);
    };
    const doClose = function () {
        ukeGeeks.toolsLite.addClass(_ele.reformatDlg, 'ugsEditor-isHidden');
    };
    const doDisable = function (isDisabled) {
        _isDisabled = isDisabled;
    };
    const runNow = function () {
        _formatted = ugsEditorPlus.reformat.run(_ele.cpmSource.value);
        _ele.reformatTextBox.value = _formatted;
        if (!ugsEditorPlus.reformat.hasChords()) {
            return;
        }
        ukeGeeks.toolsLite.removeClass(_ele.reformatDlg, 'ugsEditor-isHidden');
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * Handles Top Menu UI -- includes the show/hide dialogs (why? cuz they're attached to top menu buttons)
 * Shows (a) dialongs (such as Edit) and (b) those tool-tippy options thingies.
 * @class topMenus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.topMenus = (function () {
    /**
     * attaches events...
     * @method _init
     * @public
     * @return {void}
     */
    const _init = function () {
        const dom = ugsEditorPlus.dom;
        // (a, button: Songbook 1.5 pages have links here)
        dom.on('#ugsAppToolbar > ul li:not([data-dialog]) > button, #ugsAppToolbar > ul li:not([data-dialog]) > a', 'click', _onMenuItemClick);
        dom.on('.ugsEditor-showOptionsBox > button, .ugsEditor-showOptionsBox > a', 'click', _onShowOptionsClick);
        dom.on('#ugsAppToolbar > ul li[data-dialog]', 'click', _onShowDlgBtnClick);
        dom.on('.ugsEditor-closeBtn', 'click', _onCloseBtnClick);
        dom.on('.ugsEditor-resizeBtn', 'click', _onResizeBtnClick);
    };
    /**
     * Click handler for nav items that are NOT attached to a dialog box.
     * @method _onMenuItemClick
     * @private
     * @return {void}
     */
    const _onMenuItemClick = function () {
        // the clicked button
        const parent = this.parentElement;
        if (!parent) {
            return;
        }
        const isOpen = parent.classList.contains('ugsEditor-active');
        _makeAllInactive();
        if (isOpen) {
            return;
        }
        parent.classList.add('ugsEditor-active');
    };
    /**
     * Deselects all items in app's top menu/nav bar (just removes active state from all items)
     * @method _makeAllInactive
     * @private
     * @return {void}
     */
    const _makeAllInactive = function () {
        ugsEditorPlus.dom.all('#ugsAppToolbar > ul > li').forEach(function (li) {
            li.classList.remove('ugsEditor-active');
        });
    };
    /**
     * Same as _makeAllInactive method PLUS closes any open drop down/arrow boxes.
     * @method _closeAll
     * @private
     * @return {void}
     */
    const _closeAll = function () {
        // hide any drop-down/arrow boxes currently open
        _makeAllInactive();
        ugsEditorPlus.dom.all('.ugsEditor-arrowBox').forEach(ugsEditorPlus.dom.hide);
    };
    /**
     * handles nav menu/toolbar click event. The data-dialog="X" attribute
     * on the element assocaites the menu item with the dialog box (the
     * box's id)
     * @method _onShowDlgBtnClick
     * @private
     * @param e {event}
     * @return {bool} false to kill event bubbling
     */
    const _onShowDlgBtnClick = function (e) {
        _closeAll();
        // now show dialog associated with the clicked button
        ugsEditorPlus.dom.fadeIn(document.getElementById(this.getAttribute('data-dialog') || ''));
        // prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
    };
    /**
     * dialog box's close button's click handler. Hides the first parent
     * with class.
     * @method _onCloseBtnClick
     * @private
     * @param e {event}
     * @return {bool} false to kill event bubbling
     */
    const _onCloseBtnClick = function (e) {
        ugsEditorPlus.dom.fadeOut(this.closest('.ugsEditor-overlay'));
        // prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
    };
    const _onResizeBtnClick = function (e) {
        _closeAll();
        ugsEditorPlus.resize.toggle(ugsEditorPlus.dom.closest(this, '.ugsEditor-overlay', HTMLElement));
        e.preventDefault();
        e.stopPropagation();
    };
    /**
     * display a "tooltip" options dialog
     * @method _onShowOptionsClick
     * @private
     * @param e {event}
     * @return {bool} false to kill event bubbling
     */
    const _onShowOptionsClick = function (e) {
        const dom = ugsEditorPlus.dom;
        const dlg = dom.byId(this.dataset.target || (this.getAttribute('href') || '').replace(/^#/, ''), HTMLElement);
        dom.all('.ugsEditor-arrowBox').forEach(function (box) {
            if (box !== dlg) {
                dom.hide(box);
            }
        });
        dom.all('dd', dlg).forEach(dom.hide);
        dom.fadeToggle(dlg);
        ugsEditorPlus.submenuUi.reset(dlg);
        // prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return {
        init: _init,
        makeAllInactive: _makeAllInactive
    };
}());
;/**
 * Wires up all the "pseudo-selects" (aka "dropdownlists") on a Tooltip-Dialog boxes on
 * the page; assumes consistent HTML
 * TODO: Refactor -- quite brittle!
 * @class submenuUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.submenuUi = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    let _open = null;
    /**
     * attaches event handlers
     * @method init
     * @public
     * @return {[type]} [description]
     */
    _public.init = function () {
        ugsEditorPlus.themes.loadList('#colorPicker .ugsEditor-pseudoSelect', ugsEditorPlus.options.theme);
        const dom = ugsEditorPlus.dom;
        dom.on('.ugsEditor-enablePseudoSelects label', 'click', onLabelClick);
        dom.on('.ugsEditor-pseudoSelect li', 'click', onOptionClick);
        dom.on(document.body, 'click', closeAll);
        dom.on('.ugsEditor-arrowBox', 'click', doCollapseAllLists);
        syncOptions(ugsEditorPlus.options);
    };
    /**
     * a list item has been clicked
     * @method onOptionClick
     * @param  {event} e
     * @return {bool} false to kill event bubbling
     */
    const onOptionClick = function (e) {
        const dom = ugsEditorPlus.dom;
        const value = stripHash(dom.find('a', HTMLAnchorElement, this).getAttribute('href') || '');
        // the element holding the "pseudo-select"
        const select = dom.closest(this, 'dd', HTMLElement);
        const id = select.id;
        const actionName = select.getAttribute('data-action') || '';
        // a selection's been made so we hide the (sub) select list
        ugsEditorPlus.dom.hide(select);
        // ...and reset ("uncheck") all items and check ("highlight") this selected item
        setChecked(this);
        onListActive(this, false);
        _open = null;
        // now bubble out the info -- update display to show selected value ...
        const label = getLabel(id);
        dom.find('span', HTMLElement, label).textContent = getLabelText(actionName, value, this);
        dom.closest(label, 'dt', HTMLElement).classList.remove('ugsEditor-active');
        // lastly, execute the action
        ugsEditorPlus.dom.trigger('ugs:option', {
            action: actionName,
            value: value
        });
        // prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
    };
    const setChecked = function (item) {
        if (!item) {
            //console.log('item for option not found');
            return;
        }
        const siblings = item.parentElement ? item.parentElement.children : [];
        Array.prototype.forEach.call(siblings, function (sibling) {
            sibling.classList.remove('ugsEditor-checked');
        });
        item.classList.add('ugsEditor-checked');
    };
    /**
     * the label (in the dt) for the pseudo-select with this id
     * @method getLabel
     * @param  {string} id
     * @return {DOM-element}
     */
    const getLabel = function (id) {
        return ugsEditorPlus.dom.find('label[for="' + cssString(id) + '"]', HTMLLabelElement);
    };
    /**
     * a value safe to use inside a quoted CSS attribute selector
     * @method cssString
     * @param  {string} value
     * @return {string}
     */
    const cssString = function (value) {
        return String(value).replace(/["\\]/g, '\\$&');
    };
    const syncOptions = function (options) {
        let item, id;
        const map = [{
                action: 'zoomFonts',
                value: options.fontSize
            }, {
                action: 'zoomDiagrams',
                value: options.diagramSize
            }, {
                action: 'layout',
                value: options.diagramPosition
            }, {
                action: 'paper',
                value: options.paper
            }, {
                action: 'colors',
                value: options.theme
            }, {
                action: 'tuning',
                value: options.tuning
            }, {
                action: 'placement',
                value: options.lyricStyle
            }];
        for (let i = map.length - 1; i >= 0; i--) {
            const entry = map[i];
            if (!entry) {
                continue;
            }
            item = ugsEditorPlus.dom.one('[data-action="' + entry.action + '"] a[href="#' + cssString(entry.value) + '"]');
            if (!item) {
                continue;
            }
            item = ugsEditorPlus.dom.closest(item, 'li', HTMLElement);
            id = ugsEditorPlus.dom.closest(item, 'dd', HTMLElement).id;
            setChecked(item);
            ugsEditorPlus.dom.find('span', HTMLElement, getLabel(id)).textContent = getLabelText(entry.action, entry.value, item);
        }
    };
    /**
     * Label has been clicked, show associated options dialog box.
     * Watch for 2-clicks on same label (should hide on second click)
     * @method onLabelClick
     * @param  {event} e
     * @return {bool} false to kill event bubbling
     */
    const onLabelClick = function (e) {
        const id = this.getAttribute('for') || '';
        setActiveLabel(this);
        ugsEditorPlus.dom.show(document.getElementById(id));
        onListActive(this, true);
        if (_open !== null) {
            ugsEditorPlus.dom.hide(document.getElementById(_open.id));
        }
        if (_open !== null && _open.id === id) {
            _open = null;
        }
        else {
            _open = {
                "id": id
            };
        }
        // prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
    };
    /**
     * clears "active" & "in use" states within the (tooltip) dialog
     * @method reset
     * @param  {DOM-element} dlg
     */
    _public.reset = function (dlg) {
        ugsEditorPlus.dom.all('dt', dlg).forEach(function (dt) {
            dt.classList.remove('ugsEditor-active');
        });
        ugsEditorPlus.dom.all('.ugsEditor-event-userSelecting', dlg).forEach(function (ele) {
            ele.classList.remove('ugsEditor-event-userSelecting');
        });
    };
    const setActiveLabel = function (label) {
        const dom = ugsEditorPlus.dom;
        Array.prototype.forEach.call(dom.closest(label, 'dl', HTMLElement).children, function (child) {
            if (child.tagName === 'DT') {
                child.classList.remove('ugsEditor-active');
            }
        });
        dom.closest(label, 'dt', HTMLElement).classList.add('ugsEditor-active');
    };
    /**
     * trying prevent the options not being set from being too distractive --
     * (trying and clearly failing)
     * @method onListActive
     * @param  {DOM-elemnt}  ele     [description]
     * @param  {Boolean} isInUse [description]
     * @return void
     */
    const onListActive = function (ele, isInUse) {
        const wrap = ele.closest('.ugsEditor-enablePseudoSelects');
        if (wrap) {
            wrap.classList.toggle('ugsEditor-event-userSelecting', isInUse);
        }
    };
    /**
     * @method  doCollapseAllLists
     * @param  {event} e
     * @return bool
     */
    const doCollapseAllLists = function (e) {
        if (e.target instanceof Element && e.target.matches('a')) {
            return;
        }
        ugsEditorPlus.dom.all('dd', this).forEach(ugsEditorPlus.dom.hide);
        _open = null;
        e.preventDefault();
        e.stopPropagation();
    };
    /**
     * user clicked off the current dialog -- close 'em all
     * @method closeAll
     * @param  {event} e
     */
    const closeAll = function () {
        ugsEditorPlus.dom.all('.ugsEditor-arrowBox').forEach(function (box) {
            ugsEditorPlus.dom.fadeOut(box, 270);
        });
        ugsEditorPlus.topMenus.makeAllInactive();
    };
    const stripHash = function (value) {
        return (value[0] === '#') ? value.substr(1) : value;
    };
    /* ----------------------------------------------------------------------------------- *|
    |* Display Text Methods
    |* ----------------------------------------------------------------------------------- */
    /**
     * used to construct the descriptions for current values
     * @property _descriptions
     * @private
     * @type {JSON}
     */
    const _desriptions = {
        'zoomDiagrams': ['Tiny', 'Small', 'Medium', 'Large', 'Stupid Large'],
        'layout': ['Reference diagrams on left', 'Reference diagrams at top', 'No reference diagrams'],
        'placement': ['Chord names inline with lyrics', 'Chord names above lyrics', 'Names & diagrams above lyrics'],
        'tuning': ['(GCEA) Standard tuning', '(DGBE) Baritone tuning', '(ADF#B) alternate tuning']
    };
    /**
     * Builds a descriptor string of the current values for the pseudo-select labels
     * @method getLabelText
     * @param  {string} action
     * @param  {string} value
     * @param  {DOM-element} ele the selected list item (LI)
     * @return {string}
     */
    const getLabelText = function (action, value, ele) {
        const index = ele.parentElement ? Array.prototype.indexOf.call(ele.parentElement.children, ele) : -1;
        switch (action) {
            case 'paper':
                return 'Width ' + ele.textContent;
            case 'zoomFonts':
                return 'Font size ' + value + 'pt';
            case 'zoomDiagrams':
                return _desriptions.zoomDiagrams[index] + ' diagrams';
            case 'colors':
                return ugsEditorPlus.themes.getDescription(String(value));
            case 'transpose': {
                if (value === 'up_0') {
                    return 'Original key';
                }
                const txt = ele.textContent || '';
                return txt.replace(' ', ' steps - "') + '"';
            }
            default: {
                // an action without descriptions, or an item past their end, gets an empty label
                const descriptions = _desriptions[action];
                return (descriptions && descriptions[index]) || '';
            }
        }
    };
    _public.resetTransposeLabel = function () {
        ugsEditorPlus.dom.find('span', HTMLElement, getLabel('transposePicker')).textContent = 'Original key';
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * Saves the song: runs the host page's save callback when the Save button is clicked.
 * Dependencies: ugsEditorPlus.dom

 * @class updateSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.updateSong = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * The host's save callback: takes the ChordPro text, returns (a promise of) the message to show.
     * @property _save
     * @type {Function}
     */
    let _save = null;
    /**
     * Name / Value pairs for CSS selectors of HTML elements to be manipulated
     * @property _selectors
     * @type {JSON}
     */
    const _selectors = {
        messageBox: '#messageBox',
        message: '#sourceFeedback',
        button: '#saveBtn',
        spinner: '#loadingSpinner'
    };
    /**
     * lock-down the Submit (Update) button to avoid double posts;
     * @property _isUpdating
     * @type {Boolean}
     */
    let _isUpdating = false;
    /**
     * the save in progress
     * @property _pending
     * @type {Promise}
     */
    let _pending = Promise.resolve(false);
    /**
     * Saves by posting to the UkeGeeks Songbook server (the original behavior).
     * Kept so pages that call updateSong.init() keep working; new pages pass `save` to songAmatic.mount().
     * @method init
     * @param ajaxUri {string}
     * @param filename {string}
     */
    _public.init = function (ajaxUri, filename) {
        _public.setSaveHandler(function (song) {
            const data = {
                'handler': 'ugs_update_81jr',
                'filename': filename,
                'song': song
            };
            return ugsEditorPlus.dom.postJson(ajaxUri, data).then(function (data) {
                //if (data.HasErrors)
                return data.Message;
            });
        });
    };
    /**
     * Wires the Save button to a save callback.
     * @method setSaveHandler
     * @param save {Function} takes the ChordPro text; returns a message, or a promise of one. A rejection shows the "problem saving" alert.
     */
    _public.setSaveHandler = function (save) {
        _save = save;
        ugsEditorPlus.dom.on(_selectors.button, 'click', function (e) {
            e.preventDefault();
            doUpdate();
        });
        ugsEditorPlus.dom.hide(ele('messageBox'));
    };
    /**
     * Saves the song now, as the Save button does: the text being edited (Fullscreen's
     * while it's open) goes to the save callback, and its message or the "problem saving"
     * alert shows as usual. A save already under way is the one you get.
     * @method save
     * @return {Promise} of true when it saved; false when it failed, or there's no save callback
     */
    _public.save = function () {
        return _save ? doUpdate() : Promise.resolve(false);
    };
    /**
     * pending "fade out the message" timer
     * @property _hideTimer
     * @type {Number}
     */
    let _hideTimer;
    const ele = function (name) {
        return ugsEditorPlus.dom.one(_selectors[name]);
    };
    const showBusy = function () {
        const dom = ugsEditorPlus.dom;
        clearTimeout(_hideTimer);
        dom.hide(ele('message'));
        if (dom.isVisible(ele('messageBox'))) {
            // still showing (or fading out) the last message
            dom.show(ele('messageBox'));
        }
        else {
            dom.slideDown(ele('messageBox'), 'fast');
        }
        dom.show(ele('spinner'));
    };
    const showMessage = function (message) {
        const msg = ugsEditorPlus.dom.find(_selectors.message, HTMLElement);
        ugsEditorPlus.dom.hide(ele('spinner'));
        msg.textContent = message;
        ugsEditorPlus.dom.show(msg);
    };
    const hideMessage = function () {
        clearTimeout(_hideTimer);
        _hideTimer = setTimeout(function () {
            ugsEditorPlus.dom.fadeOut(ele('messageBox'), 'slow');
        }, 3000);
    };
    const doUpdate = function () {
        if (_isUpdating) {
            return _pending;
        }
        _isUpdating = true;
        showBusy();
        _pending = Promise.resolve()
            .then(function () {
            // (setSaveHandler() sets _save before it wires the button)
            return _save ? _save(ugsEditorPlus.songText.get()) : undefined;
        })
            .then(function (message) {
            showMessage(message === undefined || message === null ? 'Saved.' : String(message));
            return true;
        }, function () {
            alert('Encountered a problem saving your Song. Please copy your song to another program until this issue is resolved.');
            return false;
        })
            .then(function (isSaved) {
            hideMessage();
            _isUpdating = false;
            return isSaved;
        });
        return _pending;
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
})();
;/**
 * Help shown beside the fullscreen (Ace) editor: keyboard shortcuts and ChordPro snippets.
 * It used to ship inside js/ace/ace.js as `ugsAce.helpHtml`; the Ace ChordPro extension
 * no longer includes it, so it lives with the editor. Styled in ugsEditorPlus.aceEditor.less.
 * @property aceHelpHtml
 * @type {string}
 */
ugsEditorPlus.aceHelpHtml = [
    '<div class="ugsEditor-aceHelp">',
    '<h3>Keyboard Shortcuts</h3>',
    '<table>',
    '<thead>',
    '<tr><th>Shortcut</th><th>Action</th></tr>',
    '</thead>',
    '<tbody>',
    '<tr><td class="ugsEditor-shortKeys"><code class="ugsEditor-key">CTRL</code> + <code class="ugsEditor-key">F</code></td><td>Find</td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><code class="ugsEditor-key">CTRL</code> + <code class="ugsEditor-key">H</code></td><td>Search &amp; Replace</td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><code class="ugsEditor-key">ESCAPE</code></td><td>Close Find or Chord window</td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><code class="ugsEditor-key">CTRL</code> + <code class="ugsEditor-key">SPACEBAR</code></td><td>Lists your song\'s chords. Use <code class="ugsEditor-key">DOWNARROW</code> &amp; <code class="ugsEditor-key">UPARROW</code> to choose one, or type a few letters of the chord name to narrow suggestions. Press <code class="ugsEditor-key">ENTER</code> to add it to your song.</td></tr>',
    '</tbody>',
    '</table>',
    '<h3>Snippets</h3>',
    '<p>Snippets are bits of ChordPro markup that you may add to your song by just typing a few letters and then pressing the <code class="ugsEditor-key">TAB</code> key.</p>',
    '<table>',
    '<thead>',
    '<tr><th>Snippet</th><th>ChordPro Markup</th></tr>',
    '</thead>',
    '<tbody>',
    '<tr><td class="ugsEditor-shortKeys"><strong>t</strong> or <strong>title</strong></td><td><code class="ugsEditor-snip">{title: <em>TITLE</em>}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>st</strong> or <strong>subtitle</strong></td><td><code class="ugsEditor-snip">{subtitle: <em>TITLE</em>}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>a</strong> or <strong>artist</strong></td><td><code class="ugsEditor-snip">{artist: <em>NAME</em>}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>al</strong> or <strong>album</strong></td><td><code class="ugsEditor-snip">{album: <em>TITLE</em>}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>c</strong> or <strong>comment</strong></td><td><code class="ugsEditor-snip">{comment: <em>DESCRIPTION</em>}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>col</strong> or <strong>column</strong></td><td><code class="ugsEditor-snip">{column_break}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>chorus</strong></td><td>Adds complete chorus block, beginning with <code class="ugsEditor-snip">{start_of_chorus}</code></td></tr>',
    '<tr><td class="ugsEditor-shortKeys"><strong>tab</strong></td><td>Adds complete tablature block, beginning with <code class="ugsEditor-snip">{start_of_tab}</code></td></tr>',
    '</tbody>',
    '</table>',
    '<p>Others: <code>soc</code> &amp; <code>eoc</code> (mark <em>chorus</em> block) and <code>sot</code> &amp; <code>eot</code> (mark <em>tab</em> block). <code>d</code> adds <code>{define:...}</code> tag.</p>',
    '<p>TIP: When a snippet\'s added some &ldquo;placeholder text&rdquo; may be highlighted -- just type whatever you wish to replace this. If more than one placeholder is available pressing <code class="ugsEditor-key">TAB</code> again will cycle through them.</p></div>',
].join('');
;/**
 * Resizes an overlay to fill the window (this is a 1.0, so "fill" is relative -- it gets much bigger)
 * @class resize
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.resize = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    const dom = ugsEditorPlus.dom;
    let dlg = null;
    let aceLayer = null;
    let help = null;
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
    /** true while copySongToAce() puts the song into Ace */
    let isCopying = false;
    /**
     * Initializer: preps handles and sets state varables.
     * @method setup
     * @private
     * @return {void}
     */
    const setup = function (dlgElement) {
        dlg = dlgElement;
        // static markup only. Fullscreen covers the window, so it goes on <body>, outside the editor's element
        document.body.insertAdjacentHTML('beforeend', '<div id="aceHeader"><button class="ugsEditor-aceSideBtn" title="Show options &amp; help"><span></span><span></span><span></span></button><strong>Edit Song</strong><a href="#exit-fullscreen">Exit fullscreen</a></div><div id="aceEditor"></div><div id="aceHelp"></div>');
        aceLayer = dom.byId('aceEditor', HTMLElement);
        dom.hide(aceLayer);
        help = dom.byId('aceHelp', HTMLElement);
        dom.find('#aceHeader a', HTMLElement, document).addEventListener('click', function (e) {
            e.preventDefault();
            hideAce();
        });
        dom.find('#aceHeader button', HTMLElement, document).addEventListener('click', onShowHelpClicked);
    };
    const onShowHelpClicked = function (e) {
        e.preventDefault();
        showHelp(!isHelpOpen);
    };
    const showHelp = function (isShow) {
        isHelpOpen = isShow;
        // (setup() makes them; only its buttons call this)
        if (!help || !aceLayer) {
            return;
        }
        dom.animate(help, {
            left: isShow ? '0px' : '-350px'
        }, SLIDE_SPEED);
        dom.animate(aceLayer, {
            left: isShow ? '350px' : '0px'
        }, SLIDE_SPEED);
    };
    /**
     * Returns the path of a linked script file (src) up to the starting position of fileName
     * @method getPath
     * @param  {string} fileName
     * @return {string}
     */
    const getPath = function (fileName) {
        let path = '', lower, pos;
        fileName = fileName.toLowerCase();
        Array.prototype.forEach.call(document.scripts, function (item) {
            lower = item.src.toLowerCase();
            pos = lower.indexOf(fileName);
            if (pos > 0) {
                path = item.src.substr(0, pos);
            }
        });
        return path;
    };
    const showAce = function () {
        isBig = true;
        document.documentElement.classList.add('aceEditorActive');
        dom.all('.ugsEditor-overlay').forEach(function (overlay) {
            dom.fadeOut(overlay, 300);
        });
        if (editor !== null) {
            // editor has already been initialized, safe to continue
            copySongToAce();
            return;
        }
        // only execute this block once (thus the null check)
        // the folder holding ace-chordpro.min.js: options.aceUrl, or by default "ace/" next to
        // the folder ugsEditorPlus.min.js was loaded from (e.g. "/js/ace/")
        const aceUrl = ugsEditorPlus.options.aceUrl || (getPath('ugsEditorPlus') + 'ace/');
        // Ace with the ChordPro mode, snippets, chord completer and theme built in
        // (@ukegeeks/ace-chordpro-extension, which the host page copies there)
        LazyLoad.js(aceUrl + 'ace-chordpro.min.js', function () {
            editor = ace.edit("aceEditor");
            editor.setTheme("ace/theme/idle_fingers");
            editor.getSession().setMode("ace/mode/chordpro");
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });
            copySongToAce();
            editor.on('change', function () {
                // (not while the song is being copied in: Ace empties itself first)
                if (!isCopying) {
                    ugsEditorPlus.songText.changed();
                }
            });
            if (help) {
                help.innerHTML = ugsEditorPlus.aceHelpHtml;
            }
        });
    };
    const copySongToAce = function () {
        // (called once Ace is loaded)
        if (editor === null) {
            return;
        }
        dom.fadeIn(aceLayer, FADE_SPEED);
        isCopying = true;
        editor.setValue(dom.byId('chordProSource', HTMLTextAreaElement).value);
        isCopying = false;
        editor.gotoLine(1);
        dom.show(help);
    };
    /**
     * Restores overlay to original position(-ish -- not finished)
     * @method hideAce
     * @private
     * @return {void}
     */
    const hideAce = function () {
        isBig = false;
        dom.show(dlg);
        dom.fadeOut(aceLayer, FADE_SPEED);
        dom.fadeOut(help, FADE_SPEED);
        if (editor !== null) {
            dom.byId('chordProSource', HTMLTextAreaElement).value = editor.getValue();
        }
        document.documentElement.classList.remove('aceEditorActive');
        showHelp(false);
    };
    /**
     * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
     * @method toggle
     * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
     * @return {void}
     */
    /**
     * The song being edited in Fullscreen. (The Edit Song box only gets it when Fullscreen closes.)
     * @method getText
     * @return {string|null} null when Fullscreen is closed, or Ace hasn't loaded yet
     */
    _public.getText = function () {
        return (isBig && editor !== null) ? editor.getValue() : null;
    };
    _public.toggle = function (dlgElement) {
        if (dlg === null) {
            setup(dlgElement);
        }
        if (isBig) {
            hideAce();
        }
        else {
            showAce();
        }
        return false;
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * Connects the Chord Builder (the `ugsChordBuilder` global) to the editor: makes the builder
 * and opens its dialog from the toolbar button, reloading the song's chords each time.
 * Dependencies: ugsChordBuilder classes
 * @class chordBuilder
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.chordBuilder = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    let _builder = null;
    /**
     * Standard event wire up and prep method. Handles "finding" the Builder's "Hand Cursor" based
     * on the location of the background image used on the Finger Tool.
     * @method  init
     */
    _public.init = function () {
        const dom = ugsEditorPlus.dom;
        const fingerToolImage = window.getComputedStyle(dom.find('.ugsEditor-fingerToolImage', HTMLElement)).backgroundImage;
        ugsChordBuilder.settings.cursor.imageUri = fingerToolImage.replace(/url\("(.*)hand.png"\)/i, '$1hand-cursor.png');
        _builder = new ugsChordBuilder.editorUi();
        _builder.init();
        dom.byId('cdBldOpenBtn', HTMLElement).addEventListener('click', onShowDlgBtnClick);
    };
    /**
     * Button/Link click handler (shows the Chord Builder Overlay)
     * @method onShowDlgBtnClick
     * @param  {event} evt
     */
    const onShowDlgBtnClick = function (evt) {
        evt.preventDefault();
        // (init() makes the builder before it listens for this click)
        if (_builder) {
            _builder.reload();
        }
        ugsEditorPlus.dom.fadeIn(document.getElementById(this.getAttribute('data-dialog') || ''));
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * The Song-a-Matic editor's page markup: the songsheet, the Edit Song dialog,
 * the toolbar and its menus, Help, the Reformat dialog and the Chord Builder.
 *
 * Works in two places:
 *   - Node: `require('@ukegeeks/song-editor/markup').editorHtml(...)`, for
 *     server-rendered pages (the Songbook's server and static build).
 *   - The browser bundle: `ugsEditorPlus.markup.editorHtml(...)`, used by
 *     `ugsEditorPlus.songAmatic.mount()`.
 *
 * Every value is HTML-escaped. Existing entities are left alone (like PHP's
 * htmlspecialchars with double_encode=false), because ChordPro files can
 * contain them ("Lyrics &amp; Music &copy; 1933").
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
        // Named again so Node's `import { editorHtml } from '@ukegeeks/song-editor'` works: Node finds a
        // CommonJS file's names by reading its source for `module.exports.name =`, not by running it.
        module.exports.editorHtml = api.editorHtml;
        module.exports.escapeHtml = api.escapeHtml;
    }
    else {
        root.ugsEditorPlus = root.ugsEditorPlus || {};
        root.ugsEditorPlus.markup = api;
    }
}(typeof self !== 'undefined' ? self : this, () => {
    const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    // "&" that does NOT already start an entity like &amp; &copy; &#39; &#x2665;
    const BARE_AMP_OR_SPECIAL = /&(?!#\d+;|#x[0-9a-f]+;|[a-z][a-z0-9]*;)|[<>"']/gi;
    const esc = (value) => (value === null || value === undefined || value === false
        ? ''
        : String(value).replace(BARE_AMP_OR_SPECIAL, (c) => ESCAPES[c] ?? c));
    // The Edit Song box gets every "&" escaped, so it holds the song's exact text: a song with
    // "&amp;" shows (and saves) "&amp;", not "&". (Song Formatter keeps entities when it draws the song.)
    const ALL_SPECIAL = /[&<>"']/g;
    const escText = (value) => (value === null || value === undefined || value === false
        ? ''
        : String(value).replace(ALL_SPECIAL, (c) => ESCAPES[c] ?? c));
    // The page markup, from src/templates/editor.html. scripts/build.js swaps the placeholder below
    // for the file's text, so there is nothing to load at run time (Node and the browser bundle alike).
    const EDITOR_TEMPLATE = "<section id=\"scalablePrintArea\" class=\"scalablePrintArea\">\n  <header class=\"ugs-songInfo\">\n    <h1 id=\"songTitle\" class=\"ugs-songTitle\">{{title}}</h1>\n    <h2 id=\"songSubtitle\" class=\"ugs-songSubtitle\" style=\"display:{{subtitleDisplay}};\">{{subtitle}}</h2>\n    <h2 id=\"songArtist\" class=\"ugs-songArtist\" style=\"display:{{artistDisplay}};\">{{artist}}</h2>\n    <h2 id=\"songAlbum\" class=\"ugs-songAlbum\" style=\"display:{{albumDisplay}};\">{{album}}</h2>\n  </header>\n  <div class=\"metaInfo\" id=\"songMeta\"> </div>\n  <article id=\"ukeSongContainer\" class=\"ugsLayoutTwoColumn ugs-song-wrap\">\n    <aside id=\"ukeChordsCanvas\" class=\"ugs-diagrams-wrap ugs-grouped\"></aside>\n    <article id=\"ukeSongText\" class=\"ugs-source-wrap\">\n      <pre>{{body}}</pre>\n    </article>\n  </article>\n  <footer>\n    <p>Note: <span id=\"footTuningInfo\"><strong>GCEA</strong> Standard Ukulele</span> Tuning. <small>Powered by <a href=\"http://ukegeeks.org/\" title=\"Uke Geeks for free ukulele JavaScript tools\">UkeGeeks' Scriptasaurus</a> &bull; ukegeeks.org</small></p>\n  </footer>\n</section>\n<!-- EDIT SONG (DIALOG) -->\n<section id=\"songSourceDlg\" class=\"ugsEditor-overlay {{#unless canSave}}ugsEditor-isHidden{{/unless}}\">\n  <header class=\"ugsEditor-overlayHeader\">\n    <h3>Edit Song</h3>\n  </header>\n  <div>\n    <button type=\"button\" title=\"close this\" class=\"ugsEditor-closeBtn\">Close</button>\n    <button type=\"button\" title=\"switch to fullscreen editor\" class=\"ugsEditor-resizeBtn\">Fullscreen</button>\n    <p class=\"ugsEditor-btnBar\">\n      <span id=\"messageBox\" class=\"ugsEditor-updateMessage\">\n        <em>\n          <img src=\"{{imgUrl}}busy.gif\" id=\"loadingSpinner\" style=\"display:none;\" alt=\"\" />\n          <span id=\"sourceFeedback\"></span>\n        </em>\n      </span>\n      <input type=\"button\" id=\"updateBtn\" class=\"ugsEditor-baseBtn ugsEditor-blueBtn\" value=\"Update\" title=\"Rebuild digarams and music\" />\n      {{#if canSave}}<input type=\"button\" id=\"saveBtn\" class=\"ugsEditor-baseBtn ugsEditor-orange\" value=\"Save\" title=\"Save\" style=\"margin-right:1.6em;\" />{{/if}}\n      <button type=\"button\" id=\"cdBldOpenBtn\" data-dialog=\"cdBldDlg\" class=\"ugsEditor-alternateBtn\" title=\"Add custom &amp; alternate chord diagrams\">Chord Builder</button>\n    </p>\n    <textarea id=\"chordProSource\" wrap=\"off\">{{body|text}}</textarea>\n  </div>\n</section>\n<!-- APP TOOLBAR -->\n<section id=\"ugsAppToolbar\" class=\"ugsAppMenuBar\">\n  <ul>\n    <li class=\"ugsEditor-navEdit\" data-dialog=\"songSourceDlg\"> <button type=\"button\" title=\"View &amp; edit the song source\"><span></span>Edit</button> </li>\n    <li class=\"ugsEditor-navLayout ugsEditor-showOptionsBox\"> <button type=\"button\" data-target=\"layoutOptions\" title=\"Resize fonts &amp; chord diagrams. Customize layout &amp; colors.\"><span></span>Appearance</button> </li>\n    <li class=\"ugsEditor-navInstruments ugsEditor-showOptionsBox\"> <button type=\"button\" data-target=\"tuningOptions\" title=\"Transpose song's key &amp; choose your prefered ukulele tuning\"><span></span>Transpose</button> </li>\n    <li class=\"ugsEditor-navOptions ugsEditor-showOptionsBox\"> <button type=\"button\" data-target=\"optionsDlg\" title=\"Advanced options &amp; settings\"><span></span>Options</button> </li>\n    <li class=\"ugsEditor-showDlgBtn ugsEditor-showOptionsBox\"> <button type=\"button\" data-target=\"helpDlg\" title=\"Help &amp; Quick tips on formatting your song\">?</button> </li>\n  </ul>\n  <h2 class=\"ugsLogo\">Uke Geeks Song-a-Matic</h2>\n</section>\n<!-- LAYOUT OPTIONS -->\n<aside class=\"ugsEditor-arrowBox ugsEditor-layoutOptions\" id=\"layoutOptions\">\n  <fieldset class=\"ugsEditor-arrowBoxContent ugsEditor-enablePseudoSelects\">\n    <dl>\n      <dt><label for=\"fontSizePicker\"><span>Font size 12pt</span> <em>&#9658;</em></label></dt>\n      <dd id=\"fontSizePicker\" data-action=\"zoomFonts\">\n        <ul class=\"ugsEditor-pseudoSelect\">\n          <li><a href=\"#6\">6 pt </a></li>\n          <li><a href=\"#6.5\">6.5 pt </a></li>\n          <li><a href=\"#7\">7 pt </a></li>\n          <li><a href=\"#7.5\">7.5 pt </a></li>\n          <li><a href=\"#8\">8 pt </a></li>\n          <li><a href=\"#8.5\">8.5 pt </a></li>\n          <li><a href=\"#9\">9 pt </a></li>\n          <li><a href=\"#9.5\">9.5 pt </a></li>\n          <li><a href=\"#10\">10 pt </a></li>\n          <li><a href=\"#11\">11 pt </a></li>\n          <li class=\"ugsEditor-checked\"><a href=\"#12\">12 pt </a></li>\n          <li><a href=\"#13\">13 pt </a></li>\n          <li><a href=\"#14\">14 pt </a></li>\n        </ul>\n      </dd>\n      <dt><label for=\"diagramSizePicker\"><span>Stupid Large diagrams</span> <em>&#9658;</em></label></dt>\n      <dd id=\"diagramSizePicker\" data-action=\"zoomDiagrams\">\n        <ul class=\"ugsEditor-pseudoSelect\">\n          <li><a href=\"#40\">Tiny </a></li>\n          <li><a href=\"#65\">Small </a></li>\n          <li><a href=\"#80\">Medium </a></li>\n          <li><a href=\"#90\">Large </a></li>\n          <li class=\"ugsEditor-checked\"><a href=\"#100\">Stupid Large </a></li>\n        </ul>\n      </dd>\n      <dt><label for=\"diagramPositionPicker\"><span>Reference diagrams on left</span> <em>&#9658;</em></label></dt>\n      <dd id=\"diagramPositionPicker\" data-action=\"layout\">\n        <ul class=\"ugsEditor-pseudoSelect\">\n          <li class=\"ugsEditor-checked\"><a href=\"#left\">On left side</a></li>\n          <li><a href=\"#top\">At the top</a></li>\n          <li><a href=\"#none\">Don't show</a></li>\n        </ul>\n      </dd>\n      <dt><label for=\"lyricChordsPicker\"><span>Chord names above lyrics</span> <em>&#9658;</em></label></dt>\n      <dd id=\"lyricChordsPicker\" data-action=\"placement\">\n        <ul class=\"ugsEditor-pseudoSelect\">\n          <li><a href=\"#inline\">Chord names inline </a></li>\n          <li class=\"ugsEditor-checked\"><a href=\"#above\">Chord names above </a></li>\n          <li><a href=\"#miniDiagrams\">Names &amp; diagrams above </a></li>\n        </ul>\n      </dd>\n      <dt><label for=\"colorPicker\"><span>Normal colors (white paper) </span><em>&#9658;</em></label></dt>\n      <dd id=\"colorPicker\" data-action=\"colors\">\n        <ul class=\"ugsEditor-pseudoSelect\"></ul>\n      </dd>\n    </dl>\n  </fieldset>\n</aside>\n<!-- TUNING OPTIONS -->\n<aside class=\"ugsEditor-arrowBox ugsEditor-tuningOptions\" id=\"tuningOptions\">\n  <fieldset class=\"ugsEditor-arrowBoxContent ugsEditor-enablePseudoSelects\">\n    <dl>\n      <dt><label for=\"transposePicker\"><span>Original key</span> <em>&#9658;</em></label></dt>\n      <dd id=\"transposePicker\" data-action=\"transpose\">\n        <ul class=\"ugsEditor-pseudoSelect\" id=\"transposeOptions\">\n          <li><a href=\"#down_6\">-6 <em>F#</em></a></li>\n          <li><a href=\"#down_5\">-5 <em>G</em></a></li>\n          <li><a href=\"#down_4\">-4 <em>G#</em></a></li>\n          <li><a href=\"#down_3\">-3 <em>A</em></a></li>\n          <li><a href=\"#down_2\">-2 <em>A#</em></a></li>\n          <li><a href=\"#down_1\">-1 <em>B</em></a></li>\n          <li class=\"ugsEditor-checked\"><a href=\"#up_0\">Original <em>C</em></a></li>\n          <li><a href=\"#up_1\">+1 <em>C#</em></a></li>\n          <li><a href=\"#up_2\">+2 <em>D</em></a></li>\n          <li><a href=\"#up_3\">+3 <em>D#</em></a></li>\n          <li><a href=\"#up_4\">+4 <em>E</em></a></li>\n          <li><a href=\"#up_5\">+5 <em>F</em></a></li>\n          <li><a href=\"#up_6\">+6 <em>F#</em></a></li>\n        </ul>\n      </dd>\n      <dt><label for=\"tuningPicker\"><span>Standard ukulele tuning</span> <em>&#9658;</em></label></dt>\n      <dd id=\"tuningPicker\" data-action=\"tuning\">\n        <ul class=\"ugsEditor-pseudoSelect\">\n          <li class=\"ugsEditor-checked\"><a href=\"#soprano\">GCEA Standard</a></li>\n          <li><a href=\"#baritone\">DGBE Baritone</a></li>\n          <li><a href=\"#alternate\">ADF#B Alternate</a></li>\n        </ul>\n      </dd>\n    </dl>\n  </fieldset>\n</aside>\n<!-- OTHER OPTIONS -->\n<aside class=\"ugsEditor-arrowBox ugsEditor-otherOptions\" id=\"optionsDlg\">\n  <fieldset class=\"ugsEditor-arrowBoxContent\">\n    <dl class=\"ugsEditor-enablePseudoSelects\">\n      <dt><label for=\"pagePicker\"><span>Paper</span> <em>&#9658;</em></label></dt>\n      <dd id=\"pagePicker\" data-action=\"paper\">\n        <ul class=\"ugsEditor-pseudoSelect\" id=\"pageWidth\">\n          <li class=\"ugsEditor-checked\"><a href=\"#letter\">US Letter (8.5 x 11 in)</a></li>\n          <li><a href=\"#a4\">A4 (21 x 29.7 cm)</a></li>\n          <li><a href=\"#screen\">full screen</a></li>\n        </ul>\n      </dd>\n    </dl>\n  </fieldset>\n  <fieldset class=\"ugsEditor-arrowBoxContent\">\n    <p class=\"ugsEditor-checkboxBlock\">\n      <input type=\"checkbox\" value=\"true\" id=\"chkEnclosures\" checked=\"checked\" />\n      <label for=\"chkEnclosures\">Hide chord enclosures\n        <span class=\"ugsEditor-checkBoxFinePrint\">don't put [brackets] around chord names</span>\n      </label>\n    </p>\n    <p class=\"ugsEditor-checkboxBlock\">\n      <input type=\"checkbox\" value=\"true\" id=\"chkSortAlpha\" checked=\"checked\" />\n      <label for=\"chkSortAlpha\">Sort reference diagrams alphabetically\n        <span class=\"ugsEditor-checkBoxFinePrint\">otherwise &ldquo;song order&rdquo; is used</span>\n      </label>\n    </p>\n    <p class=\"ugsEditor-checkboxBlock\">\n      <input type=\"checkbox\" value=\"true\" id=\"chkIgnoreCommon\" checked=\"checked\" />\n      <label for=\"chkIgnoreCommon\">Ignore common chords\n        <span class=\"ugsEditor-checkBoxFinePrint\">don't create master chord diagrams for these chords:</span>\n      </label>\n      <input type=\"text\" id=\"commonChordList\" value=\"\" />\n    </p>\n  </fieldset>\n</aside>\n<!-- HELP (DIALOG) -->\n<aside class=\"ugsEditor-arrowBox ugsEditor-helpOptions\" id=\"helpDlg\">\n  <fieldset class=\"ugsEditor-arrowBoxContent ugsEditor-linksList\">\n    <ul>\n      <li><a href=\"http://blog.ukegeeks.org/users-guide/\" target=\"_blank\" rel=\"noopener\" title=\"View the complete documentation including ChordPro tips\">User Guide</a></li>\n      <li><a href=\"http://ukegeeks.org/tools/chord-finder.htm\" target=\"_blank\" rel=\"noopener\" title=\"Access the UkeGeeks library of common chords\">Chord Finder</a></li>\n      <li><a href=\"http://ukegeeks.org/tools/reverse-chord-finder.htm\" target=\"_blank\" rel=\"noopener\" title=\"Find chord names by drawing the diagram\">Reverse Chord Lookup</a></li>\n    </ul>\n  </fieldset>\n</aside>\n\n<!-- REFORMAT (DIALOG) -->\n<section id=\"reformatDlg\" class=\"ugsEditor-reformatDlg ugsEditor-overlay ugsEditor-isHidden\">\n  <header class=\"ugsEditor-overlayHeader\">\n    <h3>Use Auto-Formated Version?</h3>\n  </header>\n  <div>\n    <p class=\"ugsEditor-instructions\">Whoa! I didn't find any chords in your song -- it's probably not in ChordPro format. Here's the converted version&hellip;</p>\n    <p class=\"ugsEditor-btnBar\">\n      <input type=\"button\" id=\"reformatYesBtn\" class=\"ugsEditor-baseBtn ugsEditor-blueBtn\" value=\"OK, Use This!\" />\n      <button type=\"button\" id=\"reformatNoBtn\" class=\"ugsEditor-noThanks\">No, Thanks!</button>\n    </p>\n    <textarea id=\"reformatSource\" wrap=\"off\"></textarea>\n    <p class=\"ugsEditor-instructions ugsEditor-small\">Want to make more adjustments? Click &ldquo;No Thanks&rdquo; and try the <a href=\"http://ukegeeks.org/tools\" target=\"_blank\" rel=\"noopener\" title=\"open the reformat tool in a new window\">Reformater Tool</a> instead.</p>\n    <p class=\"ugsEditor-instructions ugsEditor-small\"><input type=\"checkbox\" value=\"true\" id=\"reformatDisable\" /> <label for=\"reformatDisable\">Don't perform this check again.</label></p>\n  </div>\n</section>\n\n<!-- CHORD BUILDER (DIALOG) -->\n<section id=\"cdBldDlg\" class=\"ugsEditor-overlay ugsEditor-chordBuilderDlg ugsEditor-isHidden ugsEditor-chordBuilderNarrow\">\n  <header class=\"ugsEditor-overlayHeader\">\n    <h3>Chord Builder</h3>\n  </header>\n  <div>\n    <button type=\"button\" title=\"close this\" class=\"ugsEditor-closeBtn\">Close</button>\n    <div id=\"cdBldChooserPanel\">\n      <ul id=\"cdBldPick\" class=\"ugsChordChooser\"></ul>\n    </div>\n    <div id=\"cdBldBuilderPanel\" style=\"display:none\">\n      <p class=\"\">\n        <label for=\"cdBldChordName\">Chord Name: <input class=\"ugsEditor-chordName\" type=\"text\" id=\"cdBldChordName\" value=\"CHORDNAME\" /></label>\n      </p>\n      <div class=\"ugsEditor-editorSurface\" id=\"cdBldEditorSurface\">\n        <div class=\"ugsEditor-toolboxEdgeShadow ugsEditor-leftEdge\"></div>\n        <div id=\"cdBldToolbox\" class=\"ugsEditor-chordToolbox ugsEditor-leftEdge\">\n          <div class=\"ugsEditor-chordToolboxInner\">\n            <button type=\"button\" id=\"cdBldDotsBtn\" class=\"ugsEditor-toolChip ugsEditor-selected\" data-tool=\"dots\">Add Dots <span class=\"ugsEditor-bigDot\"></span></button>\n            <button type=\"button\" id=\"cdBldFingersBtn\" class=\"ugsEditor-toolChip\" data-tool=\"fingers\">Set Fingers <span id=\"cdBldBtnDiagram\" class=\"ugsEditor-fingerToolImage ugsEditor-finger1\"><span class=\"ugsEditor-fingerDot\"></span></span><span id=\"cdBldBtnFingerName\"></span></button>\n          </div>\n        </div>\n        <div class=\"ugsEditor-toolboxEdgeShadow ugsEditor-rightEdge\"></div>\n        <div class=\"ugsEditor-chordToolbox ugsEditor-rightEdge\">\n          <div class=\"ugsEditor-chordToolboxInner\">\n            <label for=\"cdBldStartingFret\" class=\"ugsEditor-toolChip\">Starting Fret\n              <select id=\"cdBldStartingFret\"></select>\n            </label>\n            <button type=\"button\" id=\"toolboxSlideUpBtn\" class=\"ugsEditor-toolChip ugsEditor-arrowUp\" data-direction=\"up\" title=\"move all dots -1 fret\">Slide Up</button>\n            <button type=\"button\" id=\"toolboxSlideDownBtn\" class=\"ugsEditor-toolChip ugsEditor-arrowDown\" data-direction=\"down\" title=\"move all dots +1 fret\">Slide Down</button>\n          </div>\n        </div>\n        <canvas id=\"cdBldCursorCanvas\" width=\"462\" height=\"300\"></canvas>\n        <canvas id=\"cdBldDiagramCanvas\" width=\"462\" height=\"300\"></canvas>\n      </div>\n\n      <p class=\"\">\n        <label for=\"cdBldShowOutputBtn\"><input id=\"cdBldShowOutputBtn\" type=\"checkbox\" value=\"0\" /> Show ChordPro output</label>\n      </p>\n      <p class=\"ugsEditor-btnBar\">\n        <input type=\"button\" value=\"Add\" class=\"ugsEditor-baseBtn ugsEditor-blueBtn\" id=\"cdBldSaveBtn\">\n        <button type=\"button\" id=\"cdBldCancelBtn\" class=\"ugsEditor-noThanks\">Cancel</button>\n      </p>\n      <div id=\"cdBldOutputBox\" class=\"ugsEditor-outputBox ugsEditor-collapseOutput\" style=\"clear:right;\">\n        <pre id=\"cdBldOutput\" class=\"chordPro-statement\" title=\"Your ChordPro define tag\"></pre>\n      </div>\n    </div>\n  </div>\n</section>";
    /**
     * Fills in a template:
     *   {{name}}         the value, HTML-escaped (existing entities kept)
     *   {{name|text}}    the value, every "&" escaped: the exact text, for a textarea
     *   {{#if name}}…{{/if}} and {{#unless name}}…{{/unless}}   the block only when the value is truthy / falsy
     * Blocks do not nest. Values are inserted in a single pass, so "{{" inside a song is left alone.
     */
    const render = (template, model) => template
        .replace(/\{\{#(if|unless) (\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, kind, key, block) => (Boolean(model[key]) === (kind === 'if') ? block : ''))
        .replace(/\{\{(\w+)(\|text)?\}\}/g, (_, key, text) => (text ? escText : esc)(model[key]));
    const displayStyle = (value) => (value && value.length > 0 ? 'block' : 'none');
    /**
     * @param {object} [options]
     * @param {boolean} [options.canSave=false] show the Save button (and the Edit Song dialog on load)
     * @param {string} [options.imgUrl='img/editor/'] folder holding the editor images, with a trailing slash
     * @param {string} [options.title] song title, pre-rendered into the songsheet
     * @param {string} [options.subtitle]
     * @param {string} [options.artist]
     * @param {string} [options.album]
     * @param {string} [options.body] the ChordPro text
     * @return {string} HTML
     */
    const editorHtml = (options) => {
        const o = Object.assign({ canSave: false, imgUrl: 'img/editor/' }, options);
        return render(EDITOR_TEMPLATE, {
            ...o,
            subtitleDisplay: displayStyle(o.subtitle),
            artistDisplay: displayStyle(o.artist),
            albumDisplay: displayStyle(o.album),
        });
    };
    return { editorHtml, escapeHtml: esc };
}));
;/**
 * Exposes the only method required to attach UkeGeeks Scriptasaurus Song-a-matic editor functionality.
 *
 * @class songAmatic
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.songAmatic = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    /**
     * attaches event handlers, preps variables, and runs UGS
     * @method init
     * @param options {OBJECT} (optional) Object/JSON with any of the ugsEditorPlus.options
     * @return {void}
     */
    _public.init = function (options) {
        const opts = mergeOptions(options);
        ugsEditorPlus.dom.setRoot(findRoot());
        ukeGeeks.settings.opts.retainBrackets = !opts.hideChordEnclosures;
        ugsEditorPlus.dom.toggle(document.getElementById('songSourceDlg'), opts.showEditOnLoad);
        // Song Formatter's init(options?) only reads options.definitions. The editor used to pass
        // opts.useLegacyIe here (the old library's "isIeFamily" flag), which init() ignored.
        ukeGeeks.scriptasaurus.init();
        ugsEditorPlus.songText.init();
        ugsEditorPlus.actions.init();
        ugsEditorPlus.topMenus.init();
        ugsEditorPlus.submenuUi.init();
        ugsEditorPlus.optionsDlg.init();
        ugsEditorPlus.chordBuilder.init();
        ugsEditorPlus.actions.run();
    };
    /**
     * The element holding the editor's markup: what mount() filled, or on a server-rendered
     * page the parent of editorHtml()'s output. The editor's lookups stay inside it.
     * @method findRoot
     * @private
     * @return {DOM-element|null} null (search the whole page) when the editor's parts aren't together
     */
    const findRoot = function () {
        const root = document.getElementById('ugsAppToolbar')?.parentElement;
        if (!root) {
            return null;
        }
        const together = ['scalablePrintArea', 'songSourceDlg', 'cdBldDlg'].every(function (id) {
            const part = document.getElementById(id);
            return !part || root.contains(part);
        });
        return together ? root : null;
    };
    const mergeOptions = function (options) {
        const opts = {
            hideChordEnclosures: !ukeGeeks.settings.opts.retainBrackets,
            sortAlphabetical: ukeGeeks.settings.opts.sortAlphabetical,
            ignoreCommonChords: ukeGeeks.settings.opts.ignoreCommonChords,
            commonChords: ukeGeeks.settings.commonChords
        };
        return Object.assign(ugsEditorPlus.options, opts, (options && typeof options === "object") ? options : {});
    };
    // ---------------------------------------
    // return public interface "JSON handle"
    // ---------------------------------------
    return _public;
}());
;/**
 * Mounts the Song-a-Matic editor into an empty element: writes the editor's
 * markup (ugsEditorPlus.markup), then runs songAmatic.init().
 *
 *   const editor = ugsEditorPlus.songAmatic.mount(document.getElementById('editor'), {
 *     song: chordProText,
 *     save: async (text) => 'Saved.', // optional; without it there's no Save button
 *     onChange: (text) => {},          // optional: the song's text changed
 *     aceUrl: '/js/ace/',              // optional
 *     imgUrl: '/img/editor/',          // optional
 *     fontSize: 14,                    // ...and any other ugsEditorPlus.options
 *   });
 *   editor.getSong();
 *   editor.save(); // what the Save button does
 *
 * The editor finds its elements by id, so a page holds one editor.
 *
 * @class songAmatic
 * @namespace ugsEditorPlus
 */
(() => {
    /**
     * The folder this bundle was loaded from, like ".../dist/" or "/js/" (with a trailing slash),
     * or "" when it can't be found.
     */
    const scriptFolder = () => {
        let folder = '';
        Array.prototype.forEach.call(document.scripts, (script) => {
            const pos = script.src.toLowerCase().indexOf('ugseditorplus');
            if (pos > 0) {
                folder = script.src.substr(0, pos);
            }
        });
        return folder;
    };
    /**
     * @method mount
     * @param container {HTMLElement} an empty element; the editor's markup is written into it
     * @param [options] {Object}
     * @param [options.song=''] {string} the ChordPro text to open
     * @param [options.save] {Function} takes the ChordPro text and returns (a promise of) a message to show;
     *   a rejection shows the "problem saving" alert. Without it there's no Save button.
     * @param [options.imgUrl] {string} folder holding the editor images; default "../img/editor/" from the bundle's folder
     * @param [options.aceUrl] {string} folder holding ace-chordpro.min.js; default "ace/" in the bundle's folder
     * @param [options.onChange] {Function} called with the ChordPro text each time it changes
     * @return {Object} `{ getSong(), save() }`
     */
    ugsEditorPlus.songAmatic.mount = (container, options) => {
        const { song = '', save, onChange, imgUrl, ...editorOptions } = options || {};
        const canSave = typeof save === 'function';
        container.innerHTML = ugsEditorPlus.markup.editorHtml({
            canSave,
            imgUrl: imgUrl || (scriptFolder() + '../img/editor/'),
            body: song,
        });
        document.body.classList.add('editableSongPage', 'pageWidth_screen');
        ugsEditorPlus.songAmatic.init(editorOptions);
        if (canSave) {
            ugsEditorPlus.updateSong.setSaveHandler(save);
        }
        // after init(), so what it does to the song as it opens isn't reported as a change
        ugsEditorPlus.songText.setChangeHandler(onChange || null);
        return {
            /** @return {string} the ChordPro text: the Fullscreen editor's while it's open, else the Edit Song box's */
            getSong: ugsEditorPlus.songText.get,
            /** @return {Promise<boolean>} saves as the Save button does; true when it saved */
            save: ugsEditorPlus.updateSong.save,
        };
    };
})();
;/**
 * Library for an HTML5 WYSIWYG editor to build ChordPro chord define tags.
 * @module  ugsChordBuilder
 * @namespace ugsChordBuilder
 * @main  ugsChordBuilder
 */
// Must stay var: a top-level var puts it on window, where Studio and the Songbook read it.
// eslint-disable-next-line no-var -- see above
var ugsChordBuilder = window.ugsChordBuilder || {};
ugsChordBuilder.version = '1.0.6';
/**
 * Entities (data containers) shared between the class libraries. Private
 * JSON objects used internally by a class are not included here.
 * @class entities
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.entities = {
    /** A rectangle on the canvas; with no size it's 1 x 1 */
    BoundingBox: class {
        constructor(pos, dimensions) {
            this.x = pos ? pos.x : 0;
            this.y = pos ? pos.y : 0;
            this.width = dimensions ? dimensions.width : 1;
            this.height = dimensions ? dimensions.height : 1;
        }
    },
    /** A finger dot on the fretboard */
    Dot: class {
        constructor(string, fret, finger) {
            this.string = string;
            this.fret = fret ? fret : 0;
            this.finger = finger ? finger : 0;
        }
    },
    /** A point on the canvas, in pixels */
    Position: class {
        constructor(x, y) {
            this.x = x ? x : 0;
            this.y = y ? y : 0;
        }
    }
};
/**
 * "Properties, Options, Preferences" such as fretboard size and colors; dot attributes, the cursors, fonts etc.
 * @class settings
 * @namespace ugsChordBuilder
 * @static
 * @final
 * @singleton
 */
ugsChordBuilder.settings = (function () {
    // "Revealing Module Pattern"
    // dependencies:
    const ents = ugsChordBuilder.entities;
    //'Geneva, "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, sans-serif';
    /**
     * San-serif font stack used when drawing text on Canvas.
     * @property {String} FONT_STACK
     * @final
     * @constant
     */
    const FONT_STACK = 'Arial, "Helvetica Neue", Helvetica, Verdana, sans-serif';
    /**
     * Fretboard upper left hand corner position (pseudo-constants)
     * @method anchorPos
     * @type {Position}
     * @static
     */
    const anchorPos = {
        x: 75,
        y: 75
    };
    const cursor = {
        fillColor: 'rgba(220, 216, 73, 0.35)', // 'rgba(245, 127, 18, 0.3)',
        strokeWidth: 1,
        strokeColor: '#AAB444', // '#F57F12',
        radius: 9,
        imageUri: '/img/editor/hand-cursor.png'
    };
    const fretBoard = {
        numFrets: 5,
        maxFret: 16,
        stringNames: ['G', 'C', 'E', 'A'],
        strokeWidth: 4,
        strokeColor: '#8F8569',
        fretSpace: 35,
        stringSpace: 30
    };
    const dot = {
        fillColor: '#F68014',
        radius: 11,
        strokeWidth: 2,
        strokeColor: '#D56333',
        fontWeight: 'bold',
        fontFamily: FONT_STACK,
        fontSize: 16,
        fontColor: '#ffffff'
    };
    const fretLabel = {
        fontFamily: FONT_STACK,
        fontSize: 28, // Pixels
        color: '#6A6A63',
        lightColor: '#EAEAE8' //D6D6D6' //A4A4A3'
    };
    const stringLabel = {
        fontFamily: FONT_STACK,
        fontSize: 34, // Pixels
        color: '#DCD849' // #AAB444'//
    };
    const chord = {
        nameMaxLength: 20
    };
    /**
     * Dimensions of a single target
     * @method targetDimensions
     * @return {JSON} {width: ?, height: ? }
     */
    const targetDimensions = function () {
        return {
            height: fretBoard.fretSpace,
            width: fretBoard.stringSpace
        };
    };
    /**
     * Top left-hand corner where Targets begin positioning
     * @method targetAnchorPos
     * @return {postion}
     */
    const targetAnchorPos = function () {
        const dimensions = targetDimensions();
        return new ents.Position(anchorPos.x - 0.5 * dimensions.width, anchorPos.y - dimensions.height - 0.2 * fretBoard.strokeWidth);
    };
    /**
     * re-centers the fretboard's anchor position
     * @method centerFretboard
     * @param  {element} canvas
     * @return {void}
     */
    const centerAnchor = function (canvas) {
        anchorPos.x = (0.5 * canvas.width) - (0.5 * (fretBoard.stringNames.length - 1) * fretBoard.stringSpace) - fretBoard.strokeWidth;
        anchorPos.y = (0.5 * canvas.height) - (0.5 * fretBoard.numFrets * fretBoard.stringSpace);
    };
    return {
        // Properties
        anchorPos: anchorPos,
        cursor: cursor,
        fretBoard: fretBoard,
        dot: dot,
        fretLabel: fretLabel,
        stringLabel: stringLabel,
        chord: chord,
        // Methods
        targetDimensions: targetDimensions,
        targetAnchorPos: targetAnchorPos,
        centerAnchor: centerAnchor
    };
}());
/**
 * Tracks curor position relative to fretboard's hot (clickable) regions
 * @class tracking
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.tracking = (function () {
    // dependencies:
    const ents = ugsChordBuilder.entities, settings = ugsChordBuilder.settings;
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    let targetBox = null;
    const getTarget = function () {
        if (targetBox) {
            return targetBox;
        }
        const dimensions = settings.targetDimensions();
        dimensions.width = dimensions.width * settings.fretBoard.stringNames.length;
        dimensions.height = dimensions.height * (settings.fretBoard.numFrets + 1);
        targetBox = new ents.BoundingBox(settings.targetAnchorPos(), dimensions);
        return targetBox;
    };
    /**
     * Returns TRUE if the two objects overlap
     * @method  collision
     * @param  {BoundingBox} object1
     * @param  {BoundingBox} object2
     * @return {bool}
     */
    const collision = function (object1, object2) {
        return (object1.x < object2.x + object2.width) && (object1.x + object1.width > object2.x) && (object1.y < object2.y + object2.height) && (object1.y + object1.height > object2.y);
    };
    /**
     * Converts position (x,y) to the fret
     * @method toDot
     * @param  {position} pos
     * @return {dot}
     */
    _public.toDot = function (pos) {
        const cursorBox = new ents.BoundingBox(pos);
        const box = getTarget();
        if (!collision(cursorBox, box)) {
            return null;
        }
        const dimensions = settings.targetDimensions();
        return new ents.Dot(Math.floor((pos.x - box.x) / dimensions.width), Math.floor((pos.y - box.y) / dimensions.height));
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
/**
 * Did I overlook this or was it deliberate? Either case, the "fret" in the dot object is
 * merely the fret in the visible diagram -- that is, a value between 0 and maxFrets, not
 * the actual fret on the instrument... beware.
 *
 * Unless otherwise stated all "dot" parames are of type ugsChordBuilder.entities.dot
 * @class fretDots
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.fretDots = (function () {
    // dependencies:
    const ents = ugsChordBuilder.entities, anchor_pos = ugsChordBuilder.settings.anchorPos, opts_board = ugsChordBuilder.settings.fretBoard, opts_dot = ugsChordBuilder.settings.dot;
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    // locals
    const _dots = [];
    _public.getDots = function () {
        return _dots.slice();
    };
    _public.slide = function (numSteps) {
        if (!inRange(numSteps)) {
            return false;
        }
        for (const dot of _dots) {
            dot.fret = dot.fret + numSteps;
        }
        return true;
    };
    const inRange = function (numSteps) {
        for (const dot of _dots) {
            if ((dot.fret + numSteps < 1) || (dot.fret + numSteps > opts_board.numFrets)) {
                return false;
            }
        }
        return true;
    };
    _public.toggleDot = function (dot) {
        if (dot.fret === 0) {
            clearColumn(dot.string);
            return;
        }
        const index = find(dot);
        if (index < 0) {
            _dots.push(dot);
        }
        else {
            _dots.splice(index, 1);
        }
    };
    _public.toggleFinger = function (dot, finger) {
        const found = _dots[find(dot)];
        if (!found) {
            return false;
        }
        found.finger = found.finger === finger ? 0 : finger;
        return true;
    };
    /**
     * Clears all saved dots.
     * @method reset
     */
    _public.reset = function () {
        for (let i = 0; i < opts_board.stringNames.length; i++) {
            clearColumn(i);
        }
    };
    /**
     * Returns index of Dot within _dots or -1 if not found.
     * @method find
     * @param  {entities.dot} dot
     * @return {int}
     */
    const find = function (dot) {
        for (let i = _dots.length - 1; i >= 0; i--) {
            const other = _dots[i];
            if (other && other.string === dot.string && other.fret === dot.fret) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Clears all dots for a particular string.
     * @method clearColumn
     * @param string {int}
     */
    const clearColumn = function (string) {
        for (let i = _dots.length - 1; i >= 0; i--) {
            const dot = _dots[i];
            if (dot && dot.string === string) {
                _dots.splice(i, 1);
            }
        }
    };
    const getPosition = function (dot) {
        return new ents.Position(anchor_pos.x + 0.47 * opts_board.strokeWidth + dot.string * opts_board.stringSpace, anchor_pos.y + 0.47 * opts_board.strokeWidth + (dot.fret - 0.5) * opts_board.fretSpace);
    };
    const drawDot = function (context, pos) {
        context.beginPath();
        context.arc(pos.x, pos.y, opts_dot.radius, 0, 2 * Math.PI, false);
        context.fillStyle = opts_dot.fillColor;
        context.fill();
        context.lineWidth = opts_dot.strokeWidth;
        context.strokeStyle = opts_dot.strokeColor;
        context.stroke();
    };
    const addLabel = function (context, pos, text) {
        context.font = opts_dot.fontWeight + ' ' + opts_dot.fontSize + 'px ' + opts_dot.fontFamily;
        context.textAlign = 'center';
        context.fillStyle = opts_dot.fontColor;
        context.fillText(String(text), pos.x, pos.y + 0.3 * opts_dot.fontSize);
    };
    _public.draw = function (context) {
        for (let i = _dots.length - 1; i >= 0; i--) {
            const dot = _dots[i];
            if (!dot) {
                continue;
            }
            const pos = getPosition(dot);
            drawDot(context, pos);
            if (dot.finger > 0) {
                addLabel(context, pos, dot.finger);
            }
        }
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
/**
 * Plots cursor moving across its own canvas context.
 * @class cursorCanvas
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.cursorCanvas = (function () {
    // dependencies
    const opts_cursor = ugsChordBuilder.settings.cursor, opts_dot = ugsChordBuilder.settings.dot;
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    // set by init(), which editorUi calls before anything draws. (Typing these honestly means passing the
    // context to each draw function: a rewrite, for when the Chord Builder becomes a module.)
    let _context = null;
    let _handImage = null;
    let _imgOk = false;
    let _dotCursor = true;
    let _finger = 1;
    let _lastPos = {
        x: 0,
        y: 0
    };
    _public.init = function (ctx) {
        _context = ctx;
        loadImage();
    };
    const erase = function (pos) {
        const radius = opts_cursor.radius + opts_cursor.strokeWidth;
        // Need to allow for dot, image, and the finger number -- magic number for now:
        _context.clearRect(pos.x - radius, pos.y - radius, radius + 50, radius + 60);
        /*
        if (_imgOk) {
            _context.clearRect(pos.x - radius, pos.y - radius, radius + _handImage.width, radius + _handImage.height);
        } else {
            _context.clearRect(pos.x - radius, pos.y - radius, 2 * radius, 2 * radius);
        }
        */
    };
    const drawHandCursor = function (pos) {
        _context.drawImage(_handImage, pos.x, pos.y);
        _context.font = opts_dot.fontWeight + ' ' + opts_dot.fontSize + 'px ' + opts_dot.fontFamily;
        _context.textAlign = 'left';
        _context.fillStyle = 'black'; //opts_dot.fontColor;
        _context.fillText(String(_finger), pos.x + 0.8 * _handImage.width, pos.y + _handImage.height);
        // not centering pos.x - 0.5 * _handImage.width, pos.y - 0.5 * _handImage.height);
    };
    const loadImage = function () {
        _handImage = new Image();
        _handImage.onload = function () {
            _imgOk = true;
        };
        _handImage.src = opts_cursor.imageUri;
    };
    const drawDotCursor = function (pos) {
        _context.beginPath();
        _context.arc(pos.x, pos.y, opts_cursor.radius, 0, 2 * Math.PI, false);
        _context.fillStyle = opts_cursor.fillColor;
        _context.fill();
        _context.lineWidth = opts_cursor.strokeWidth;
        _context.strokeStyle = opts_cursor.strokeColor;
        _context.stroke();
    };
    _public.setCursor = function (isDot, finger) {
        _dotCursor = isDot;
        _finger = finger;
    };
    _public.draw = function (pos) {
        erase(_lastPos);
        if (!_imgOk || _dotCursor) {
            drawDotCursor(pos);
        }
        else {
            drawHandCursor(pos);
        }
        _lastPos = pos;
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
/**
 * Plots chord diagram (fretboard with fret labels) on its canvas context.
 * @class chordCanvas
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.chordCanvas = (function () {
    // dependencies
    const ents = ugsChordBuilder.entities, center_anchor = ugsChordBuilder.settings.centerAnchor, anchor_pos = ugsChordBuilder.settings.anchorPos, opt_fLabel = ugsChordBuilder.settings.fretLabel, opt_sLabel = ugsChordBuilder.settings.stringLabel, opts_board = ugsChordBuilder.settings.fretBoard;
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    // set by init() (see cursorCanvas above)
    let _context = null, _canvas = null;
    _public.init = function (ctx, ele) {
        _context = ctx;
        _canvas = ele;
        center_anchor(_canvas);
    };
    const erase = function () {
        _context.clearRect(0, 0, _canvas.width, _canvas.height);
    };
    const addLabel = function (text, color, pos) {
        _context.font = opt_fLabel.fontSize + 'px ' + opt_fLabel.fontFamily;
        _context.textAlign = 'right';
        _context.fillStyle = color;
        _context.fillText(String(text), pos.x, pos.y);
    };
    const addLabels = function (startingFret) {
        const pos = new ents.Position(anchor_pos.x - 0.3 * opt_fLabel.fontSize, anchor_pos.y + opt_fLabel.fontSize);
        let color = startingFret > 1 ? opt_fLabel.color : opt_fLabel.lightColor;
        for (let i = 0; i < opts_board.numFrets; i++) {
            addLabel(startingFret + i, color, pos);
            pos.y += opts_board.fretSpace;
            color = opt_fLabel.lightColor;
        }
    };
    const addStringName = function (text, pos) {
        _context.font = opt_sLabel.fontSize + 'px ' + opt_sLabel.fontFamily;
        _context.textAlign = 'center';
        _context.fillStyle = opt_sLabel.color;
        _context.fillText(text, pos.x, pos.y);
    };
    const addStringNames = function () {
        const pos = new ents.Position(anchor_pos.x + 0.5 * opts_board.strokeWidth, anchor_pos.y - 0.25 * opt_fLabel.fontSize);
        for (const stringName of opts_board.stringNames) {
            addStringName(stringName, pos);
            pos.x += opts_board.stringSpace;
        }
    };
    const drawFretboard = function () {
        let i, x, y;
        // width offset, a "subpixel" adjustment
        const offset = opts_board.strokeWidth / 2;
        // locals
        const stringHeight = opts_board.numFrets * opts_board.fretSpace;
        const fretWidth = (opts_board.stringNames.length - 1) * opts_board.stringSpace;
        // build shape
        _context.beginPath();
        // add "C" & "E" strings
        for (i = 1; i < (opts_board.stringNames.length - 1); i++) {
            x = anchor_pos.x + i * opts_board.stringSpace + offset;
            _context.moveTo(x, anchor_pos.y + offset);
            _context.lineTo(x, anchor_pos.y + stringHeight + offset);
        }
        // add frets
        for (i = 1; i < opts_board.numFrets; i++) {
            y = anchor_pos.y + i * opts_board.fretSpace + offset;
            _context.moveTo(anchor_pos.x + offset, y);
            _context.lineTo(anchor_pos.x + fretWidth + offset, y);
        }
        //
        _context.rect(anchor_pos.x + offset, anchor_pos.y + offset, fretWidth, stringHeight);
        // stroke shape
        _context.strokeStyle = opts_board.strokeColor;
        _context.lineWidth = opts_board.strokeWidth;
        _context.stroke();
        _context.closePath();
    };
    _public.draw = function (pos, startingFret) {
        erase();
        // ugsChordBuilder.debugTargets.drawTargets(_context);
        addLabels(startingFret);
        addStringNames();
        drawFretboard();
        ugsChordBuilder.fretDots.draw(_context);
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
/**
 * Turns the dots on the fretboard into a ChordPro chord definition,
 * `{define: Name frets 0 2 3 2 fingers 0 1 2 3}`, plus an `add: string 1 fret 1 finger 1` for each
 * string with a second dot. The chooser list saves it into the song.
 * @class export
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.export = (function () {
    // dependencies
    const opts_board = ugsChordBuilder.settings.fretBoard, opts_chord = ugsChordBuilder.settings.chord;
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    // set by getDefinition() before anything reads it
    let _fretOffset = 0;
    /**
     * One string's dots: think of a necklace where the thread, the instrument string, has
     * zero or more beads, the dots (fret plus finger).
     */
    class StringDots {
        constructor(string, dots) {
            this.string = string;
            this.dots = dots ? dots : [];
        }
    }
    const getStringDots = function () {
        // initialize empty string array
        const aryStringDots = [];
        for (let stringNumber = 1; stringNumber <= opts_board.stringNames.length; stringNumber++) {
            aryStringDots.push(new StringDots(stringNumber));
        }
        // add dots
        const dots = ugsChordBuilder.fretDots.getDots();
        // (each string gets its dots last to first, as getFinger() expects)
        const lastToFirst = dots.slice().reverse();
        for (const stringDots of aryStringDots) {
            for (const dot of lastToFirst) {
                if (stringDots.string === dot.string + 1) {
                    stringDots.dots.push(dot);
                }
            }
        }
        return aryStringDots;
    };
    /**
     * Returns the minimum & maximum fret found withing array (of dots)
     * @method getMinMax
     * @param  {dot_array} ary
     * @return {JSON}
     */
    const getMinMax = function (ary) {
        let max = 0;
        let min = 900;
        for (const dot of ary) {
            if (dot.fret > max) {
                max = dot.fret;
            }
            if (dot.fret < min) {
                min = dot.fret;
            }
        }
        return {
            max: max,
            min: (min < 900) ? min : max
        };
    };
    /**
     * Handles the offset, translates from fret (on the diagram's N frets) to the insturment's complete fretbaord
     * @method  fretNumber
     * @param  {int} fret
     * @return {int}
     */
    const fretNumber = function (fret) {
        return fret > 0 ? _fretOffset + fret : 0;
    };
    /**
     * Not too surprisingly this finds "fret" within dots and returns finger. If there isn't a dot
     * for fret returns zed.
     * @method  getFinger
     * @param  {array} dots
     * @param  {int} fret
     * @return {int}
     */
    const getFinger = function (dots, fret) {
        for (const dot of dots) {
            if (dot.fret === fret) {
                return dot.finger;
            }
        }
        return 0;
    };
    /**
     * Returns an array of ints, one for each string, with the HIGHEST REAL fret appearing on that string.
     * Default is zed per string.
     * @method getPrimaryFrets
     * @param  {int} startingFret
     * @return {int}
     */
    _public.getPrimaryFrets = function (startingFret) {
        _fretOffset = startingFret - 1;
        const dotsPerString = getStringDots();
        const primaries = [];
        for (const stringDots of dotsPerString) {
            const minMax = getMinMax(stringDots.dots);
            primaries.push(fretNumber(minMax.max));
        }
        return primaries;
    };
    /**
     * Returns complete ChordPro definition statement
     * @method getDefinition
     * @param  {string} chordName
     * @param  {int} startingFret
     * @return {string}
     */
    _public.getDefinition = function (chordName, startingFret) {
        chordName = scrub(chordName);
        const name = (chordName && chordName.length > 0) ? chordName : 'CHORDNAME';
        let fretsStr = '';
        let fingersString = '';
        let addsString = '';
        _fretOffset = startingFret - 1;
        const dotsPerString = getStringDots();
        for (const stringDots of dotsPerString) {
            const minMax = getMinMax(stringDots.dots);
            fretsStr += fretNumber(minMax.max) + ' ';
            fingersString += getFinger(stringDots.dots, minMax.max) + ' ';
            if (minMax.max !== minMax.min) {
                addsString += ' add: string ' + stringDots.string + ' fret ' + fretNumber(minMax.min) + ' finger ' + getFinger(stringDots.dots, minMax.min);
            }
        }
        // no double spaces, no space before the closing "}"
        return ('{define: ' + name + ' frets ' + fretsStr + ' fingers ' + fingersString + addsString + '}').replace(/\s+/g, ' ').replace(' }', '}');
    };
    /**
     * Returns "highlighted" (HTML-ified) ChordPro definition statement.
     * @method getDefinition
     * @param  {string} chordName
     * @param  {int} startingFret
     * @return {string}
     */
    _public.getDefinitionHtml = function (chordName, startingFret) {
        chordName = scrub(chordName);
        // Keep regexs simple by a couple cheats:
        // First, using 'X07MX001' as my CSS clasname prefix to avoid collisions.
        // We temporarily remove the name, then put it back in the very last step.
        let html = _public.getDefinition(chordName, startingFret);
        html = html.replace(' ' + chordName, ' ' + 'X07Myq791wso01');
        html = html.replace(/\b(\d+)\b/g, '<span class="chordPro-X07MX001number">$1</span>');
        html = html.replace(/\b(frets?|fingers?|string)\b/g, '<span class="chordPro-X07MX001attribute">$1</span>');
        html = html.replace(/\b(define|add)\b/g, '<span class="chordPro-X07MX001keyword">$1</span>');
        // the name can come from the song's {define}: escape it (the rest is numbers and keywords).
        // A function, not a string, puts it in: replace() would read a "$&" or "$$" in the name as a pattern.
        const nameHtml = '<span class="chordPro-string">' + ukeGeeks.toolsLite.escapeHtml(chordName) + '</span>';
        return html
            .replace('X07Myq791wso01', function () {
            return nameHtml;
        })
            .replace(/X07MX001/g, '')
            .replace(/ +/g, ' ');
    };
    /**
     * Returns "safe" version of chord name, removing disallowed characters and reserved names (such as "add:")
     * @method scrub
     * @param  {string} chordName
     * @return {string}
     */
    const scrub = function (name) {
        // paranoia protection: no reserved words (makes life easier for parsing)
        const disallow = /^(frets|fingers|add:)$/i;
        // trim leading & trailing spaces, internal spaces get smushed into single dash
        let cleaned = name.replace(/^\s*(.*?)\s*$/, '$1').replace(/\s+/g, '-');
        if (disallow.test(cleaned)) {
            cleaned = '';
        }
        return cleaned.substring(0, opts_chord.nameMaxLength);
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
;/**
 * The Chord Builder's first panel: lists the song's `{define: ...}` chords, read from the
 * Edit Song box. Opening one (or "new") hands it to the builder; saving writes the definition
 * back into the Edit Song box and redraws the song (actions.run()).
 * @class chooserList
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.chooserList = (function () {
    /**
     * attach public members to this object
     * @property _public
     * @type JsonObject
     */
    const _public = {};
    // array of custom chords defined in this song
    let _chordDictionary = [];
    // the HTML UL element (the editor's checked lookup: ugsEditorPlus.dom loads before the Chord Builder)
    const chordListEle = function () {
        return ugsEditorPlus.dom.byId(_ids.chordList, HTMLElement);
    };
    /**
     * magic value for start a new chord (constant)
     * @final
     * @attribute C_NEW_CHORD
     * @type {Int}
     */
    const C_NEW_CHORD = -1;
    // next available Id used on LI's
    let _nextId = 0;
    // HTML element Ids
    const _ids = {
        // ChordPro Song -- the unmodified source
        source: 'chordProSource',
        // the UL where we'll be loading the chords
        chordList: 'cdBldPick',
        builderPanel: 'cdBldBuilderPanel',
        chooserPanel: 'cdBldChooserPanel'
    };
    /**
     * Chord current sent to the editor.
     * @attribute _currentChord
     */
    let _currentChord = null;
    /**
     * Handle to the chordBuilder (UI) "setChord" method
     * @attribute _setChordMethod
     */
    let _setChordMethod = function () { };
    /**
     * Hanlde to instance of Scriptasaurus chord brush class, to paint the wee little
     * chord diagrams onto the Chooser List.
     * @attribute _ugsBrushTool
     * @type {Object}
     */
    let _ugsBrushTool = null;
    /**
     * Required settings for the Chord Brush -- dimensions, fonts, and colors.
     * @attribute _diagramSettings
     * @type {JSON}
     */
    const _diagramSettings = {
        dimensions: {
            showText: false,
            height: 50,
            width: 40,
            fretSpace: 9,
            stringSpace: 7,
            dotRadius: 3,
            lineWidth: 1,
            topLeftPos: {
                x: 10,
                y: 2
            },
            xWidth: 0.7 * 7,
            xStroke: 1.4 * 1
        },
        fonts: {
            dot: '8pt Arial',
            text: '8pt Arial',
            fret: '8pt Arial'
        },
        colors: {
            fretLines: '#EED18E',
            dots: '#551D00', //'#9A532D',
            dotText: '#ffffff',
            text: '#000000',
            fretText: '#EED18E',
            xStroke: '#551D00'
        }
    };
    /** A {define} from the song; its list item has the same id (data-id) */
    class ChordDefinition {
        constructor(name, definition) {
            /** the next free id: 0, 1, 2... (reset() starts over) */
            this.id = _nextId++;
            this.name = name;
            this.definition = definition;
        }
    }
    /**
     * @method init
     * @param  {function} setChordFunction
     */
    _public.init = function (setChordFunction) {
        _setChordMethod = setChordFunction;
        // attach click handler to the UL avoids need to attach to individual LI items (these get added & deleted frequently)
        chordListEle().addEventListener('click', onClick, false);
        _start();
    };
    const _start = function () {
        songGetDefinitions(ugsEditorPlus.dom.byId(_ids.source, HTMLTextAreaElement).value);
        listLoad(chordListEle(), _chordDictionary);
    };
    _public.reset = function () {
        _chordDictionary = [];
        chordListEle().innerHTML = '';
        _nextId = 0;
        _currentChord = null;
        _start();
    };
    /**
     * Shows either the "Chooser" or "Chord Builder/Editor" panel.
     * @method show
     * @public
     * @param {bool} isChooserPanel
     */
    _public.show = function (isChooserPanel) {
        const dom = ugsEditorPlus.dom;
        const chooserPanel = dom.byId(_ids.chooserPanel, HTMLElement);
        chooserPanel.style.display = isChooserPanel ? 'block' : 'none';
        dom.byId(_ids.builderPanel, HTMLElement).style.display = !isChooserPanel ? 'block' : 'none';
        dom.closest(chooserPanel, '.ugsEditor-overlay', HTMLElement).classList.toggle('ugsEditor-chordBuilderNarrow', isChooserPanel);
    };
    /**
     * Returns TRUE if Save completed OK, false otherwise (duplicate name or unable to update)
     * @method save
     * @param  {JSON} data
     * @return {bool}
     */
    _public.save = function (data) {
        if (dictionaryFindDupes(_currentChord == null ? -1 : _currentChord.id, data.name) >= 0) {
            alert('Hey, this chord name is already being used.');
            return false;
        }
        let id;
        if (_currentChord == null) {
            id = definitionAdd(data.name, data.definition);
            _currentChord = dictionaryFind(id);
            songAddDefinition(data.definition);
        }
        else {
            const chord = _chordDictionary[dictionaryGetIndex(_currentChord.id)];
            if (!chord) {
                // console.log('error: not found');
                return false;
            }
            const oldDefinition = chord.definition;
            chord.name = data.name;
            chord.definition = data.definition;
            id = chord.id;
            songReplace(oldDefinition, chord.definition);
        }
        listUpdate(id);
        _public.show(true);
        return true;
    };
    /**
     * Handles confirming & removing a chord from the list and the song.
     * @method doDelete description]
     * @param  {ChordDefinition} chord
     * @return {void}
     */
    const doDelete = function (chord) {
        if (!confirm('Delete definition for "' + chord.name + '"?')) {
            return;
        }
        const item = listGetItem(chord.id);
        if (!item) {
            return;
        }
        chordListEle().removeChild(item);
        songReplace(chord.definition, '');
    };
    /**
     * ListItem click event handler
     * @method onClick
     * @param  {Event} evt
     */
    const onClick = function (evt) {
        evt.preventDefault();
        // the click lands on an item (or its delete button) in the chord list
        const target = evt.target;
        if (!(target instanceof Element)) {
            return;
        }
        _currentChord = dictionaryFind(target.getAttribute('data-id'));
        if (target.getAttribute('data-action') === 'delete') {
            if (_currentChord) {
                doDelete(_currentChord);
            }
            return;
        }
        let chord = null;
        if (_currentChord != null) {
            chord = ukeGeeks.chordImport.runLine(_currentChord.definition);
            if (chord && hasMutedStrings(chord)) {
                alert('Uh-oh! This chord uses muted strings!\nCurrently the Chord Builder does not support muted strings -- \nsaving edits will result in mutes being lost.');
            }
        }
        _setChordMethod(chord);
        _public.show(false);
    };
    /**
     * Checks whether any of the Chord's strings have been muted.
     * @method hasMutedStrings
     * @param  {ugs.chord}  chord
     * @return {Boolean}
     */
    const hasMutedStrings = function (chord) {
        if (chord.muted) {
            for (let i = 0; i < chord.muted.length; i++) {
                if (chord.muted[i]) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * updates an exiting HTML ListItem (LI) using the info stored for Id in
     * the chord dictionary (array). Appends new ListItem if not found.
     * @method listUpdate
     * @param  {int} id
     * @return {DOM_LI}
     */
    const listUpdate = function (id) {
        const def = dictionaryFind(id);
        if (!def) {
            // (save() passes the id it just added or updated)
            return null;
        }
        let item = listGetItem(id);
        if (!item) {
            item = listAddItem(id, def.name);
        }
        else {
            item.innerHTML = listHtmlString(id, def.name, true);
        }
        listAddDiagram(id);
        return item;
    };
    /**
     * finds the HTML ListItem corresponding to Id
     * @method listGetItem
     * @param  {int} id
     * @return {DOM_LI}
     */
    const listGetItem = function (id) {
        const items = chordListEle().getElementsByTagName('li');
        for (const item of items) {
            if (item.getAttribute('data-id') === ('' + id)) {
                return item;
            }
        }
        return null;
    };
    /**
     * Returns HTML snippet for an LI
     * @method listHtmlString
     * @param  {int} id
     * @param  {string} name chord name, straight from the song's {define}: HTML-escaped here
     * @param  {bool} isInner (optional) if TRUE only reutrns the inner HTML part, otherwise returns complete LI tag
     * @return {string}
     */
    const listHtmlString = function (id, name, isInner) {
        isInner = (arguments.length > 2) ? isInner : false;
        const innerHtml = '<span class="ugsEditor-deleteChord" data-id="' + id + '" data-action="delete" title="Remove this definition"></span>' + ukeGeeks.toolsLite.escapeHtml(name);
        return isInner ? innerHtml : '<li data-id="' + id + '" title="Edit this definition" class="ugs-grouped">' + innerHtml + '</li>';
    };
    /**
     * Clears and loads the HTML UL using currently values in Chord Dictionary
     * @method listLoad
     * @param {DOM_UL} ul
     * @param {array} chordDefs
     */
    const listLoad = function (ul, chordDefs) {
        let s = '';
        for (const chordDef of chordDefs) {
            s += listHtmlString(chordDef.id, chordDef.name);
        }
        ul.innerHTML = '<li data-id="' + C_NEW_CHORD + '" class="ugsEditor-newChord">+ Add New Chord</li>' + s;
        const items = ul.getElementsByTagName('li');
        // last to first, skipping the first item ("+ Add New Chord")
        for (let i = items.length - 1; i >= 1; i--) {
            const item = items[i];
            if (item) {
                listAddDiagram(item.getAttribute('data-id'));
            }
        }
    };
    /**
     * Appends a new HTML ListItem to our UL.
     * @method listAddItem
     * @param  {int} id
     * @param  {string} name
     */
    const listAddItem = function (id, name) {
        const temp = document.createElement('ul');
        temp.innerHTML = listHtmlString(id, name);
        const item = temp.firstChild;
        if (item) {
            chordListEle().appendChild(item);
        }
    };
    /**
     * Adds mini-chord diagram to the list item found by Id.
     * @method listAddDiagram
     */
    const listAddDiagram = function (id) {
        const element = listGetItem(id);
        const defintion = dictionaryFind(id);
        // (the list holds an item for each definition)
        if (!element || !defintion) {
            return;
        }
        const chord = ukeGeeks.chordImport.runLine(defintion.definition);
        if (!chord) {
            // Song Formatter can't read this {define}: no mini-diagram
            return;
        }
        //var fretBox = ukeGeeks.settings.inlineFretBox;
        //var fontSettings = ukeGeeks.settings.inlineFretBox.fonts;
        if (_ugsBrushTool == null) {
            _ugsBrushTool = new ukeGeeks.chordBrush();
        }
        _ugsBrushTool.plot(element, chord, _diagramSettings.dimensions, _diagramSettings.fonts, _diagramSettings.colors);
    };
    /**
     * Replaces every occurrence of searchValue in text with newValue, both taken as plain text.
     * (Not String.replace: it reads "$&" or "$$" in newValue as patterns, and a chord name can
     * contain them.)
     * @method replaceAll
     * @param  {string} text
     * @param  {string} searchValue
     * @param  {string} newValue
     * @return {string}
     */
    const replaceAll = function (text, searchValue, newValue) {
        return text.split(searchValue).join(newValue);
    };
    /**
     * Updates Source and Runs Scriptasaurus after updaint the definition
     * @method songReplace
     * @param  {string} oldDefinition
     * @param  {string} newDefinition
     * @return {void}
     */
    const songReplace = function (oldDefinition, newDefinition) {
        const e = ugsEditorPlus.dom.byId(_ids.source, HTMLTextAreaElement);
        e.value = replaceAll(e.value, oldDefinition, newDefinition);
        ugsEditorPlus.songText.changed();
        ugsEditorPlus.actions.run();
    };
    /**
     * Loops over all lines in "text" and extracts any {define:...} statements, adding
     * them to the ChordDictionary.
     * @method songGetDefinitions
     */
    const songGetDefinitions = function (text) {
        const defineRegEx = /\{define:\s*([^}]+?)\s+frets[^}]+?\}/im;
        const lines = text.split('\n');
        // last line to first
        for (const line of lines.reverse()) {
            if (!defineRegEx.test(line)) {
                continue;
            }
            definitionAdd(line.replace(defineRegEx, '$1'), line);
        }
    };
    /**
     * Inserts the passed chord definition into the song (and reruns Sscriptasaurus).
     * The chord insertion point is at the end of either the song meta tags or the
     * existing chord defintion block. Determined by the _last_ "header" tag line.
     * @method songAddDefinition
     * @param {string} definition
     */
    const songAddDefinition = function (definition) {
        const choProText = ugsEditorPlus.dom.byId(_ids.source, HTMLTextAreaElement);
        const instructionRegEx = /\s*\{\s*(title|t|artist|subtitle|st|album|define):.*?\}/im;
        const lines = choProText.value.split('\n');
        let html = '';
        let inserted = false;
        // last line to first
        for (const line of lines.reverse()) {
            if (!inserted && instructionRegEx.test(line)) {
                html = definition + '\n' + html;
                inserted = true;
            }
            html = line + '\n' + html;
        }
        if (!inserted) {
            html = definition + '\n' + choProText.value;
        }
        choProText.value = html;
        ugsEditorPlus.songText.changed();
        ugsEditorPlus.actions.run();
    };
    /**
     * Returns Index of Id within the chord Dictionary or -1 if not found.
     * @method dictionaryGetIndex
     * @param  {int} id
     * @return {int}
     */
    const dictionaryGetIndex = function (id) {
        return _chordDictionary.findIndex(function (chord) {
            return '' + chord.id === '' + id;
        });
    };
    /**
     * Returns index of the duplicate chord name. Pass in Id of the chord to be ignored,
     * (i.e. the one currently being edited). Comparison ignores case. Returns -1 if no
     * dupe is found.
     * @method dictionaryFindDupes
     * @param  {int} id
     * @param  {string} name
     * @return {int}
     */
    const dictionaryFindDupes = function (id, name) {
        const search = name.toLowerCase();
        for (let i = _chordDictionary.length - 1; i >= 0; i--) {
            const chord = _chordDictionary[i];
            if (chord && ('' + chord.id !== '' + id) && (chord.name.toLowerCase() === search)) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Returns the entry for Id from Chord Dictionary
     * @method dictionaryFind
     * @param  {int} id
     * @return {ChordDefinition}
     */
    const dictionaryFind = function (id) {
        return _chordDictionary[dictionaryGetIndex(id)] ?? null;
    };
    /**
     * Adds new chord definition to our Dictionary array. Returns the
     * new item's Id (int).
     * @method definitionAdd
     * @param {string} name
     * @param {string} definition
     * @return {int}
     */
    const definitionAdd = function (name, definition) {
        const chord = new ChordDefinition(name, definition);
        _chordDictionary.push(chord);
        return chord.id;
    };
    // ---------------------------------------
    // return public interface
    // ---------------------------------------
    return _public;
}());
;/**
 * The Chord Builder's second panel: two stacked canvases (the fretboard and dots underneath,
 * the cursor on top), the toolbox (dot or finger tool, slide up/down), the name and starting
 * fret fields, and the {define} it makes. Add/Update hands that to chooserList.save().
 * @class editorUi
 * @constructor
 * @namespace ugsChordBuilder
 */
ugsChordBuilder.editorUi = function () {
    const _ids = {
        // top-most container, the "master drawing surface"
        container: 'cdBldEditorSurface',
        // stacked canvas elements
        cursorCanvas: 'cdBldCursorCanvas',
        diagramCanvas: 'cdBldDiagramCanvas',
        // chord definition meta: name & fret
        startingFret: 'cdBldStartingFret',
        chordName: 'cdBldChordName',
        // container wrapping sliding toolbox pallet
        toolbox: 'cdBldToolbox',
        // toolbox buttons:
        dotsBtn: 'cdBldDotsBtn',
        fingersBtn: 'cdBldFingersBtn',
        slideUpBtn: 'toolboxSlideUpBtn',
        slideDownBtn: 'toolboxSlideDownBtn',
        // display on "Hand" toolbox button
        btnFingerName: 'cdBldBtnFingerName',
        btnHandPic: 'cdBldBtnDiagram',
        // container for generated chordPro "define" tag (colorized)
        output: 'cdBldOutput',
        // show/hide definition output & container where we'll stuff the colorized definition
        showOutputBtn: 'cdBldShowOutputBtn',
        outputBox: 'cdBldOutputBox',
        cancelBtn: 'cdBldCancelBtn',
        saveBtn: 'cdBldSaveBtn'
        // 		openBtn: 'cdBldOpenBtn'
    };
    // the editor's checked lookups (ugsEditorPlus.dom loads before the Chord Builder)
    const dom = ugsEditorPlus.dom;
    // these elements are found by init(); everything that uses them runs after it
    let _cursorCanvas = null, _eleDotsBtn = null, _eleFingerBtn = null;
    let _startingFret = 1;
    let _currentName = '';
    let _isDotToolActive = true;
    let _finger = 0;
    /**
     * A "reverse Enum" dictionary of finger number to description
     * @attribute _fingerNames
     * @type {JSON}
     */
    const _fingerNames = {
        0: 'None',
        1: 'Index finger',
        2: 'Middle finger',
        3: 'Ring finger',
        4: 'Pinkie'
    };
    /**
     * Returns FALSE if canvas is not supported
     * @method init
     * @return {bool}
     */
    this.init = function () {
        _cursorCanvas = dom.byId(_ids.cursorCanvas, HTMLCanvasElement);
        if (!_cursorCanvas.getContext) {
            return false;
        }
        const cursorContext = _cursorCanvas.getContext('2d');
        const diagramContext = dom.byId(_ids.diagramCanvas, HTMLCanvasElement).getContext('2d');
        // no 2D drawing: the same as no canvas
        if (!cursorContext || !diagramContext) {
            return false;
        }
        const ele = dom.byId(_ids.startingFret, HTMLSelectElement);
        addStartingFretOptions(ele);
        ele.addEventListener('change', onFretChange, false);
        dom.byId(_ids.chordName, HTMLInputElement).addEventListener('keyup', onNameChange, false);
        _eleDotsBtn = dom.byId(_ids.dotsBtn, HTMLElement);
        _eleFingerBtn = dom.byId(_ids.fingersBtn, HTMLElement);
        _eleDotsBtn.addEventListener('click', toggleTool, false);
        _eleFingerBtn.addEventListener('click', toggleTool, false);
        dom.byId(_ids.showOutputBtn, HTMLInputElement).addEventListener('click', showOutputBox, false);
        dom.byId(_ids.cancelBtn, HTMLElement).addEventListener('click', onCancelClick, false);
        dom.byId(_ids.saveBtn, HTMLInputElement).addEventListener('click', onSaveClick, false);
        dom.byId(_ids.slideUpBtn, HTMLElement).addEventListener('click', slide, false);
        dom.byId(_ids.slideDownBtn, HTMLElement).addEventListener('click', slide, false);
        updateFinger();
        dom.byId(_ids.container, HTMLElement).addEventListener('mousemove', onMouseMove, false);
        _cursorCanvas.addEventListener('click', onMouseClick, false);
        ugsChordBuilder.chordCanvas.init(diagramContext, _cursorCanvas);
        ugsChordBuilder.cursorCanvas.init(cursorContext);
        redraw();
        exportDefinition();
        ugsChordBuilder.chooserList.init(setChord);
        return true;
    };
    /**
     * Successively clicking the Finger tool cycles through index to pinky, then none, and so on.
     * This method automatically increments the "currently active finger" (odd sentence, that)
     * and updates the toolbox UI.
     * Note: changing the cursor is not handled here.
     * @method updateFinger
     * @private
     * @return {void}
     */
    const updateFinger = function () {
        _finger++;
        if (_finger > 4) {
            _finger = 0;
        }
        dom.byId(_ids.btnFingerName, HTMLElement).innerHTML = _fingerNames[_finger] + ' (' + _finger + ')';
        dom.byId(_ids.btnHandPic, HTMLElement).className = 'ugsEditor-fingerToolImage ugsEditor-finger' + _finger;
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const showOutputBox = function () {
        // (the click is on the show-output checkbox)
        setClass(dom.byId(_ids.outputBox, HTMLElement), 'ugsEditor-collapseOutput', !dom.byId(_ids.showOutputBtn, HTMLInputElement).checked);
    };
    /**
     * Cancel button's click event handler
     * @method onCancelClick
     */
    const onCancelClick = function (evt) {
        evt.preventDefault();
        reset();
        ugsChordBuilder.chooserList.show(true);
    };
    /**
     * Save button's click event handler
     * @method onSaveClick
     */
    const onSaveClick = function (evt) {
        evt.preventDefault();
        const d = {
            name: _currentName,
            startingFret: _startingFret,
            dots: ugsChordBuilder.fretDots.getDots(),
            definition: ugsChordBuilder.export.getDefinition(_currentName, _startingFret)
        };
        if (!ugsChordBuilder.chooserList.save(d)) {
            const e = dom.byId(_ids.chordName, HTMLInputElement);
            e.focus();
            e.select();
        }
    };
    /**
     * DANGER!! this is really a public method! A reference to this is passed to the
     * scrapper during its initialization. Used to load ths Chord Builder
     * @method setChord
     * @param {Chord} chord
     */
    const setChord = function (chord) {
        if (chord == null) {
            // a new chord
            reset();
            return;
        }
        const maxFret = findMaxFret(chord.dots);
        const startingFret = (maxFret > ugsChordBuilder.settings.fretBoard.numFrets) ? maxFret - ugsChordBuilder.settings.fretBoard.numFrets + 1 : 1;
        reset(chord.name, startingFret, convertDots(startingFret, chord.dots), false);
    };
    /**
     * Converts Song Formatter's dots to the builder's: frets counted from the starting fret.
     * An `add:` that leaves out a value gives a dot with a null in it; these are read the way
     * Song Formatter draws them on the songsheet:
     *  - no string: the first string
     *  - no finger: no finger number
     *  - no fret: dropped. The builder has no "fret 0" dot (loading one would clear its string,
     *    erasing the chord's real dot there), and the songsheet draws it off the fretboard.
     * Dots below the starting fret are dropped too, for the same reason.
     * @method convertDots
     * @param {int} startingFret
     * @param  {array} builderDots
     * @return {array}
     */
    const convertDots = function (startingFret, builderDots) {
        const offset = startingFret - 1;
        const ugsDots = [];
        for (const dot of builderDots) {
            const fret = (dot.fret || 0) - offset;
            if (fret < 1) {
                continue;
            }
            ugsDots.push(new ugsChordBuilder.entities.Dot(dot.string || 0, fret, dot.finger || 0));
        }
        return ugsDots;
    };
    /**
     * Loops over dots to find the largest fret value
     * @method findMaxFret
     * @param  {array} dots
     * @return {ing}
     */
    const findMaxFret = function (dots) {
        let max = 0;
        for (const dot of dots) {
            const fret = dot.fret || 0;
            if (fret > max) {
                max = fret;
            }
        }
        return max;
    };
    /**
     * Updates the "standard form-like inputs"
     * @method resetInputs
     * @param {string} name
     * @param {int} startingFret
     * @param {bool} isNew
     * @return {void}
     */
    const resetInputs = function (name, startingFret, isNew) {
        _currentName = (name && name.length > 0) ? name : 'CHORDNAME';
        dom.byId(_ids.chordName, HTMLInputElement).value = _currentName;
        _startingFret = startingFret ? startingFret : 1;
        dom.byId(_ids.startingFret, HTMLSelectElement).value = String(_startingFret);
        dom.byId(_ids.showOutputBtn, HTMLInputElement).checked = false;
        setClass(dom.byId(_ids.outputBox, HTMLElement), 'ugsEditor-collapseOutput', true);
        dom.byId(_ids.saveBtn, HTMLInputElement).value = isNew ? 'Add' : 'Update';
    };
    /**
     * Updates the Toolbox's current tool to be "Add Dot"; sets properties required for cursor, etc.
     * @method resetCurrentTool
     */
    const resetCurrentTool = function () {
        // restore current drawing tool (this is lame-o)
        // -----------------------------------------------
        _isDotToolActive = true;
        _finger = 0;
        updateFinger();
        if (_eleDotsBtn && _eleFingerBtn) {
            setClass(_eleDotsBtn, 'ugsEditor-selected', _isDotToolActive);
            setClass(_eleFingerBtn, 'ugsEditor-selected', !_isDotToolActive);
        }
        setClass(dom.byId(_ids.toolbox, HTMLElement), 'ugsEditor-open', !_isDotToolActive);
        ugsChordBuilder.cursorCanvas.setCursor(_isDotToolActive, _finger);
    };
    /**
     * Does a complete UI reset (if no values provided in params), otherwise this is kinda a "set"
     * @method reset
     * @param {string} name Chord name
     * @param {int} startingFret
     * @param {array} dots
     * @param {bool} isNew Used to set the button text
     */
    const reset = function (name, startingFret, dots, isNew) {
        isNew = arguments.length > 3 ? isNew : true;
        // fire cleanup on other classes...
        // -----------------------------------------------
        ugsChordBuilder.fretDots.reset();
        // easy elements back to default...
        // -----------------------------------------------
        resetInputs(name, startingFret, !!isNew);
        resetCurrentTool();
        if (dots && dots.length > 0) {
            for (const dot of dots) {
                ugsChordBuilder.fretDots.toggleDot(dot);
            }
        }
        // ok, probably done
        // -----------------------------------------------
        redraw();
        exportDefinition();
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const toggleTool = function (evt) {
        evt.preventDefault();
        // the Dots and Fingers buttons say which tool they are in data-tool (Songbook 1.5 pages: links to #dots and #fingers)
        const button = evt.currentTarget;
        const useDotTool = button instanceof HTMLElement && (button.dataset.tool || button.getAttribute('href') || '').indexOf('dots') >= 0;
        if (useDotTool === _isDotToolActive) {
            if (!useDotTool) {
                updateFinger();
                ugsChordBuilder.cursorCanvas.setCursor(_isDotToolActive, _finger);
            }
            return;
        }
        if (_eleDotsBtn && _eleFingerBtn) {
            setClass(_eleDotsBtn, 'ugsEditor-selected', useDotTool);
            setClass(_eleFingerBtn, 'ugsEditor-selected', !useDotTool);
        }
        setClass(dom.byId(_ids.toolbox, HTMLElement), 'ugsEditor-open', !useDotTool);
        _isDotToolActive = useDotTool;
        ugsChordBuilder.cursorCanvas.setCursor(_isDotToolActive, _finger);
    };
    /**
     * Yet another add/remove CSS class method.
     * @method
     * @private
     * @return {void}
     */
    const setClass = function (element, className, isSet) {
        element.classList.toggle(className, isSet);
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const addStartingFretOptions = function (ele) {
        let s = '';
        const lastValue = ugsChordBuilder.settings.fretBoard.maxFret - ugsChordBuilder.settings.fretBoard.numFrets + 1;
        for (let i = 1; i <= lastValue; i++) {
            s += '<option value="' + i + '">' + i + '</option>';
        }
        ele.innerHTML = s;
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const onNameChange = function () {
        _currentName = this.value;
        exportDefinition();
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const onFretChange = function () {
        _startingFret = parseInt(this.value, 10);
        exportDefinition();
        redraw();
    };
    /**
     * Needs to watch for closed chords!
     * @method
     * @private
     * @return {void}
     */
    const slide = function (evt) {
        evt.preventDefault();
        let moveAllowed = false;
        const target = evt.target;
        const numSteps = target instanceof Element && target.getAttribute('data-direction') === 'up' ? -1 : +1;
        if (ugsChordBuilder.fretDots.slide(numSteps)) {
            moveAllowed = true;
        }
        else {
            const newStart = _startingFret + numSteps;
            const lastValue = ugsChordBuilder.settings.fretBoard.maxFret - ugsChordBuilder.settings.fretBoard.numFrets + 1;
            if ((newStart >= 1) && (newStart <= lastValue)) {
                _startingFret = newStart;
                dom.byId(_ids.startingFret, HTMLSelectElement).value = String(newStart);
                moveAllowed = true;
            }
        }
        if (moveAllowed) {
            redraw();
            exportDefinition();
        }
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const onMouseMove = function (evt) {
        ugsChordBuilder.cursorCanvas.draw(getPosition(this, evt));
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const onMouseClick = function (evt) {
        // (listens on the cursor canvas)
        const pos = getPosition(this, evt);
        const dot = ugsChordBuilder.tracking.toDot(pos);
        if (!dot) {
            return;
        }
        if (_isDotToolActive) {
            ugsChordBuilder.fretDots.toggleDot(dot);
            redraw(pos);
            exportDefinition();
        }
        else if (ugsChordBuilder.fretDots.toggleFinger(dot, _finger)) {
            redraw(pos);
            exportDefinition();
        }
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const getPosition = function (canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return new ugsChordBuilder.entities.Position(evt.clientX - rect.left, evt.clientY - rect.top);
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const redraw = function (pos) {
        pos = pos || new ugsChordBuilder.entities.Position(0, 0);
        ugsChordBuilder.chordCanvas.draw(pos, _startingFret);
    };
    /**
     * @method
     * @private
     * @return {void}
     */
    const exportDefinition = function () {
        dom.byId(_ids.output, HTMLElement).innerHTML = ugsChordBuilder.export.getDefinitionHtml(_currentName, _startingFret);
    };
    this.reload = function () {
        reset();
        ugsChordBuilder.chooserList.reset();
        ugsChordBuilder.chooserList.show(true);
    };
};
;/*jslint browser: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, regexp: false */

/**
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.

Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.

Visit https://github.com/rgrove/lazyload/ for more info.

Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

@module lazyload
@class LazyLoad
@static
*/

LazyLoad = (function (doc) {
  // -- Private Variables ------------------------------------------------------

  // User agent and feature test information.
  var env,

  // Reference to the <head> element (populated lazily).
  head,

  // Requests currently in progress, if any.
  pending = {},

  // Number of times we've polled to check whether a pending stylesheet has
  // finished loading. If this gets too high, we're probably stalled.
  pollCount = 0,

  // Queued requests.
  queue = {css: [], js: []},

  // Reference to the browser's list of stylesheets.
  styleSheets = doc.styleSheets;

  // -- Private Methods --------------------------------------------------------

  /**
  Creates and returns an HTML element with the specified name and attributes.

  @method createNode
  @param {String} name element name
  @param {Object} attrs name/value mapping of element attributes
  @return {HTMLElement}
  @private
  */
  function createNode(name, attrs) {
    var node = doc.createElement(name), attr;

    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        node.setAttribute(attr, attrs[attr]);
      }
    }

    return node;
  }

  /**
  Called when the current pending resource of the specified type has finished
  loading. Executes the associated callback (if any) and loads the next
  resource in the queue.

  @method finish
  @param {String} type resource type ('css' or 'js')
  @private
  */
  function finish(type) {
    var p = pending[type],
        callback,
        urls;

    if (p) {
      callback = p.callback;
      urls     = p.urls;

      urls.shift();
      pollCount = 0;

      // If this is the last of the pending URLs, execute the callback and
      // start the next request in the queue (if any).
      if (!urls.length) {
        callback && callback.call(p.context, p.obj);
        pending[type] = null;
        queue[type].length && load(type);
      }
    }
  }

  /**
  Populates the <code>env</code> variable with user agent and feature test
  information.

  @method getEnv
  @private
  */
  function getEnv() {
    var ua = navigator.userAgent;

    env = {
      // True if this browser supports disabling async mode on dynamically
      // created script nodes. See
      // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
      async: doc.createElement('script').async === true
    };

    (env.webkit = /AppleWebKit\//.test(ua))
      || (env.ie = /MSIE|Trident/.test(ua))
      || (env.opera = /Opera/.test(ua))
      || (env.gecko = /Gecko\//.test(ua))
      || (env.unknown = true);
  }

  /**
  Loads the specified resources, or the next resource of the specified type
  in the queue if no resources are specified. If a resource of the specified
  type is already being loaded, the new request will be queued until the
  first request has been finished.

  When an array of resource URLs is specified, those URLs will be loaded in
  parallel if it is possible to do so while preserving execution order. All
  browsers support parallel loading of CSS, but only Firefox and Opera
  support parallel loading of scripts. In other browsers, scripts will be
  queued and loaded one at a time to ensure correct execution order.

  @method load
  @param {String} type resource type ('css' or 'js')
  @param {String|Array} urls (optional) URL or array of URLs to load
  @param {Function} callback (optional) callback function to execute when the
    resource is loaded
  @param {Object} obj (optional) object to pass to the callback function
  @param {Object} context (optional) if provided, the callback function will
    be executed in this object's context
  @private
  */
  function load(type, urls, callback, obj, context) {
    var _finish = function () { finish(type); },
        isCSS   = type === 'css',
        nodes   = [],
        i, len, node, p, pendingUrls, url;

    env || getEnv();

    if (urls) {
      // If urls is a string, wrap it in an array. Otherwise assume it's an
      // array and create a copy of it so modifications won't be made to the
      // original.
      urls = typeof urls === 'string' ? [urls] : urls.concat();

      // Create a request object for each URL. If multiple URLs are specified,
      // the callback will only be executed after all URLs have been loaded.
      //
      // Sadly, Firefox and Opera are the only browsers capable of loading
      // scripts in parallel while preserving execution order. In all other
      // browsers, scripts must be loaded sequentially.
      //
      // All browsers respect CSS specificity based on the order of the link
      // elements in the DOM, regardless of the order in which the stylesheets
      // are actually downloaded.
      if (isCSS || env.async || env.gecko || env.opera) {
        // Load in parallel.
        queue[type].push({
          urls    : urls,
          callback: callback,
          obj     : obj,
          context : context
        });
      } else {
        // Load sequentially.
        for (i = 0, len = urls.length; i < len; ++i) {
          queue[type].push({
            urls    : [urls[i]],
            callback: i === len - 1 ? callback : null, // callback is only added to the last URL
            obj     : obj,
            context : context
          });
        }
      }
    }

    // If a previous load request of this type is currently in progress, we'll
    // wait our turn. Otherwise, grab the next item in the queue.
    if (pending[type] || !(p = pending[type] = queue[type].shift())) {
      return;
    }

    head || (head = doc.head || doc.getElementsByTagName('head')[0]);
    pendingUrls = p.urls.concat();

    for (i = 0, len = pendingUrls.length; i < len; ++i) {
      url = pendingUrls[i];

      if (isCSS) {
          node = env.gecko ? createNode('style') : createNode('link', {
            href: url,
            rel : 'stylesheet'
          });
      } else {
        node = createNode('script', {src: url});
        node.async = false;
      }

      node.className = 'lazyload';
      node.setAttribute('charset', 'utf-8');

      if (env.ie && !isCSS && 'onreadystatechange' in node && !('draggable' in node)) {
        node.onreadystatechange = function () {
          if (/loaded|complete/.test(node.readyState)) {
            node.onreadystatechange = null;
            _finish();
          }
        };
      } else if (isCSS && (env.gecko || env.webkit)) {
        // Gecko and WebKit don't support the onload event on link nodes.
        if (env.webkit) {
          // In WebKit, we can poll for changes to document.styleSheets to
          // figure out when stylesheets have loaded.
          p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
          pollWebKit();
        } else {
          // In Gecko, we can import the requested URL into a <style> node and
          // poll for the existence of node.sheet.cssRules. Props to Zach
          // Leatherman for calling my attention to this technique.
          node.innerHTML = '@import "' + url + '";';
          pollGecko(node);
        }
      } else {
        node.onload = node.onerror = _finish;
      }

      nodes.push(node);
    }

    for (i = 0, len = nodes.length; i < len; ++i) {
      head.appendChild(nodes[i]);
    }
  }

  /**
  Begins polling to determine when the specified stylesheet has finished loading
  in Gecko. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).

  Thanks to Zach Leatherman for calling my attention to the @import-based
  cross-domain technique used here, and to Oleg Slobodskoi for an earlier
  same-domain implementation. See Zach's blog for more details:
  http://www.zachleat.com/web/2010/07/29/load-css-dynamically/

  @method pollGecko
  @param {HTMLElement} node Style node to poll.
  @private
  */
  function pollGecko(node) {
    var hasRules;

    try {
      // We don't really need to store this value or ever refer to it again, but
      // if we don't store it, Closure Compiler assumes the code is useless and
      // removes it.
      hasRules = !!node.sheet.cssRules;
    } catch (ex) {
      // An exception means the stylesheet is still loading.
      pollCount += 1;

      if (pollCount < 200) {
        setTimeout(function () { pollGecko(node); }, 50);
      } else {
        // We've been polling for 10 seconds and nothing's happened. Stop
        // polling and finish the pending requests to avoid blocking further
        // requests.
        hasRules && finish('css');
      }

      return;
    }

    // If we get here, the stylesheet has loaded.
    finish('css');
  }

  /**
  Begins polling to determine when pending stylesheets have finished loading
  in WebKit. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).

  @method pollWebKit
  @private
  */
  function pollWebKit() {
    var css = pending.css, i;

    if (css) {
      i = styleSheets.length;

      // Look for a stylesheet matching the pending URL.
      while (--i >= 0) {
        if (styleSheets[i].href === css.urls[0]) {
          finish('css');
          break;
        }
      }

      pollCount += 1;

      if (css) {
        if (pollCount < 200) {
          setTimeout(pollWebKit, 50);
        } else {
          // We've been polling for 10 seconds and nothing's happened, which may
          // indicate that the stylesheet has been removed from the document
          // before it had a chance to load. Stop polling and finish the pending
          // request to prevent blocking further requests.
          finish('css');
        }
      }
    }
  }

  return {

    /**
    Requests the specified CSS URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified, the stylesheets will be loaded in parallel and the callback
    will be executed after all stylesheets have finished loading.

    @method css
    @param {String|Array} urls CSS URL or array of CSS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified stylesheets are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    css: function (urls, callback, obj, context) {
      load('css', urls, callback, obj, context);
    },

    /**
    Requests the specified JavaScript URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified and the browser supports it, the scripts will be loaded in
    parallel and the callback will be executed after all scripts have
    finished loading.

    Currently, only Firefox and Opera support parallel loading of scripts while
    preserving execution order. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method js
    @param {String|Array} urls JS URL or array of JS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified scripts are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    js: function (urls, callback, obj, context) {
      load('js', urls, callback, obj, context);
    }

  };
})(this.document);
