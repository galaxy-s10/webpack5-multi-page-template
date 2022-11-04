import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin';
// eslint-disable-next-line
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import Handlebars from 'handlebars';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { DefinePlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import pkg from '../../package.json';
import InjectProjectInfoPlugin from '../InjectProjectInfoPlugin';
import { eslintEnable, outputDir, outputStaticUrl } from '../constant';
import { chalkINFO, chalkWARN } from '../utils/chalkTip';
import generatePageConfig from '../utils/handlePage';
import { resolveApp } from '../utils/path';
import devConfig from './webpack.dev';
import prodConfig from './webpack.prod';

console.log(chalkINFO(`读取: ${__filename.slice(__dirname.length + 1)}`));

const commonConfig = (isProduction) => {
  const { entry, htmlWebpackPlugins } = generatePageConfig(isProduction);
  const result = {
    // 入口，默认src/index.js
    entry,
    // 输出
    output: {
      filename: '[name].bundle.js',
      path: resolveApp(`./${outputDir}`),
      publicPath: outputStaticUrl(isProduction),
    },
    resolve: {
      // 解析路径
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // 解析扩展名
      alias: {
        // 如果不设置这个alias，webpack就会解析不到import xxx '@/xxx'中的@
        '@': resolveApp('./src'), // 设置路径别名
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
                // If you want to speed up compilation significantly you can set this flag. https://www.npmjs.com/package/ts-loader#transpileonly
                // 仅转译，设置这个之后，tsconfig.json的target其实就不管用了，因为它不会输出东西，只是将ts转译成js
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
                    publicPath: outputStaticUrl(isProduction),
                  },
                }
              : {
                  loader: 'style-loader',
                }, // Do not use style-loader and mini-css-extract-plugin together.
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
                    /**
                     * you can specify a publicPath here, by default it uses publicPath in webpackOptions.output
                     * 即默认打包的css文件是webpackOptions.output的publicPath，
                     * 但在new MiniCssExtractPlugin()时候，设置了打包生成的文件在dist下面的css目录里，
                     */
                    publicPath: outputStaticUrl(isProduction),
                  },
                }
              : {
                  loader: 'style-loader',
                },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2, // https://www.npmjs.com/package/css-loader#importloaders
              },
            },
            'postcss-loader', // 默认会自动找postcss.config.js
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                // 根据sass-loader9.x以后使用additionalData，9.x以前使用prependData
                additionalData: `@use '~@/assets/css/global/global.scss';`,
              },
            },
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
                minimize: isProduction ? true : false,
                // 使用html-loader后，htmlWebpackPlugin定义的变量就不管用了。
                preprocessor: (content, loaderContext) => {
                  let res;
                  try {
                    res = Handlebars.compile(content)({
                      title: pkg.name,
                      BASE_URL: outputStaticUrl(isProduction),
                    });
                  } catch (error) {
                    loaderContext.emitError(error);

                    return content;
                  }
                  return res;
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
      // 友好的显示错误信息在终端
      new FriendlyErrorsWebpackPlugin(),
      // eslint
      eslintEnable &&
        new ESLintPlugin({
          extensions: ['js', 'jsx', 'ts', 'tsx'],
          emitError: false, // 发现的错误将始终发出，禁用设置为false.
          emitWarning: false, // 找到的警告将始终发出，禁用设置为false.
          failOnError: false, // 如果有任何错误，将导致模块构建失败，禁用设置为false
          failOnWarning: false, // 如果有任何警告，将导致模块构建失败，禁用设置为false
          cache: true,
          cacheLocation: resolveApp('./node_modules/.cache/.eslintcache'),
        }),
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
                // '**/index.html', // 忽略from目录下的index.html，它是入口文件
              ],
            },
          },
        ],
      }),
      // 定义全局变量
      new DefinePlugin({
        BASE_URL: `${JSON.stringify(outputStaticUrl(isProduction))}`, // public下的index.html里面的icon的路径
        'process.env': {
          NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
          PUBLIC_PATH: JSON.stringify(outputStaticUrl(isProduction)),
          VUE_APP_RELEASE_PROJECT_NAME: JSON.stringify(
            process.env.VUE_APP_RELEASE_PROJECT_NAME
          ),
          VUE_APP_RELEASE_PROJECT_ENV: JSON.stringify(
            process.env.VUE_APP_RELEASE_PROJECT_ENV
          ),
        },
      }),
      // 多页面配置
      ...htmlWebpackPlugins,
      // new HtmlWebpackInlineSourcePlugin(),
      // 注入项目信息
      new InjectProjectInfoPlugin({
        isProduction,
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

// 这个env会把webpack的一些变量注入进来，同时会把yarn start命令的--env参数带进来
export default (env) => {
  return new Promise((resolve) => {
    const isProduction = env.production;
    process.env.NODE_ENV = isProduction ? 'production' : 'development';
    const configPromise = Promise.resolve(
      isProduction ? prodConfig : devConfig
    );
    configPromise.then(
      (config: any) => {
        // 根据当前环境，合并配置文件
        const mergeConfig = merge(commonConfig(isProduction), config);
        console.log(
          chalkWARN(
            `根据当前环境，合并配置文件，当前是: ${process.env.NODE_ENV!}环境`
          )
        );
        resolve(mergeConfig);
      },
      (err) => {
        console.log(err);
      }
    );
  });
};
