import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration } from 'webpack';
import WebpackBar from 'webpackbar';

import { gzipEnable } from '../constant';
import { chalkINFO } from '../utils/chalkTip';

console.log(chalkINFO(`读取: ${__filename.slice(__dirname.length + 1)}`));

const prodConfig: Configuration = {
  mode: 'production',
  devtool: false,
  output: {
    clean: true, // 在生成文件之前清空 output 目录。替代clean-webpack-plugin
    // 下面三个选项如果放在webpack.common.ts的话，在开发模式的时候修改index.html热更新会时不时的报错。
    filename: 'js/[name]-[contenthash:6]-bundle.js', // 入口文件打包生成后的文件的文件名
    chunkFilename: 'js/[name]-[contenthash:6]-bundle-chunk.js',
    assetModuleFilename: 'assets/[name]-[contenthash:6].[ext]', // 静态资源生成目录（不管什么资源默认都统一生成到这里,除非单独设置了generator）
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          // 重写默认的defaultVendors
          chunks: 'initial',
          // minSize: 100 * 1024,
          maxSize: 100 * 1024,
          test: /[\\/]node_modules[\\/]/,
          // filename: 'js/[name]-defaultVendors.js',
          filename: 'js/[name]-[contenthash:6]-defaultVendors.js',
          priority: -10,
        },
        default: {
          // 重写默认的default
          chunks: 'all',
          maxSize: 100 * 1024,
          filename: 'js/[name]-[contenthash:6]-default.js',
          minChunks: 2, // 至少被minChunks个入口文件引入了minChunks次。
          priority: -20,
        },
      },
    },
    usedExports: true, // production模式或者不设置usedExports，它默认就是true。usedExports的目的是标注出来哪些函数是没有被使用 unused，会结合Terser进行处理
    minimize: true, // 是否开启Terser,默认就是true，设置false后，不会压缩和转化
    minimizer: [
      new TerserPlugin({
        parallel: true, // 使用多进程并发运行以提高构建速度
        extractComments: false, // 默认true,会将/^\**!|@preserve|@license|@cc_on/i的注释提取到单独的文件中
        // Terser 压缩配置
        terserOptions: {
          parse: {
            // 注意：terserOptions.parse被标记了deprecated。
          },
          compress: {
            // defaults:true,默认true,传递false禁用大多数默认启用的compress转换
            arguments: true, // 默认false,尽可能将参数[index]替换为函数参数名
            dead_code: true, // 默认true,删除无法访问的代码(比如return后面的语句)
            toplevel: false, // 默认false,在顶级作用域中删除未引用的函数("funcs")和/或变量("vars"), 设置true表示同时删除未引用的函数和变量
            keep_classnames: false, // 默认false,传递true以防止terser丢弃类名
            keep_fnames: false, // 默认false,传递true以防止terser丢弃函数名
            drop_console: false, // 默认false,设置true会删掉丢掉对console.*函数的调用
            // pure_funcs: ['console.log'], // 告诉terser,console.log没有副作用,terser会将它删除
          },
          /**
           * mangle,默认值true,会将keep_classnames,keep_fnames,toplevel等等mangle options的所有选项设为true。
           * 传递false以跳过篡改名称，或者传递一个对象来指定篡改选项
           */
          mangle: true,
          toplevel: false, // 注意：terserOptions.toplevel被标记了deprecated。默认false,如果希望启用顶级变量和函数名修改,并删除未使用的变量和函数,则设置为true。
          keep_classnames: true, // 默认undefined,传递true以防止丢弃或混淆类名。
          keep_fnames: true, // 默认false,传递true以防止函数名被丢弃或混淆。
        },
      }),
      new CssMinimizerPlugin({
        parallel: true, // 使用多进程并发执行，提升构建速度。
      }), // css压缩，去除无用的空格等等
    ],
  },
  // @ts-ignore
  plugins: [
    // 构建进度条
    new WebpackBar(),
    // http压缩
    gzipEnable &&
      new CompressionPlugin({
        test: /\.(css|js)$/i,
        threshold: 10 * 1024, // 大于10k的文件才进行压缩
        minRatio: 0.8, // 只有压缩比这个比率更好的资产才会被处理(minRatio =压缩大小/原始大小),即压缩如果达不到0.8就不会进行压缩
        algorithm: 'gzip', // 压缩算法
      }),
    /**
     * 默认js里面的import的css，会使用js动态生成style标签并且带上css
     * mini-css-extract-plugin插件能够提取js里面import的css，将里面的css单独输出，然后通过link标签引入
     */
    new MiniCssExtractPlugin({
      /**
       * Options similar to the same options in webpackOptions.output
       * all options are optional
       */
      filename: 'css/[name]-[contenthash:6].css',
      chunkFilename: 'css/[id]-[contenthash:6].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
  ].filter(Boolean),
};

export default prodConfig;
