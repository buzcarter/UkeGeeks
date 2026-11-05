'use strict';
/**
 * Accounts, password hashing and in-memory sessions. Ports ugsphp/classes/SimpleLogin.php
 *
 * - Passwords are stored as scrypt hashes (npm run hash-password), compared in constant time.
 * - Session ids are 256-bit random, regenerated on login, cookie is HttpOnly + SameSite=Lax.
 * - Failed logins are throttled per client IP.
 * Sessions live in memory: restarting the server signs everyone out.
 */
const crypto = require('node:crypto');

const COOKIE = 'ugs_sid';
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };
const MAX_FAILS = 10;
const FAIL_WINDOW_MS = 15 * 60 * 1000;

function scrypt(password, salt, { N, r, p, keylen }) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

/** @returns {Promise<string>} "scrypt$N$r$p$salt$hash" (base64url) */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(String(password), salt, SCRYPT);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64url'), key.toString('base64url')].join('$');
}

async function verifyPassword(password, stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64url');
  try {
    const actual = await scrypt(String(password), Buffer.from(saltB64, 'base64url'), {
      N: Number(N),
      r: Number(r),
      p: Number(p),
      keylen: expected.length,
    });
    return expected.length > 0 && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/** Every visitor gets one of these; defaults to "anonymous" with minimum access. */
function makeUser(props = {}) {
  return {
    username: 'anon',
    displayName: 'Guest',
    mayEdit: false,
    isAllowAccess: false,
    isAuthenticated: false,
    ...props,
  };
}

class Auth {
  constructor(cfg) {
    this.cfg = cfg;
    this.ttlMs = cfg.sessionTtlHours * 3600 * 1000;
    /** @type {Map<string, {user: object, expires: number}>} */
    this.sessions = new Map();
    /** @type {Map<string, {count: number, resetAt: number}>} */
    this.failures = new Map();
    // used to keep timing similar whether or not the username exists
    this.dummyHash = hashPassword(crypto.randomBytes(16).toString('hex'));
    setInterval(() => this.sweep(), 10 * 60 * 1000).unref();
  }

  get hasAccounts() {
    return this.cfg.accounts.length > 0;
  }

  sweep() {
    const now = Date.now();
    for (const [id, s] of this.sessions) if (s.expires < now) this.sessions.delete(id);
    for (const [ip, f] of this.failures) if (f.resetAt < now) this.failures.delete(ip);
  }

  /** Current visitor (from session cookie), with isAllowAccess resolved against config. */
  getUser(req) {
    const id = parseCookies(req.headers.cookie)[COOKIE];
    const session = id && this.sessions.get(id);
    if (session && session.expires > Date.now()) {
      session.expires = Date.now() + this.ttlMs; // sliding expiry
      return session.user;
    }
    if (session) this.sessions.delete(id);
    return makeUser({ isAllowAccess: !this.cfg.isLoginRequired });
  }

  isThrottled(ip) {
    const f = this.failures.get(ip);
    return Boolean(f && f.resetAt > Date.now() && f.count >= MAX_FAILS);
  }

  noteFailure(ip) {
    const now = Date.now();
    const f = this.failures.get(ip);
    if (!f || f.resetAt < now) this.failures.set(ip, { count: 1, resetAt: now + FAIL_WINDOW_MS });
    else f.count++;
  }

  /**
   * Validates credentials; on success starts a NEW session (fresh id) and sets the cookie.
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  async login(req, res, username, password) {
    const ip = req.socket.remoteAddress || 'unknown';
    if (this.isThrottled(ip)) {
      return { ok: false, message: 'Too many failed attempts. Please wait a few minutes and try again.' };
    }

    const name = String(username || '').trim().toLowerCase();
    const pass = String(password || '').trim();
    const account = this.cfg.accounts.find((a) => a.user.toLowerCase() === name);
    const valid = await verifyPassword(pass, account ? account.passwordHash : await this.dummyHash);

    if (!account || !valid || account.isActive === false) {
      this.noteFailure(ip);
      return { ok: false, message: 'invalid username/password' };
    }

    this.failures.delete(ip);
    this.destroySession(req);
    const id = crypto.randomBytes(32).toString('base64url');
    this.sessions.set(id, {
      expires: Date.now() + this.ttlMs,
      user: makeUser({
        username: account.user,
        displayName: account.name || account.user,
        mayEdit: Boolean(account.mayEdit),
        isAllowAccess: true,
        isAuthenticated: true,
      }),
    });
    res.setHeader('Set-Cookie', this.cookie(id, Math.floor(this.ttlMs / 1000)));
    return { ok: true, message: 'Success!' };
  }

  logout(req, res) {
    this.destroySession(req);
    res.setHeader('Set-Cookie', this.cookie('', 0));
  }

  destroySession(req) {
    const id = parseCookies(req.headers.cookie)[COOKIE];
    if (id) this.sessions.delete(id);
  }

  cookie(value, maxAge) {
    const attrs = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
    if (this.cfg.secureCookies) attrs.push('Secure');
    return attrs.join('; ');
  }
}

module.exports = { Auth, hashPassword, verifyPassword, makeUser };
