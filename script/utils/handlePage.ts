import HtmlWebpackPlugin from 'html-webpack-plugin';

import pages from '../pageConfig';

export default (isProduction: boolean) => {
  const entry = {};
  const htmlWebpackPlugins: any[] = [];
  pages(isProduction).forEach((item) => {
    const name = item.name;
    entry[name] = item.entry;

    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        filename: `${name}.html`,
        publicPath: './',
        template: item.template,
        hash: item.hash,
        minify: item.minify,
        chunks: item.chunks,
      })
    );
  });

  return { entry, htmlWebpackPlugins };
};
