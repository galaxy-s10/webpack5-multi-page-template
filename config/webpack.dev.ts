import path from 'path';

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import portfinder from 'portfinder';
import WebpackDevServer from 'webpack-dev-server';

import ConsoleDebugPlugin from './consoleDebugPlugin';
import { chalkINFO } from './utils/chalkTip';
import { outputStaticUrl } from './utils/outputStaticUrl';

const localIPv4 = WebpackDevServer.internalIPSync('v4');

console.log(chalkINFO(`读取: ${__filename.slice(__dirname.length + 1)}`));

export default new Promise((resolve) => {
  // 默认端口8000，如果被占用了，会自动递增+1
  const defaultPort = 8000;
  portfinder
    .getPortPromise({
      port: defaultPort,
      stopPort: 9000,
    })
    .then((port) => {
      resolve({
        target: 'web',
        mode: 'development',
        devtool: 'source-map',
        stats: 'errors-warnings', // 只显示警告和错误信息（webpack-dev-server4.x后变了）
        // 这个infrastructureLogging设置参考了vuecli5，如果不设置，webpack-dev-server会打印一些信息
        infrastructureLogging: {
          level: 'none',
        },
        devServer: {
          client: {
            logging: 'none', // https://webpack.js.org/configuration/dev-server/#devserverclient
            // progress: true, //在浏览器的控制台中以百分比形式打印编译进度。
          },
          hot: true, // 启用 webpack 的热模块替换功能
          // hot: 'only', // 要在构建失败的情况下启用热模块替换而不刷新页面作为后备，请使用hot: 'only'。但在vue项目的话，使用only会导致ts文件没有热更，得使用true
          compress: true, // 为所有服务启用gzip 压缩
          port, // 开发服务器端口，默认8080
          open: false, // 告诉 dev-server 在服务器启动后打开浏览器。
          historyApiFallback: {
            rewrites: [
              /**
               * 如果publicPath设置了/abc，就不能直接设置historyApiFallback: true，这样会重定向到根目录下的index.html
               * publicPath设置了/abc，就重定向到/abc，这样就可以了
               */
              { from: outputStaticUrl(false), to: outputStaticUrl(false) },
            ],
          },
          watchFiles: ['src/**/*'], // 不设置该属性的话，修改src目录的html文件不会触发热更新

          static: {
            watch: true, // 告诉 dev-server 监听文件。默认启用，文件更改将触发整个页面重新加载。可以通过将 watch 设置为 false 禁用。
            publicPath: outputStaticUrl(false),
            directory: path.resolve(__dirname, '../public'),
            // directory: path.resolve(__dirname, '../src'),
          },
          proxy: {
            '/api': {
              target: 'http://localhost:3300',
              secure: false, // 默认情况下（secure: true），不接受在HTTPS上运行的带有无效证书的后端服务器。设置secure: false后，后端服务器的HTTPS有无效证书也可运行
              /**
               * changeOrigin，是否修改请求地址的源
               * 默认changeOrigin: false，即发请求即使用devServer的localhost:port发起的，如果后端服务器有校验源，就会有问题
               * 设置changeOrigin: true，就会修改发起请求的源，将原本的localhost:port修改为target，这样就可以通过后端服务器对源的校验
               */
              changeOrigin: true,
              pathRewrite: {
                // '^/admin': '', // 效果：/api/link/list ==> http://localhost:3200/link/list
                '^/api': '/admin/', // 效果：/api/link/list ==> http://localhost:3200/admin/link/list
              },
            },
            '/prodapi': {
              target: 'http://42.193.157.44:3200',
              secure: false, // 默认情况下（secure: true），不接受在HTTPS上运行的带有无效证书的后端服务器。设置secure: false后，后端服务器的HTTPS有无效证书也可运行
              /**
               * changeOrigin，是否修改请求地址的源
               * 默认changeOrigin: false，即发请求即使用devServer的localhost:port发起的，如果后端服务器有校验源，就会有问题
               * 设置changeOrigin: true，就会修改发起请求的源，将原本的localhost:port修改为target，这样就可以通过后端服务器对源的校验
               */
              changeOrigin: true,
              pathRewrite: {
                // '^/admin': '', // 效果：/api/link/list ==> http://42.193.157.44:3200/link/list
                '^/prodapi': '/admin/', // 效果：/api/link/list ==> http://42.193.157.44:3200/admin/link/list
              },
            },
            '/betaapi': {
              target: 'http://42.193.157.44:3300',
              secure: false, // 默认情况下（secure: true），不接受在HTTPS上运行的带有无效证书的后端服务器。设置secure: false后，后端服务器的HTTPS有无效证书也可运行
              /**
               * changeOrigin，是否修改请求地址的源
               * 默认changeOrigin: false，即发请求即使用devServer的localhost:port发起的，如果后端服务器有校验源，就会有问题
               * 设置changeOrigin: true，就会修改发起请求的源，将原本的localhost:port修改为target，这样就可以通过后端服务器对源的校验
               */
              changeOrigin: true,
              pathRewrite: {
                // '^/admin': '', // 效果：/api/link/list ==> http://42.193.157.44:3300/link/list
                '^/betaapi': '/admin/', // 效果：/api/link/list ==> http://42.193.157.44:3300/admin/link/list
              },
            },
          },
        },
        plugins: [
          new ForkTsCheckerWebpackPlugin({
            /**
             * devServer如果设置为false，则不会向 Webpack Dev Server 报告错误。
             * 但是控制台还是会打印错误。
             */
            devServer: false, // 7.x版本，7.x版本有毛病，会报错：https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/723
            // logger: {
            //   devServer: false, //fork-ts-checker-webpack-plugin6.x版本
            // },
            /**
             * async 为 false，同步的将错误信息反馈给 webpack，如果报错了，webpack 就会编译失败
             * async 默认为 true，异步的将错误信息反馈给 webpack，如果报错了，不影响 webpack 的编译
             */
            async: true,
          }),
          // 打印控制调试地址
          new ConsoleDebugPlugin({
            local: `http://localhost:${port}`,
            network: `http://${localIPv4}:${port}`,
          }),
        ],
      });
    })
    .catch((error) => {
      console.log(error);
    });
});
