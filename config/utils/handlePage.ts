import HtmlWebpackPlugin from 'html-webpack-plugin';

import { pages } from './pageConfig';

export const generatePageConfig = () => {
  // path.resolve(__dirname,'../')

  const minifier = {
    collapseWhitespace: true, // 折叠空白
    keepClosingSlash: true, // 在单标签上保留末尾斜杠
    removeComments: true, // 移除注释
    removeRedundantAttributes: true, // 移除多余的属性（如：input的type默认就是text，如果写了type="text"，就移除它，因为不写它默认也是type="text"）
    removeScriptTypeAttributes: true, // 删除script标签中type="text/javascript"
    removeStyleLinkTypeAttributes: true, // 删除style和link标签中type="text/css"
    useShortDoctype: true, // 使用html5的<!doctype html>替换掉之前的html老版本声明方式<!doctype>
    // 上面的都是production模式下默认值。
    removeEmptyAttributes: true, // 移除一些空属性，如空的id,classs,style等等，但不是空的就全删，比如<img alt />中的alt不会删。http://perfectionkills.com/experimenting-with-html-minifier/#remove_empty_or_blank_attributes

    minifyCSS: true, // 使用clean-css插件删除 CSS 中一些无用的空格、注释等。
    minifyJS: true, // 使用Terser插件优化
  };
  let entry = {};
  let plugins: any[] = [];
  pages.forEach((item, index) => {
    let name = item.name;
    console.log(item, 777);
    console.log(item.template);
    entry[name] = item.entry;

    plugins.push(
      new HtmlWebpackPlugin({
        filename: name,
        // title: APP_NAME, // 使用html-loader后，htmlWebpackPlugin定义的变量就不管用了。
        template: item.template,
        hash: true,
        minify: minifier,
        chunks: ['main'], // 要仅包含某些块，您可以限制正在使用的块
      })
    );
  });

  return { entry, plugins };
};
