# 简介

> 在不使用框架开发项目的情况下，可以提供开箱即用、支持配置多页面的项目模板

- [x] 使用 webpack5 构建，支持开发热更新
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
  name: 'index', // 这个页面的块（chunk）名，最终也是路径名（localhost:8000/index.html）
  template: path.resolve(__dirname, '../src/page/index.html'), // 这个页面的html文件位置
  entry: path.resolve(__dirname, '../src/page/index.ts'), // 这个页面的ts文件入口
  chunks: ['index'],// 这个页面使用的chunks
},
{
  name: 'home', // 这个页面的块（chunk）名，最终也是路径名（localhost:8000/home.html）
  template: path.resolve(__dirname, '../src/page/home/home.html'), // 这个页面的html文件位置
  entry: path.resolve(__dirname, '../src/page/home/home.ts'), // 这个页面的ts文件入口
  chunks: ['home', 'index'], // 如果设置['home', 'index']，那么index的逻辑也会加到home页面
},
```

## 安装依赖

```sh
yarn install
```

## 项目启动

> 默认端口 8000，如果 8000 端口被占用了，会自动递增+1

```sh
yarn start
```

## 项目打包

> 注意：如果你希望打包的 js、css 兼容不同浏览器等，请修改对应的: postcss.config.js、babel.config.js、.browserslistrc 文件！

```sh
yarn build
```

## 提交代码

```sh
yarn cz
```

## 更新版本

```sh
yarn release
# 更新指定版本号
yarn release -- --release-as 1.0.0
```
