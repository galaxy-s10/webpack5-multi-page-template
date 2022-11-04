const prefix = '/aaa/';
// const cssReg = new RegExp('/css/');
const cssReg = new RegExp(
  `<link href="((\\.${prefix}\\/css\\/([^?]+)\\.css)[?a-zA-Z0-9]+)" rel="stylesheet">`
);
const str =
  '<link href="/aaa/css/index-67f2fb.css?ab5c483af0e57e645187" rel="stylesheet"></head>';
console.log(cssReg);

const res = str.replace(cssReg, '123');
console.log(res);
