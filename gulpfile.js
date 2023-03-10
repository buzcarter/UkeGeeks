/* eslint-disable no-console */
const concat = require('gulp-concat');
const gulp = require('gulp');
const less = require('gulp-less');
const minifyCSS = require('gulp-minify-css');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

const SRC_DIR_CORE = './src/js/scriptasaurus/';
const SRC_DIR_EDITOR = './src/js/editor/';
const SRC_DIR_LIBS = './src/js/libs/';
const SRC_DIR_ACE_EDITOR = './src/js/ace/';
const SRC_DIR_HIGHLIGHTER = './src/highlighter/scripts/';

const config = {
  styles: {
    files: './src/less/*.less',
    outputDir: './css',
    watch: [
      './src/less/*.less',
      './src/less/**/*.less',
    ],
  },
  scripts: [{
    filename: 'ukeGeeks.scriptasaurus.merged.js',
    outputDir: './js',
    files: [
      // namespace (never compressed)
      `${SRC_DIR_CORE}ukeGeeks.namespace.js`,
      // Components
      `${SRC_DIR_CORE}ukeGeeks.definitions.js`,
      `${SRC_DIR_CORE}ukeGeeks.settings.js`,
      `${SRC_DIR_CORE}ukeGeeks.data.js`,
      `${SRC_DIR_CORE}ukeGeeks.toolsLite.js`,
      `${SRC_DIR_CORE}ukeGeeks.chordImport.js`,
      `${SRC_DIR_CORE}ukeGeeks.transpose.js`,
      `${SRC_DIR_CORE}ukeGeeks.definitions.sopranoUkuleleGcea.js`,
      `${SRC_DIR_CORE}ukeGeeks.canvasTools.js`,
      `${SRC_DIR_CORE}ukeGeeks.chordBrush.js`,
      `${SRC_DIR_CORE}ukeGeeks.chordParser.js`,
      `${SRC_DIR_CORE}ukeGeeks.cpmParser.js`,
      `${SRC_DIR_CORE}ukeGeeks.chordPainter.js`,
      `${SRC_DIR_CORE}ukeGeeks.tabs.js`,
      `${SRC_DIR_CORE}ukeGeeks.overlapFixer.js`,
      `${SRC_DIR_CORE}ukeGeeks.scriptasaurus.js`,
    ],
  }, {
    filename: 'ugsEditorPlus.merged.js',
    outputDir: './js',
    files: [
      // namespace (never compressed)
      `${SRC_DIR_EDITOR}ugsEditorPlus.namespace.js`,
      // Components
      `${SRC_DIR_EDITOR}ugsEditorPlus.options.js`,
      // SRC_DIR_EDITOR + 'ugsEditorPlus.settings',
      `${SRC_DIR_EDITOR}ugsEditorPlus.actions.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.songUi.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.styles.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.themes.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.optionsDlg.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.reformat.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.autoReformat.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.topMenus.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.submenuUi.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.newSong.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.updateSong.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.typeahead.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.resize.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.chordBuilder.js`,
      `${SRC_DIR_EDITOR}ugsEditorPlus.songAmatic.js`,
      // Chord Builder
      `${SRC_DIR_EDITOR}ugsChordBuilder.js`,
      `${SRC_DIR_EDITOR}ugsChordBuilder.chooserList.js`,
      `${SRC_DIR_EDITOR}ugsChordBuilder.editorUi.js`,
      `${SRC_DIR_LIBS}lazyload.js`,
    ],
  }, {
    filename: 'highlighter.min.js',
    outputDir: './js',
    files: [
      `${SRC_DIR_HIGHLIGHTER}shCore.js`,
      `${SRC_DIR_HIGHLIGHTER}shBrushCss.js`,
      `${SRC_DIR_HIGHLIGHTER}shBrushXml.js`,
      `${SRC_DIR_HIGHLIGHTER}shBrushPhp.js`,
      `${SRC_DIR_HIGHLIGHTER}shBrushBash.js`,
    ],
  }, {
    filename: 'aceChordPro.merged.js',
    outputDir: './js/ace',
    files: [
      `${SRC_DIR_ACE_EDITOR}ace.min.js`,
      `${SRC_DIR_ACE_EDITOR}ext-language_tools.min.js`,
      `${SRC_DIR_ACE_EDITOR}ext-searchbox.js`,
      `${SRC_DIR_ACE_EDITOR}ugsAce.js`,
    ],
  }],
};

function stylesTask() {
  console.log('Building LESS Styles');

  if (!config.styles) {
    console.log('No styles found in the config');
    return gulp;
  }

  gulp.src(config.styles.files)
    .pipe(rename((path) => {
      path.extname = '.merged.css';
    }))
    .pipe(less())
    .pipe(gulp.dest(config.styles.outputDir))
    .pipe(rename((path) => {
      path.basename = path.basename.replace(/\.merged$/, '');
      path.extname = '.min.css';
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.styles.outputDir));
  return gulp;
}

function jsTask() {
  console.log('Merging & minifying JavaScript files');

  if (!config.scripts) {
    console.log('No scripts defined in the config');
    return gulp;
  }

  config.scripts.forEach((task) => {
    console.log(`building ${task.filename}`);

    gulp.src(task.files)
      .pipe(concat(task.filename))
      .pipe(gulp.dest(task.outputDir))
      .pipe(rename((path) => {
        path.basename = path.basename.replace(/\.merged$/, '');
        path.extname = '.min.js';
      }))
      .pipe(uglify())
      .pipe(gulp.dest(task.outputDir));
  });

  return gulp;
}

function watchTask() {
  console.log('Watching files');

  if (config.styles) {
    gulp.watch(config.styles.watch, ['build-styles']);
  }

  if (config.scripts) {
    config.scripts.forEach((task) => {
      gulp.watch(task.files, ['build-scripts']);
    });
  }
  return gulp;
}

// gulp
//   .task('build-styles', stylesTask)
//   .task('build-scripts', jsTask)
//   .task('watch', watchTask)
//   .task('default', ['build-styles', 'build-scripts', 'watch']);

module.exports = {
  'build-styles': stylesTask,
  'build-scripts': jsTask,
  build() {
    gulp.parallel(stylesTask, jsTask);
  },
  watch: watchTask,
  ts() {
    const tsProject = ts.createProject('tsconfig.json');
    return tsProject.src()
      .pipe(tsProject())
      .js
      .pipe(gulp.dest('./dist/js/scriptasaurus'));
  },
  // default: ['build-styles', 'build-scripts', 'watch'],
};
