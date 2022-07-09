# 简介

> 主要方便在使用原生 js 开发项目时提高开发体验

- [x] 使用 webpack5 构建（内置了 babel 和 postcss 处理 js 和 css）
- [x] 支持热更新
- [x] 支持 typescript
- [x] 支持 scss
- [x] 插件内置：zepto.js + postcss-px-to-viewport
- [x] 提交规范：husky + commitizen + lint-staged
- [x] 代码规范： eslint + prettier

# 使用

目前只支持单页面，public 目录里的 index.html 是模板，在这里编写 html 的代码即可，业务逻辑在
src 里面的 main.ts 进行编写，样式也在 main.ts 里面引用即可。

## 安装依赖

```sh
yarn install
```

## 项目启动

```sh
yarn start
```

## 项目打包

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
```
