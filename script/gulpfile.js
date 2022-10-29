const path = require('path');
const process = require('process');

const del = require('del');
const gulp = require('gulp');
const inlinesource = require('gulp-inline-source');
const replace = require('gulp-replace');

gulp.task(
  'default',
  gulp.series(
    function changeChdir(done) {
      process.chdir(path.resolve(__filename, '../../'));
      done();
    },
    function removeOld() {
      return del(['./inlineDist/']);
    },
    function copy() {
      return gulp.src('./dist/**/*').pipe(gulp.dest('./inlineDist'));
    },
    function inline() {
      return gulp
        .src('./inlineDist/**/*.html')
        .pipe(
          replace(
            /<link href="((\.\/css\/([^?]+)\.css)[?a-zA-Z0-9]+)" rel="stylesheet">/,
            '<link href="$2" rel="stylesheet" inline>'
          ) // 将link标签里的./css/xxx.css内联到html里面
        )
        .pipe(
          replace(
            /<script defer="defer" src="((.\/js\/[^?]+)\.js)[?a-zA-Z0-9]+">/,
            '<script defer="defer" src="$1" inline>'
          ) // 将script标签里的./js/xxx.js内联到html里面
        )
        .pipe(
          inlinesource({
            // 关闭压缩，避免报错。因为压缩的时候会读取一些js里面的语法，这里不管语法是否正确，单纯的将外部的js给内联进来即可
            // https://github.com/fmal/gulp-inline-source/issues/34
            compress: false,
          })
        )
        .pipe(gulp.dest('./inlineDist'));
    },
    function removeUseless() {
      return del(['./inlineDist/css/', './inlineDist/js/']);
    }
  )
);
