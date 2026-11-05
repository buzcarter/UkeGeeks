'use strict';
/**
 * HTTP helpers: security headers, response helpers, bounded body parsing,
 * same-origin (CSRF) checks and a locked-down static file server.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function newNonce() {
  return crypto.randomBytes(16).toString('base64');
}

function securityHeaders(res, nonce) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ''}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ')
  );
}

function send(res, status, body, contentType, headers = {}) {
  const buf = Buffer.from(String(body), 'utf8');
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': buf.length,
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(buf);
}

const sendHtml = (res, status, body, headers) => send(res, status, body, 'text/html; charset=utf-8', headers);
const sendText = (res, status, body, headers) => send(res, status, body, 'text/plain; charset=utf-8', headers);
const sendJson = (res, status, obj) => send(res, status, JSON.stringify(obj), 'application/json; charset=utf-8');

function redirect(res, location, status = 302) {
  res.writeHead(status, { Location: location, 'Content-Length': 0, 'Cache-Control': 'no-store' });
  res.end();
}

/** Reads the request body, refusing anything larger than `limit` bytes. */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length'] || 0);
    if (declared > limit) {
      reject(new HttpError(413, 'Request too large'));
      req.resume();
      return;
    }
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, 'Request too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req, limit) {
  const type = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') {
    throw new HttpError(415, 'Expected application/json');
  }
  try {
    const obj = JSON.parse(await readBody(req, limit));
    if (!obj || typeof obj !== 'object') throw new Error('not an object');
    return obj;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, 'Invalid JSON');
  }
}

async function readForm(req, limit) {
  return new URLSearchParams(await readBody(req, limit));
}

/**
 * CSRF guard for state-changing requests. Browsers always send Origin on POST
 * (and Sec-Fetch-Site); reject when either says the request came from another site.
 */
function isSameOrigin(req) {
  const site = req.headers['sec-fetch-site'];
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = req.headers.origin;
  if (origin) {
    try {
      return new URL(origin).host === req.headers.host;
    } catch {
      return false;
    }
  }
  return true; // non-browser client (curl etc.): not a CSRF vector
}

/**
 * Serves a file from one of the allowed top-level directories under `root`,
 * or one of the explicitly allowed files in `root` itself (e.g. favicon.ico).
 * @returns {boolean} true if handled
 */
function serveStatic(req, res, root, allowedDirs, pathname, allowedRootFiles = []) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  if (decoded.includes('\0')) return false;

  const rel = path.posix.normalize(decoded).replace(/^\/+/, '');
  let full;
  if (allowedRootFiles.includes(rel)) {
    full = path.join(root, rel);
  } else {
    const top = rel.split('/')[0];
    if (!allowedDirs.includes(top) || rel.split('/').some((seg) => seg.startsWith('.'))) {
      return false;
    }
    full = path.join(root, rel);
    if (!full.startsWith(path.join(root, top) + path.sep)) return false;
  }

  let stat;
  try {
    stat = fs.statSync(full);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const lastModified = stat.mtime.toUTCString();
  const headers = {
    'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream',
    'Last-Modified': lastModified,
    'Cache-Control': 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  };

  const since = req.headers['if-modified-since'];
  if (since && Math.floor(stat.mtimeMs / 1000) <= Math.floor(Date.parse(since) / 1000)) {
    res.writeHead(304, headers);
    res.end();
    return true;
  }

  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  if (req.method === 'HEAD') {
    res.end();
    return true;
  }
  fs.createReadStream(full)
    .on('error', () => res.destroy())
    .pipe(res);
  return true;
}

module.exports = {
  HttpError,
  newNonce,
  securityHeaders,
  sendHtml,
  sendText,
  sendJson,
  redirect,
  readJson,
  readForm,
  isSameOrigin,
  serveStatic,
};
