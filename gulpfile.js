'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var ghPages = require('gulp-gh-pages');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var csswring = require('csswring');

var BUILD_PATH = '_public/';

gulp.task('css', function () {
  var processors = [
    csswring
  ];
  return gulp.src('src/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('serve', function () {
  browserSync({
    open: 'external',
    browser: 'google-chrome',
    notify: false,
    ghostMode: {
      clicks: false,
      scroll: false,
      forms: false
    },
    scrollThrottle: 500,
    startPath: './app',
    server: ''
  });
});

// Watch Files For Changes & Reload
gulp.task('dev', ['serve', 'css'], function () {
  gulp.watch(['app/*.*'], browserSync.reload);
});

gulp.task('deploy', ['css'], function () {
  return gulp.src('app/*/')
    .pipe(ghPages());
});
