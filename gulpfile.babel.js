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
import uglify from 'gulp-uglify';

let reload = browserSync.reload;

let APP_PATH = 'app/';
let BUILD_PATH = '_public/';

gulp.task('css', () => {
  let processors = [
    autoprefixer,
    csswring
  ];
  return gulp.src(`${APP_PATH}*.css`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('index', () => {
  return gulp.src(`${APP_PATH}index.html`)
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('js', () => {
  return gulp.src(`${APP_PATH}*.js`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
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
  gulp.watch([`${APP_PATH}*.js`], ['js', reload]);
  gulp.watch([`${APP_PATH}*.css`], ['css', reload]);
  gulp.watch([`${APP_PATH}index.html`], ['index', reload]);
});

gulp.task('build', ['js', 'index', 'css']);

gulp.task('deploy', ['build'], () => {
  return gulp.src(BUILD_PATH + '*/')
    .pipe(ghPages());
});
