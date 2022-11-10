console.log(
  '\x1B[0;37;44m INFO \x1B[0m',
  '\x1B[0;;34m ' +
    `读取了: ${__filename.slice(__dirname.length + 1)}` +
    ' \x1B[0m'
);

module.exports = {
  plugins: [
    'postcss-preset-env',
    [
      'postcss-px-to-viewport',
      {
        unitToConvert: 'px',
        viewportWidth: 360,
        unitPrecision: 5, // 转化为vw后保留的小数点位
        propList: ['*'],
        viewportUnit: 'vw',
        fontViewportUnit: 'vw',
        selectorBlackList: ['ignore-'], // 不转化以ignore-开头的样式
        minPixelValue: 1,
        mediaQuery: false,
        replace: true,
        exclude: undefined,
        include: undefined,
        landscape: false,
        landscapeUnit: 'vw',
        landscapeWidth: 568,
      },
    ],
    // [
    //   'postcss-plugin-px2rem',
    //   {
    //     rootValue: 100, // 注意要和src目录下的lib-flexible的rootValue一致
    //     unitPrecision: 5, // 转化为rem后保留的小数点位
    //     propWhiteList: [],
    //     propBlackList: [],
    //     exclude: false,
    //     selectorBlackList: ['ignore-'], // 不转化以ignore-开头的样式
    //     ignoreIdentifier: false,
    //     replace: true,
    //     mediaQuery: false,
    //     minPixelValue: 0,
    //   },
    // ],
  ],
};
