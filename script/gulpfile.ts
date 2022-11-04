import fs, { statSync } from 'fs';

import through2 from 'through2';

import { outputStaticUrl } from './constant';

const path = require('path');
const process = require('process');

const del = require('del');
const gulp = require('gulp');
const inlinesource = require('gulp-inline-source');
const gulpReplace = require('gulp-replace');
// const through2 = require('through2');
const distDir = path.resolve(__filename, '../../dist');

/**
 * @description 格式化内存大小（要求传入的数字以byte为单位）
 * @param {number} val
 * @param {*} num 显示几位小数，默认2
 * @return {*}
 */
const formatMemorySize = (val: number, num = 2) => {
  // bit:"比特"或"位",1byte=8bit
  const oneByte = 1;
  const oneKb = oneByte * 1024;
  const oneMb = oneKb * 1024;
  const oneGb = oneMb * 1024;
  const oneTb = oneGb * 1024;
  const format = (v: number) => v.toFixed(num);
  if (val < oneKb) {
    return `${format(val / oneByte)}byte`;
  }
  if (val < oneMb) {
    return `${format(val / oneKb)}kb`;
  }
  if (val < oneGb) {
    return `${format(val / oneMb)}mb`;
  }
  if (val < oneTb) {
    return `${format(val / oneGb)}gb`;
  }
  return `${format(val / oneTb)}tb`;
};

function autoReplace() {
  return gulp
    .src('./inlineDist/**/*.html')
    .pipe(
      through2.obj(function (file, encoding, next) {
        const str = file.contents.toString();
        const cssReg =
          /<link href="((\.\/css\/([^?]+)\.css)[?a-zA-Z0-9]+)" rel="stylesheet">/g;
        const jsReg =
          /<script defer="defer" src="((.\/js\/[^?]+)\.js)[?a-zA-Z0-9]+">/g;
        const cssRes = str.replace(cssReg, (res1, res2, res3) => {
          // console.log(res1, res2, res3);
          const stat = statSync(path.resolve(distDir, res3));
          const size = stat.size;
          const flag = 1024 * 4;
          if (size < flag) {
            console.log(
              `${res3}大小：${formatMemorySize(size)}，小于${formatMemorySize(
                flag
              )}，内联进html`
            );
            return `<link href="${res3}" rel="stylesheet" inline>`;
          } else {
            console.log(
              `${res3}大小：${formatMemorySize(size)}，大于${formatMemorySize(
                flag
              )}，不内联进html`
            );
          }

          return res1;
        });
        const lastRes = cssRes.replace(jsReg, (res1, res2) => {
          const stat = statSync(path.resolve(distDir, res2));
          const size = stat.size;
          const flag = 1024 * 10;
          if (size < flag) {
            console.log(
              `${res2}大小：${formatMemorySize(size)}，小于${formatMemorySize(
                flag
              )}，内联进html`
            );
            return `<script defer="defer" src="${res2}" inline>`;
          } else {
            console.log(
              `${res2}大小：${formatMemorySize(size)}，大于${formatMemorySize(
                flag
              )}，不内联进html`
            );
          }
          return res1;
        });
        // console.log(res, 9998);
        file.contents = Buffer.from(lastRes);
        next(null, file);
      })
    )
    .pipe(
      inlinesource({
        // 关闭压缩，避免报错。因为压缩的时候会读取一些js里面的语法，这里不管语法是否正确，单纯的将外部的js给内联进来即可
        // https://github.com/fmal/gulp-inline-source/issues/34
        compress: false,
      })
    )
    .pipe(gulp.dest('./inlineDist'));
}

function changeChdir(done) {
  process.chdir(path.resolve(__filename, '../../'));
  done();
}
function removeOld() {
  return del(['./inlineDist/']);
}
function copy() {
  return gulp.src('./dist/**/*').pipe(gulp.dest('./inlineDist'));
}

const prefix = outputStaticUrl(true);

const cssReg = new RegExp(
  /<link href="((\.\/css\/([^?]+)\.css)[?a-zA-Z0-9]+)" rel="stylesheet">/
);
console.log(cssReg);

function replace() {
  return gulp
    .src('./inlineDist/**/*.html')
    .pipe(
      gulpReplace(
        /<link href="((\.\/css\/([^?]+)\.css)[?a-zA-Z0-9]+)" rel="stylesheet">/,
        '<link href="$2" rel="stylesheet" inline>'
      ) // 将link标签里的./css/xxx.css内联到html里面
    )
    .pipe(
      gulpReplace(
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
}

function removeUseless() {
  return del(['./inlineDist/css/', './inlineDist/js/']);
}

gulp.task(
  'build',
  gulp.series(changeChdir, removeOld, copy, autoReplace, removeUseless)
);

gulp.task(
  'replace',
  gulp.series(changeChdir, removeOld, copy, replace, removeUseless)
);
