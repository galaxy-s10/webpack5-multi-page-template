import HtmlWebpackPlugin from 'html-webpack-plugin';

import { outputStaticUrl } from '../constant';
import pages from '../pageConfig';

export default (isProduction: boolean) => {
  const entry = {};
  const htmlWebpackPlugins: any[] = [];
  pages(isProduction).forEach((item) => {
    const name = item.name;
    entry[name] = item.entry;

    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        inject: 'body',
        filename: `${name}.html`,
        // 如果HtmlWebpackPlugin配置了publicPath,就以HtmlWebpackPlugin的publicPath为准,
        // 如果HtmlWebpackPlugin没有配置publicPath,默认使用output.publicPath
        publicPath: outputStaticUrl(isProduction),
        template: item.template,
        hash: item.hash,
        minify: item.minify,
        chunks: item.chunks,
      })
    );
  });

  return { entry, htmlWebpackPlugins };
};
