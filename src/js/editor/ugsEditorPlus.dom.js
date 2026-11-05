/**
 * Tiny DOM helpers for the editor (replaces what the editor used to get from jQuery):
 * element lookup, show/hide, CSS-transition fades & slides, draggable dialogs, and
 * a JSON POST via fetch. No inline handlers or innerHTML here, so it's CSP friendly.
 * @class dom
 * @namespace ugsEditorPlus
 * @static
 */
ugsEditorPlus.dom = (function() {
  'use strict';

  /**
   * attach public members to this object
   * @property _public
   * @type JsonObject
   */
  var _public = {};

  /**
   * named speeds, in milliseconds (same as jQuery's)
   * @property SPEEDS
   * @private
   */
  var SPEEDS = {
    fast: 200,
    normal: 400,
    slow: 600
  };

  // running animations, per element: [{ props: [names], css: 'opacity 400ms ease', id: timer, fade: 'in'|'out' }]
  // (animations of different properties -- say a fade and a slide -- run side by side)
  var _running = new WeakMap();

  var toMs = function(speed) {
    if (typeof speed === 'number') {
      return speed;
    }
    return SPEEDS[speed] || SPEEDS.normal;
  };

  /**
   * First element matching the CSS selector (within optional context element)
   * @method one
   * @param selector {string}
   * @param context {DOM-element} (optional) defaults to document
   * @return {DOM-element|null}
   */
  _public.one = function(selector, context) {
    return (context || document).querySelector(selector);
  };

  /**
   * All elements matching the CSS selector, as an Array
   * @method all
   * @param selector {string}
   * @param context {DOM-element} (optional) defaults to document
   * @return {Array}
   */
  _public.all = function(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  /**
   * Attaches handler to the event on every element matching the selector (or to the element(s) passed in)
   * @method on
   * @param target {string|DOM-element|Array} CSS selector, element, or array of elements
   * @param eventName {string}
   * @param handler {function}
   */
  _public.on = function(target, eventName, handler) {
    var list = (typeof target === 'string') ? _public.all(target) : (Array.isArray(target) ? target : [target]);
    list.forEach(function(ele) {
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
  _public.isVisible = function(ele) {
    return !!(ele && ele.getClientRects().length);
  };

  var running = function(ele) {
    return _running.get(ele) || [];
  };

  var setTransition = function(ele) {
    ele.style.transition = running(ele).map(function(anim) {
      return anim.css;
    }).join(', ');
  };

  // cancel running animations on ele (all of them, or just those touching propNames);
  // leaves the current inline values in place
  var stop = function(ele, propNames) {
    var keep = running(ele).filter(function(anim) {
      var isHit = !propNames || anim.props.some(function(name) {
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

  var fadeDirection = function(ele) {
    var fades = running(ele).filter(function(anim) {
      return !!anim.fade;
    });
    return fades.length ? fades[0].fade : null;
  };

  var isHidden = function(ele) {
    return window.getComputedStyle(ele).display === 'none';
  };

  // display the element; when a stylesheet (or class) hides it fall back to "block"
  var display = function(ele) {
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
  _public.animate = function(ele, props, speed, onDone) {
    var ms = toMs(speed);
    var computed = window.getComputedStyle(ele);
    var names = Object.keys(props);
    var ends = {};

    // snapshot the starting values BEFORE dropping any running transition
    names.forEach(function(name) {
      var value = props[name];
      ends[name] = Array.isArray(value) ? value : [computed[name], value];
    });
    // drop running transitions of these properties, jump to the start values
    stop(ele, names);
    names.forEach(function(name) {
      ele.style[name] = ends[name][0];
    });
    // force a reflow so the browser "sees" the start values before transitioning
    void ele.offsetWidth;

    var anim = {
      props: names,
      css: names.map(function(name) {
        return name.replace(/[A-Z]/g, '-$&').toLowerCase() + ' ' + ms + 'ms ease';
      }).join(', ')
    };
    _running.set(ele, running(ele).concat(anim));
    setTransition(ele);
    names.forEach(function(name) {
      ele.style[name] = ends[name][1];
    });

    anim.id = setTimeout(function() {
      _running.set(ele, running(ele).filter(function(other) {
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
  _public.show = function(ele) {
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
  _public.hide = function(ele) {
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
  _public.toggle = function(ele, isShow) {
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
  _public.fadeIn = function(ele, speed) {
    if (!ele || (!isHidden(ele) && fadeDirection(ele) !== 'out')) {
      return;
    }
    var from = isHidden(ele) ? 0 : parseFloat(window.getComputedStyle(ele).opacity);
    display(ele);
    _public.animate(ele, { opacity: [String(from), '1'] }, speed, function() {
      ele.style.opacity = '';
    }).fade = 'in';
  };

  /**
   * @method fadeOut
   * @param ele {DOM-element}
   * @param speed {number|string} (optional)
   */
  _public.fadeOut = function(ele, speed) {
    if (!ele || isHidden(ele) || fadeDirection(ele) === 'out') {
      return;
    }
    _public.animate(ele, { opacity: '0' }, speed, function() {
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
  _public.fadeToggle = function(ele, speed) {
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
  _public.slideDown = function(ele, speed) {
    if (!ele || !isHidden(ele)) {
      return;
    }
    display(ele);
    var height = ele.offsetHeight;
    ele.style.overflow = 'hidden';
    _public.animate(ele, { height: ['0px', height + 'px'] }, speed, function() {
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
  _public.draggable = function(ele, handleSelector) {
    var handle = handleSelector ? ele.querySelector(handleSelector) : ele;
    if (!handle) {
      return;
    }
    var drag = null;

    handle.style.cursor = 'move';
    handle.style.touchAction = 'none';

    handle.addEventListener('pointerdown', function(e) {
      if (e.button !== 0 || e.target.closest('a, button, input, select, textarea')) {
        return;
      }
      var rect = ele.getBoundingClientRect();
      drag = {
        id: e.pointerId,
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top
      };
      // pin position to top/left so moving doesn't stretch/shrink the box
      ele.style.width = window.getComputedStyle(ele).width;
      ele.style.right = 'auto';
      ele.style.bottom = 'auto';
      ele.style.zIndex = 1000;
      ele.classList.add('draggable');
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    handle.addEventListener('pointermove', function(e) {
      if (!drag || e.pointerId !== drag.id) {
        return;
      }
      // keep the handle on screen
      var left = Math.min(Math.max(e.clientX - drag.dx, 40 - ele.offsetWidth), window.innerWidth - 40);
      var top = Math.min(Math.max(e.clientY - drag.dy, 0), window.innerHeight - 30);
      ele.style.left = left + 'px';
      ele.style.top = top + 'px';
    });

    var endDrag = function(e) {
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
  _public.postJson = function(uri, data) {
    return fetch(uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(function(response) {
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
  _public.trigger = function(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  };

  // ---------------------------------------
  // return public interface "JSON handle"
  // ---------------------------------------
  return _public;
}());
