const path = require('path');
const prefix = '/aaa/'.replace(/\/$/, ''); // 将最后的/替换掉
const cssReg = new RegExp(
  `<link href="((${prefix}/css/([^?]+)\\.css)[?a-zA-Z0-9]+)" rel="stylesheet">`
);
const str =
  '<link href="/aaa/css/index-67f2fb.css?ab5c483af0e57e645187" rel="stylesheet"></head>';
console.log(cssReg, 22);

const res = str.replace(cssReg, (res1, res2, res3) => {
  console.log(res3);
  const path = res3.replace(prefix, '.');
  return `<link href="${path}" rel="stylesheet" inline>`;
});
console.log(res, 1);
