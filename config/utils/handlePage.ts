import HtmlWebpackPlugin from 'html-webpack-plugin';

import { pages } from '../pageConfig';

export const generatePageConfig = (isProduction: boolean) => {
  let entry = {};
  let htmlWebpackPlugins: any[] = [];
  pages(isProduction).forEach((item) => {
    let name = item.name;
    entry[name] = item.entry;

    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        filename: name + '.html',
        template: item.template,
        hash: item.hash,
        minify: item.minify,
        chunks: item.chunks,
      })
    );
  });

  return { entry, htmlWebpackPlugins };
};
