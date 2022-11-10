/* eslint-disable */
// @ts-nocheck

// https://github.com/amfe/lib-flexible
(function flexible(window, document, designWidth, rootValue) {
  var docEl = document.documentElement;
  var dpr = window.devicePixelRatio || 1;

  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = `${12 * dpr}px`;
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }
  setBodyFontSize();

  // set 1rem = viewWidth / 10
  // function setRemUnit() {
  //   var rem = docEl.clientWidth / 10;
  //   docEl.style.fontSize = `${rem}px`;
  // }

  function setRemUnit() {
    var width =
      docEl.clientWidth > designWidth ? designWidth : docEl.clientWidth; // 设置最大不能超过设计稿宽度
    // var width = docEl.clientWidth; // 使用屏幕宽度进行适配
    var rem = (width * rootValue) / designWidth;
    docEl.style.fontSize = `${rem}px`;
  }

  setRemUnit();

  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit();
    }
  });

  // detect 0.5px supports
  // 检测是否支持0.5px，如果支持的话，会在html标签的class添加hairlines
  // 如果支持0.5px的话，border-top:0.5px solid;就能画出0.5px高度的线
  // 如果不支持0.5px的话，border-top:0.5px solid;会画出1px高度的线
  if (dpr >= 2) {
    var fakeBody = document.createElement('body');
    var testElement = document.createElement('div');
    testElement.style.border = '.5px solid transparent';
    fakeBody.appendChild(testElement);
    docEl.appendChild(fakeBody);
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines');
    }
    docEl.removeChild(fakeBody);
  }
})(window, document, 360, 100);
