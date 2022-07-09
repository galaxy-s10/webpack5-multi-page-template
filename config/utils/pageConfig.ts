import path from 'path';
export const pages = [
  {
    name: 'home',
    template: path.resolve(__dirname, '../../src/page/home/home.html'),
    entry: path.resolve(__dirname, '../../src/page/home/home.ts'),
  },
  // {
  //   name: 'about',
  //   template: 'about/about.html',
  //   entry: 'about/about.js',
  // },
];
