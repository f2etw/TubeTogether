'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var ghPages = require('gulp-gh-pages');

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
gulp.task('dev', ['serve'], function () {
  gulp.watch(['app/*.*'], browserSync.reload);
});

gulp.task('deploy', function () {
  return gulp.src('app/*/')
    .pipe(ghPages());
});
