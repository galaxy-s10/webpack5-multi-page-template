export const outputDir = 'dist'; // 输出目录名称
export const eslintEnable = false; // 是否开启eslint（开发环境会读取它），会影响热更新速度，这里只是关闭了webpack的eslint插件，但可以依靠编辑器的eslint提示。
export const webpackBarEnable = false; // 是否开启WebpackBar（开发环境会读取它），只要是插件就会影响构建速度，开发环境关掉它吧
export const analyzer = false; // 是否开启Webpack包分析
export const gzipEnable = false; // http压缩

export const originHtmlFlag = 1024 * 50; // 50kb
export const originCssFlag = 1024 * 10; // 10kb
export const originJsFlag = 1024 * 20; // 20kb

// eslint-disable-next-line
export const outputStaticUrl = (isProduction = false) => {
  // 这个outputStaticUrl方法，不会影响多页面引入的js/css的publicPath
  return './';
};
