# 简介

> 在不使用框架开发项目的情况下，可以提供开箱即用、支持配置多页面的项目模板

- [x] 使用 webpack5 + gulp4 构建，支持开发热更新
- [x] 支持 typescript
- [x] js 和 css 处理：babel + postcss
- [x] css 预处理器： scss
- [x] 提交规范：husky + commitizen + lint-staged
- [x] 代码规范：eslint + prettier
- [x] 插件内置：zepto.js + postcss-px-to-viewport

# 使用

> 在大多数情况下，你只需要关注 config 目录里的 pageConfig.ts 即可，如果你希望拥有更高的自由度，可以直接修改 config 目录 里面的配置以达到你的需求。

config/pageConfig.ts：

```typescript
{
    name: 'index', // 这个页面的块（chunk）名
    template: path.resolve(__dirname, '../src/page/index.html'), // 这个页面的html文件位置
    entry: path.resolve(__dirname, '../src/page/index.ts'), // 这个页面的ts文件入口
    hash: true,
    minify,
    chunks: ['index'],
  },
  {
    name: 'home', // 这个页面的块（chunk）名
    template: path.resolve(__dirname, '../src/page/home/home.html'), // 这个页面的html文件位置
    entry: path.resolve(__dirname, '../src/page/home/home.ts'), // 这个页面的ts文件入口
    hash: true,
    minify,
    chunks: ['home'],
    // chunks: ['home', 'index'], // 如果设置['home', 'index']，那么index的逻辑也会加到home页面
  },
  {
    name: 'about',
    template: path.resolve(__dirname, '../src/page/about/index.html'), // 这个页面的html文件位置
    entry: path.resolve(__dirname, '../src/page/about/index.ts'), // 这个页面的ts文件入口
    hash: true,
    minify,
    chunks: ['about'], // 限制块，如果希望about页面不和其他页面关联，就设置about
  },
```

# 安装依赖

```sh
pnpm install
```

# 项目启动

```sh
pnpm run start
```

# 项目打包

最终打包生成的目录：`dist`

> 注意：如果你希望打包的 js、css 兼容不同浏览器等，请修改对应的: postcss.config.js、babel.config.js、.browserslistrc 文件！

```sh
pnpm run build
```

# 内联打包

将所有外部 js 和 css 都注入到 html 里面，最终打包生成的目录：`inlineDist`

```sh
pnpm run gulp:replace
```

# 内联打包

将符合条件的外部js 和 css 都注入到 html 里面，最终打包生成的目录：`inlineDist`

```sh
pnpm run gulp:build
```

# 提交代码

```sh
pnpm run cz
```

# 更新版本

```sh
pnpm run release
# 更新指定版本号
pnpm run release -- --release-as 1.0.0
```

# 注意点

a.js：

```js
console.log(document.getElementById('app'), 'aaa');
```

b.js:

```js
console.log(document.getElementById('app'), 'bbb');
```

a.html：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="X-UA-Compatible"
      content="IE=edge"
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Document</title>

    <script>
      console.log(document.getElementById('app')); //null
    </script>

    <script defer>
      console.log(document.getElementById('app')); //null
    </script>

    <!-- b.js打印：null 'bbb' -->
    <script src="b.js"></script>

    <!-- a.js打印：<div id="app"></div> 'aaa' -->
    <script
      defer
      src="a.js"
    ></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

从结果看出，script 只有加上了 defer 标识以及使用了 src 链接外部 js，才是会异步的执行。一般的客户端渲染比如 vue，官方的 vuecli 的做法是将所有脚本加上 defer 标识然后挂载到 head 标签里的，这种行为其实对于客户端渲染来说没问题，因为都是延迟执行，放 head 标签的话还可以尽快解析然后尽快的加载。

但是如果我们的没有使用 vue 之类的客户端渲染框架，而是使用原生 js 写的一些很小的项目，我们就希望我们的我们的 html 页面包含所有样式和脚本，因为项目足够小，将所有样式和脚本放 html 里面，只要加载一个 html 页面，就能显示完整的内容，而不需要额外的通过 link 和 script 标签请求外部的样式和脚本，因为项目小，可能拆出去的脚本和样式就几 k，那么还不如将他们直接塞入到 html 页面里面，这样还能减少网络请求。

> 将**html-webpack-plugin** 插件的 inject 的值设置为 body，否则默认是将 script 注入到 head 里面的
