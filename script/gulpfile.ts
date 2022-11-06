import { statSync } from 'fs';

import gulp from 'gulp';

import {
  originCssFlag,
  originHtmlFlag,
  originJsFlag,
  outputStaticUrl,
} from './constant';
import { chalkINFO, chalkSUCCESS, chalkWARN } from './utils/chalkTip';

const path = require('path');
const process = require('process');

const del = require('del');
const inlinesource = require('gulp-inline-source');
const gulpReplace = require('gulp-replace');
const through2 = require('through2');

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

const inlineDistDir = path.resolve(__filename, '../../inlineDist');

const prefix =
  outputStaticUrl(true) === './'
    ? '.'
    : outputStaticUrl(true).replace(/\/$/, ''); // 将最后的/替换掉

const cssReg = new RegExp(
  `<link href="((${prefix}/css/([^?]+)\\.css)[?a-zA-Z0-9]+)" rel="stylesheet">`,
  'g'
);

const jsReg = new RegExp(
  `<script defer="defer" src="((${prefix}/js/[^?]+)\\.js)[?a-zA-Z0-9]+">`,
  'g'
);

// 将所有css和带defer标志的js内联到html
function replace() {
  return gulp
    .src('./inlineDist/**/*.html')
    .pipe(
      gulpReplace(cssReg, (res1, res2, res3) => {
        return `<link href="${res3.replace(
          prefix,
          '.'
        )}" rel="stylesheet" inline>`;
      }) // 将link标签里的css内联到html里面
    )
    .pipe(
      gulpReplace(jsReg, (res1, res2) => {
        return `<script defer="defer" src="${res2.replace(
          prefix,
          '.'
        )}" inline>`;
      }) // 将script标签里的js内联到html里面
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

const delArr: string[] = [];

// 如果html页面小于50kb,则优先内联css,再内联js,每次内联后都判断内联后的html是否大于50kb,大于的话就不内联了
// 注意不要更改原本的css和js原本的顺序！
function autoReplace() {
  return gulp
    .src('./inlineDist/**/*.html')
    .pipe(
      through2.obj(function (file, encoding, next) {
        const str = file.contents.toString();
        let htmlFlag = originHtmlFlag;
        let htmlSize = file.stat.size;
        const originHtmlSize = htmlSize;
        const htmlPath = file.path.replace(inlineDistDir, '');
        console.log(
          chalkINFO(
            `开始内联${htmlPath}，原始大小：${formatMemorySize(originHtmlSize)}`
          )
        );
        const cssRes = str.replace(cssReg, (res1, res2, res3) => {
          const cssStat = statSync(path.resolve(inlineDistDir, res3));
          const cssSize = cssStat.size;
          const cssFlag = originCssFlag;
          if (htmlSize > htmlFlag) {
            console.log(
              chalkWARN(
                `【内联css】${res3}，当前${htmlPath}大小：${formatMemorySize(
                  htmlSize
                )}，超过html限制(${formatMemorySize(originHtmlFlag)})，不内联`
              )
            );
          } else {
            if (cssSize < cssFlag) {
              console.log(
                chalkSUCCESS(
                  `【内联css】${res3}(${formatMemorySize(
                    cssSize
                  )})，小于${formatMemorySize(
                    cssFlag
                  )}，内联进${htmlPath}，${formatMemorySize(
                    htmlSize
                  )} ===> ${formatMemorySize(htmlSize + cssSize)}`
                )
              );
              delArr.push(path.resolve('./inlineDist/', res3));
              htmlFlag -= cssSize;
              htmlSize += cssSize;
              return `<link href="${res3.replace(
                prefix,
                '.'
              )}" rel="stylesheet" inline>`;
            } else {
              console.log(
                chalkWARN(
                  `【内联css】${res3}(${formatMemorySize(
                    cssSize
                  )})，大于${formatMemorySize(
                    cssFlag
                  )}，不内联进${htmlPath}，${formatMemorySize(
                    htmlSize
                  )} ===> ${formatMemorySize(htmlSize)}`
                )
              );
              return res1;
            }
          }
        });
        const jsRes = cssRes.replace(jsReg, (res1, res2) => {
          const jsStat = statSync(path.resolve(inlineDistDir, res2));
          const jsSize = jsStat.size;
          const jsFlag = originJsFlag;
          if (htmlSize > htmlFlag) {
            console.log(
              chalkWARN(
                `【内联js】${res2}，当前${htmlPath}大小：${formatMemorySize(
                  htmlSize
                )}，超过html限制(${formatMemorySize(originHtmlFlag)})，不内联`
              )
            );
          } else {
            if (jsSize < jsFlag) {
              console.log(
                chalkSUCCESS(
                  `【内联js】${res2}(${formatMemorySize(
                    jsSize
                  )})，小于${formatMemorySize(
                    jsFlag
                  )}，内联进${htmlPath}，${formatMemorySize(
                    htmlSize
                  )} ===> ${formatMemorySize(htmlSize + jsSize)}`
                )
              );
              delArr.push(path.resolve('./inlineDist/', res2));
              htmlFlag -= jsSize;
              htmlSize += jsSize;
              return `<script defer="defer" src="${res2.replace(
                prefix,
                '.'
              )}" inline>`;
            } else {
              console.log(
                chalkWARN(
                  `【内联js】${res2}(${formatMemorySize(
                    jsSize
                  )})，大于${formatMemorySize(
                    jsFlag
                  )}，不内联进${htmlPath}，${formatMemorySize(
                    htmlSize
                  )} ===> ${formatMemorySize(htmlSize)}`
                )
              );
              return res1;
            }
          }
        });
        file.contents = Buffer.from(jsRes);
        console.log(
          chalkINFO(
            `完成内联${htmlPath}，${formatMemorySize(
              originHtmlSize
            )} ===> ${formatMemorySize(htmlSize)}`
          )
        );
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

function removeUseless() {
  return del(delArr);
}

gulp.task(
  'build',
  gulp.series(changeChdir, removeOld, copy, autoReplace, removeUseless)
);

gulp.task(
  'replace',
  gulp.series(changeChdir, removeOld, copy, replace, removeUseless)
);
