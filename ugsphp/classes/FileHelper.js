const fs = require('fs');
const Config = require('../Config');

/**
 * Shared file access methods
 */

/**
 * Parses URL looks for song query string param value
 * @return {string}
 */
function getFilename() {
  throw new Error('Not implemented');
  // let s = (isset(_GET.song)) ? _GET.song : '';
  // if (!s) {
  //   return Config.NotFound_404File;
  // }
  // if (strpos(s, '.txt') || strpos(s, '.cpm')) {
  //   return s;
  // }
  // const pattern = /(.*[\/])?(.*?)(\.html?)?/;
  // s = preg_replace(pattern, '2', s).Config.FileExtension;
  // return s;
}

/**
 * tries to open and read the requested file
 * @param {string} fname
 * @return {string}
 */
function readFile(fname) {
  try {
    return fs.readFileSync(fname, { encoding: 'utf8', flag: 'r' });
  } catch (error) {
    return null;
  }
  // data = '';
  // if (!file_exists(fname)) {
  //   return null;
  //   // die(errPrefix." &quot;".fname."&quot; not found.");
  // }
  // fh = fopen(fname, 'r');
  // data = fread(fh, Config.MaxFileSize);
  // fclose(fh);
  // return data;
}

/**
 * @param {string} dir
 * @return {[string]}
 */
function getFilenames(dir) {
  throw new Error('Not implemented');
  // opendir(dir);
  // if (!is_dir(dir)) {
  //   var_dump('failed to open . '.dir);
  //   return array();
  // }

  // // Open a known directory, and proceed to read its contents
  // // yes, the assignment below is deliberate.
  // if (!(dh = opendir(dir))) {
  //   return array();
  // }

  // f = array();
  // while ((file = readdir(dh)) !== false) {
  //   if ((filetype(dir.file) == 'file') && (preg_match(Config.FileNamePattern, file) === 1)) {
  //     f.push(file);
  //   }
  // }
  // closedir(dh);
  // sort(f, SORT_STRING);
  // return f;
}

module.exports = {
  readFile,
  getSongFilename(cpm) {
    return `${Config.SongDirectory}/${cpm}.cpm.txt`;
  },
};
