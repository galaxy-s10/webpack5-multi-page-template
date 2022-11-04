import { execSync } from 'child_process';

import HtmlWebpackPlugin from 'html-webpack-plugin';

import pkg from '../package.json';

let commitHash;
let commitUserName;
let commitDate;
let commitMessage;
try {
  // commit哈希
  commitHash = execSync('git show -s --format=%H').toString().trim();
  // commit用户名
  commitUserName = execSync('git show -s --format=%cn').toString().trim();
  // commit日期
  commitDate = new Date(
    execSync(`git show -s --format=%cd`).toString()
  ).toLocaleString();
  // commit消息
  commitMessage = execSync('git show -s --format=%s').toString().trim();
} catch (error) {
  console.log(error);
}

const templateStr = `
(function(){
var log = (title, value) => {
  console.log(
    '%c ' + title + ' %c ' + value + ' ' + '%c',
    'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
    'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
    'background:transparent'
  );
};

log('项目名称：', {pkgName});
log('项目版本：', {pkgVersion});
log('项目仓库：', {pkgRepository});
log('最后构建：', {lastBuild});
log('构建仓库git提交用户：', {commitUserName});
log('构建仓库git提交日期：', {commitDate});
log('构建仓库git提交信息：', {commitMessage});
log('构建仓库git提交哈希：', {commitHash});
})()
`;

const pkgName = pkg.name;
const pkgVersion = pkg.version;
const pkgRepository = pkg.repository.url;

const replaceKeyFromValue = (str: string, obj: object) => {
  let res = str;
  Object.keys(obj).forEach((v) => {
    res = res.replace(new RegExp(`{${v}}`, 'ig'), obj[v]);
  });
  return res;
};

interface IInjectProjectInfoPlugin {
  isProduction?: boolean;
}

class InjectProjectInfoPlugin {
  options: IInjectProjectInfoPlugin;

  constructor(options: IInjectProjectInfoPlugin) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('InjectProjectInfoPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'InjectProjectInfoPlugin',
        (data, cb) => {
          // 获取原来内容
          const info = replaceKeyFromValue(templateStr.toString(), {
            pkgName: JSON.stringify(pkgName),
            pkgVersion: JSON.stringify(pkgVersion),
            pkgRepository: JSON.stringify(pkgRepository),
            lastBuild: JSON.stringify(new Date().toLocaleString()),
            commitDate: JSON.stringify(commitDate),
            commitHash: JSON.stringify(commitHash),
            commitMessage: JSON.stringify(commitMessage),
            commitUserName: JSON.stringify(commitUserName),
          });
          data.html = data.html.replace(
            '</title>',
            `</title>\n<script>\n${info}\n</script>`
          );
          cb(null, data);
        }
      );
    });
  }
}

export default InjectProjectInfoPlugin;
