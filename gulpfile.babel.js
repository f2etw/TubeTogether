'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';
import ghPages from 'gulp-gh-pages';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import csswring from 'csswring';
import autoprefixer from 'autoprefixer';
import plumber from 'gulp-plumber';

let reload = browserSync.reload;

let BUILD_PATH = '_public/';

gulp.task('css', () => {
  let processors = [
    autoprefixer,
    csswring
  ];
  return gulp.src('app/app.css')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('index', () => {
  return gulp.src('app/index.html')
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('js', () => {
  return gulp.src('app/app.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('serve', ['build'], () => {
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
gulp.task('dev', ['serve'], () => {
  gulp.watch(['app/*.js'], ['js', reload]);
  gulp.watch(['app/*.css'], ['css', reload]);
  gulp.watch(['app/index.html'], ['index', reload]);
});

gulp.task('build', ['js', 'index', 'css']);

gulp.task('deploy', ['build'], () => {
  return gulp.src(BUILD_PATH + '*/')
    .pipe(ghPages());
});
