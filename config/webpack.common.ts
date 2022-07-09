import path from 'path';

import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import Handlebars from 'handlebars';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { DefinePlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import WebpackBar from 'webpackbar';

import pkg from '../package.json';
import { chalkINFO, emoji } from './utils/chalkTip';
import { generatePageConfig } from './utils/handlePage';
import { outputStaticUrl, APP_NAME } from './utils/outputStaticUrl';
import devConfig from './webpack.dev';
import prodConfig from './webpack.prod';

console.log(
  chalkINFO(`读取: ${__filename.slice(__dirname.length + 1)}`),
  emoji.get('white_check_mark')
);

const commonConfig = (isProduction) => {
  const { entry, plugins } = generatePageConfig();
  console.log(plugins);
  // return;
  const result = {
    // 入口，默认src/index.js
    // entry,
    entry: {
      main: {
        import: './src/main.ts',
        // filename: 'output-[name]-bundle.js', //默认情况下，入口 chunk 的输出文件名是从 output.filename 中提取出来的，但你可以为特定的入口指定一个自定义的输出文件名。
      },
      // home: {
      //   import: './src/page/home/home.ts',
      //   // filename: 'output-[name]-bundle.js', //默认情况下，入口 chunk 的输出文件名是从 output.filename 中提取出来的，但你可以为特定的入口指定一个自定义的输出文件名。
      // },
    },

    // 输出
    output: {
      path: path.resolve(__dirname, '../dist'),
      publicPath: outputStaticUrl(),
    },
    resolve: {
      // 解析路径
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // 解析扩展名
      alias: {
        // 如果不设置这个alias，webpack就会解析不到import xxx '@/xxx'中的@
        '@': path.resolve(__dirname, '../src'), // 设置路径别名
      },
    },
    resolveLoader: {
      // 用于解析webpack的loader
      modules: ['node_modules'],
    },
    cache: {
      // type: 'memory',
      type: 'filesystem',
      buildDependencies: {
        // https://webpack.js.org/configuration/cache/#cacheallowcollectingmemory
        // 建议cache.buildDependencies.config: [__filename]在您的 webpack 配置中设置以获取最新配置和所有依赖项。
        config: [__filename],
      },
    },
    module: {
      // loader执行顺序：从下往上，从右往左
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            'thread-loader',
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                cacheCompression: false, // https://github.com/facebook/create-react-app/issues/6846
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                cacheCompression: false, // https://github.com/facebook/create-react-app/issues/6846
              },
            },
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: ['\\.vue$'],
                // If you want to speed up compilation significantly you can set this flag. https://www.npmjs.com/package/ts-loader#transpileonly
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            isProduction
              ? {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    /**
                     * you can specify a publicPath here, by default it uses publicPath in webpackOptions.output
                     * 即默认打包的css文件是webpackOptions.output的publicPath，
                     * 但在new MiniCssExtractPlugin()时候，设置了打包生成的文件在dist下面的css目录里，
                     */
                    publicPath: '../',
                  },
                }
              : { loader: 'style-loader' }, // Do not use style-loader and mini-css-extract-plugin together.
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1, // 在css文件里面@import了其他资源，就回到上一个loader，在上一个loader那里重新解析@import里的资源
              },
            },
            'postcss-loader', // 默认会自动找postcss.config.js
          ].filter(Boolean),
          sideEffects: true, // 告诉webpack是有副作用的，不对css进行删除
        },
        {
          test: /\.(sass|scss)$/,
          use: [
            isProduction
              ? {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: '../',
                  },
                }
              : { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2, // https://www.npmjs.com/package/css-loader#importloaders
              },
            },
            'postcss-loader', // 默认会自动找postcss.config.js
            { loader: 'sass-loader' },
          ].filter(Boolean),
          sideEffects: true,
        },
        {
          test: /\.(jpg|jpeg|png|gif|svg)$/,
          type: 'asset',
          generator: {
            filename: 'img/[name]-[contenthash:6][ext]',
          },
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024, // 如果一个模块源码大小小于 maxSize，那么模块会被作为一个 Base64 编码的字符串注入到包中， 否则模块文件会被生成到输出的目标目录中
            },
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: true,
                // 使用html-loader后，htmlWebpackPlugin定义的变量就不管用了。
                preprocessor: (content, loaderContext) => {
                  let result;

                  try {
                    result = Handlebars.compile(content)({
                      title: APP_NAME || pkg.name,
                      BASE_URL: outputStaticUrl(),
                    });
                  } catch (error) {
                    loaderContext.emitError(error);

                    return content;
                  }

                  return result;
                },
              },
            },
          ],
        },
        {
          // test: /\.(eot|ttf|woff2?)\??.*$/,
          test: /\.(eot|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: {
            filename: 'font/[name]-[contenthash:6][ext]',
          },
        },
      ],
    },
    plugins: [
      // 构建进度条
      new WebpackBar(),
      // 友好的显示错误信息在终端
      new FriendlyErrorsWebpackPlugin(),
      // eslint
      new ESLintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        emitError: false, // 发现的错误将始终发出，禁用设置为false.
        emitWarning: false, // 找到的警告将始终发出，禁用设置为false.
        failOnError: false, // 如果有任何错误，将导致模块构建失败，禁用设置为false
        failOnWarning: false, // 如果有任何警告，将导致模块构建失败，禁用设置为false
        cache: true,
        cacheLocation: path.resolve(
          __dirname,
          '../node_modules/.cache/.eslintcache'
        ),
      }),
      // ...plugins,
      // // 该插件将为您生成一个HTML5文件，其中包含使用脚本标签的所有Webpack捆绑包
      new HtmlWebpackPlugin({
        filename: 'index.html',
        // title: APP_NAME, // 使用html-loader后，htmlWebpackPlugin定义的变量就不管用了。
        template: './src/page/home/home.html',
        hash: true,
        minify: isProduction
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
          : false,
        // chunks: ['main'], // 要仅包含某些块，您可以限制正在使用的块
      }),
      //
      // new HtmlWebpackPlugin({
      //   filename: 'demo.html',
      //   // title: APP_NAME, // 使用html-loader后，htmlWebpackPlugin定义的变量就不管用了。
      //   template: './public/demo.html',
      //   hash: true,
      //   minify: isProduction
      //     ? {
      //         collapseWhitespace: true, // 折叠空白
      //         keepClosingSlash: true, // 在单标签上保留末尾斜杠
      //         removeComments: true, // 移除注释
      //         removeRedundantAttributes: true, // 移除多余的属性（如：input的type默认就是text，如果写了type="text"，就移除它，因为不写它默认也是type="text"）
      //         removeScriptTypeAttributes: true, // 删除script标签中type="text/javascript"
      //         removeStyleLinkTypeAttributes: true, // 删除style和link标签中type="text/css"
      //         useShortDoctype: true, // 使用html5的<!doctype html>替换掉之前的html老版本声明方式<!doctype>
      //         // 上面的都是production模式下默认值。
      //         removeEmptyAttributes: true, // 移除一些空属性，如空的id,classs,style等等，但不是空的就全删，比如<img alt />中的alt不会删。http://perfectionkills.com/experimenting-with-html-minifier/#remove_empty_or_blank_attributes

      //         minifyCSS: true, // 使用clean-css插件删除 CSS 中一些无用的空格、注释等。
      //         minifyJS: true, // 使用Terser插件优化
      //       }
      //     : false,
      //   chunks: ['demo'], // 要仅包含某些块，您可以限制正在使用的块
      // }),
      // 将已存在的单个文件或整个目录复制到构建目录。
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public', // 复制public目录的文件
            // to: 'assets', //复制到output.path下的assets，不写默认就是output.path根目录
            globOptions: {
              ignore: [
                // 复制到output.path时，如果output.paht已经存在重复的文件了，会报错：
                // ERROR in Conflict: Multiple assets emit different content to the same filename md.html
                '**/index.html', // 忽略from目录下的index.html，它是入口文件
                '**/demo.html', // 忽略from目录下的demo.html，它是入口文件
              ],
            },
          },
        ],
      }),
      // 定义全局变量
      new DefinePlugin({
        BASE_URL: `${JSON.stringify(outputStaticUrl())}`, // public下的index.html里面的icon的路径
        'process.env': {
          NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
          H5_GAME_PROJECT_NAME: JSON.stringify(pkg.name),
          H5_GAME_PROJECT_VERSION: JSON.stringify(pkg.version),
          H5_GAME_PROJECT_LASTBUNDLE_TIME: JSON.stringify(
            new Date().toLocaleString()
          ),
        },
      }),
      // bundle分析
      process.env.WEBPACK_ANALYZER_SWITCH &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          generateStatsFile: true,
          statsOptions: { source: false },
        }), // configuration.plugins should be one of these object { apply, … } | function
    ].filter(Boolean),
  };
  return result;
};

export default (env) => {
  return new Promise((resolve) => {
    const isProduction = env.production;
    /**
     * 注意：在node环境下，给process.env这个对象添加的所有属性，都会默认转成字符串,
     * 如果给process.env.NODE_ENV = undefined，赋值的时候node会将undefined转成"undefined"再赋值
     * 即约等于：process.env.NODE_ENV = "undefined",
     * 如果是process.env.num = 123，最终就是：process.env.num = "123"。
     * 所以，尽量不要将非字符串赋值给process.env[属性名]！
     */
    // 如果是process.env.production = isProduction，这样的话，process.env.production就要么是字符串"true"，要么是字符串"undefined"
    // 改进：process.env.production = isProduction?true:false,这样的话，process.env.production就要么是字符串"true"，要么是字符串"false"
    // 这里要先判断isProduction，判断完再将字符串赋值给process.env.NODE_ENV，就万无一失了
    process.env.NODE_ENV = isProduction ? 'production' : 'development';
    // prodConfig返回的是普通对象，devConfig返回的是promise，使用Promise.resolve进行包装
    const configPromise = Promise.resolve(
      isProduction ? prodConfig : devConfig
    );
    configPromise.then((config: any) => {
      // 根据当前环境，合并配置文件
      const mergeConfig = merge(commonConfig(isProduction), config);
      console.log(chalkINFO(`当前是: ${process.env.NODE_ENV}环境`));
      resolve(mergeConfig);
    });
  });
};
