import path from 'path';

export const pages = (isProduction) => {
  const minify = isProduction
    ? {
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
      }
    : false;

  return [
    {
      name: 'index', // 这个页面的块（chunk）名
      template: path.resolve(__dirname, '../src/page/index.html'), // 这个页面的html文件位置
      entry: path.resolve(__dirname, '../src/page/index.ts'), // 这个页面的ts文件入口
      hash: true,
      minify,
      chunks: ['index'],
    },
    {
      name: 'home', // 这个页面的块（chunk）名
      template: path.resolve(__dirname, '../src/page/home/home.html'), // 这个页面的html文件位置
      entry: path.resolve(__dirname, '../src/page/home/home.ts'), // 这个页面的ts文件入口
      hash: true,
      minify,
      chunks: ['home', 'index'], // 如果设置['home', 'index']，那么index的逻辑也会加到home页面
    },
    {
      name: 'about',
      template: path.resolve(__dirname, '../src/page/about/index.html'), // 这个页面的html文件位置
      entry: path.resolve(__dirname, '../src/page/about/index.ts'), // 这个页面的ts文件入口
      hash: true,
      minify,
      chunks: ['about'], // 限制块，如果希望about页面不和其他页面关联，就设置about
    },
  ];
};
