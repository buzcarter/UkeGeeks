'use strict';
/**
 * Tiny auto-escaping HTML templating. Every interpolated value is HTML-escaped
 * unless it is a SafeHtml (produced by `html` itself or by `raw`).
 *
 *   html`<p>${userText}</p>`         -> escaped
 *   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`  -> nested, safe
 *   raw(trustedMarkup)               -> inserted verbatim (use sparingly!)
 */

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// "&" that does NOT already start an entity like &amp; &copy; &#39; &#x2665;
const BARE_AMP_OR_SPECIAL = /&(?!#\d+;|#x[0-9a-f]+;|[a-z][a-z0-9]*;)|[<>"']/gi;

/**
 * Escapes <, >, quotes and bare &, but leaves existing entities alone (like PHP's
 * htmlspecialchars with double_encode=false). ChordPro files in this project
 * legitimately contain entities ("Lyrics &amp; Music &copy; 1933"); an entity
 * can't open a tag or leave a quoted attribute, so this is still XSS-safe.
 */
function escapeHtml(value) {
  return String(value).replace(BARE_AMP_OR_SPECIAL, (c) => ESCAPES[c]);
}

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(value);
}

function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += render(values[i]) + strings[i + 1];
  }
  return new SafeHtml(out);
}

function raw(value) {
  return new SafeHtml(String(value));
}

/**
 * Serializes a value for embedding inside an inline <script>. Escapes characters
 * that could close the script element or break out of a JS string context.
 */
// U+2028/U+2029 are valid in JSON but are line terminators in older JS engines
const LINE_SEPARATORS = new RegExp('[' + String.fromCharCode(0x2028, 0x2029) + ']', 'g');

function jsonForScript(value) {
  return raw(
    JSON.stringify(value === undefined ? null : value)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(LINE_SEPARATORS, (c) => (c.charCodeAt(0) === 0x2028 ? '\\u2028' : '\\u2029'))
  );
}

module.exports = { html, raw, escapeHtml, jsonForScript, SafeHtml };
