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
  return gulp.src('app/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('index', function () {
  return gulp.src('app/index.html')
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('js', function () {
  return gulp.src('app/app.js')
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('serve', ['build'], function () {
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
    startPath: BUILD_PATH,
    server: ''
  });
});

// Watch Files For Changes & Reload
gulp.task('dev', ['serve'], function () {
  gulp.watch(['app/*.*'], browserSync.reload);
});

gulp.task('build', ['js', 'index', 'css']);

gulp.task('deploy', ['build'], function () {
  return gulp.src(BUILD_PATH + '/*/')
    .pipe(ghPages());
});
