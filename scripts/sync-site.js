#!/usr/bin/env node
/**
 * Syncs the current Songbook build into an existing static website, e.g. the
 * ukegeeks.org site:
 *
 *   node scripts/sync-site.js <siteDir> [--songs dir] [--dry-run]
 *
 * What it does (and doesn't):
 * - songbook/: every song folder from the static build, plus songbook/index.html,
 *   replaces the site's copy. An old file or folder with the same name (e.g. an
 *   extensionless archive page) is removed first. Anything else in the site's
 *   songbook/ is left alone.
 * - js/ css/ img/: files from the build overwrite the site's copies; files that
 *   exist only on the site are NEVER deleted (other pages may still use them).
 * - favicon.ico, apple-touch-icon.png: copied to the site root.
 * Nothing else on the site is touched. Prints what changed.
 */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const OVERLAY_DIRS = ['js', 'css', 'img'];
const ROOT_FILES = ['favicon.ico', 'apple-touch-icon.png'];

function parseArgs(argv) {
  const args = { site: null, songs: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--songs') args.songs = path.resolve(argv[++i]);
    else if (argv[i] === '--dry-run') args.dryRun = true;
    else if (!args.site && !argv[i].startsWith('-')) args.site = path.resolve(argv[i]);
    else usage();
  }
  if (!args.site) usage();
  return args;
}

function usage() {
  console.error('usage: node scripts/sync-site.js <siteDir> [--songs dir] [--dry-run]');
  process.exit(2);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function filesUnder(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) out.push(path.relative(dir, path.join(entry.parentPath || entry.path, entry.name)));
  }
  return out.sort();
}

async function sameContent(a, b) {
  try {
    const [x, y] = await Promise.all([fs.readFile(a), fs.readFile(b)]);
    return x.equals(y);
  } catch {
    return false;
  }
}

async function main() {
  const { site, songs, dryRun } = parseArgs(process.argv.slice(2));
  if (!(await exists(site))) throw new Error(`site folder not found: ${site}`);

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ugs-sync-'));
  const log = { replaced: [], updated: [], added: [], unchanged: 0 };
  try {
    const buildArgs = [path.join(ROOT, 'scripts/build-static.js'), '--out', tmp];
    if (songs) buildArgs.push('--songs', songs);
    execFileSync(process.execPath, buildArgs, { stdio: 'inherit' });

    // songbook/: replace each built entry (song folders + index.html), keep the rest
    const siteSongbook = path.join(site, 'songbook');
    for (const name of await fs.readdir(path.join(tmp, 'songbook'))) {
      const target = path.join(siteSongbook, name);
      log.replaced.push(`songbook/${name}`);
      if (dryRun) continue;
      await fs.rm(target, { recursive: true, force: true });
      await fs.cp(path.join(tmp, 'songbook', name), target, { recursive: true });
    }

    // js/ css/ img/ + root icons: overwrite or add, never delete
    const pairs = [];
    for (const dir of OVERLAY_DIRS) {
      for (const rel of await filesUnder(path.join(tmp, dir))) pairs.push(path.join(dir, rel));
    }
    pairs.push(...ROOT_FILES);
    for (const rel of pairs) {
      const from = path.join(tmp, rel);
      const to = path.join(site, rel);
      if (await sameContent(from, to)) {
        log.unchanged++;
        continue;
      }
      (await exists(to) ? log.updated : log.added).push(rel);
      if (dryRun) continue;
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
    }
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }

  const show = (label, list) => list.length && console.log(`${label} (${list.length}):\n  ${list.join('\n  ')}`);
  console.log(dryRun ? '\nDRY RUN, nothing written.' : `\nSynced into ${site}`);
  show('songbook entries replaced', log.replaced);
  show('files updated', log.updated);
  show('files added', log.added);
  console.log(`files already up to date: ${log.unchanged}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
