const { addDefault } = require('@babel/helper-module-imports');

function replaceLib() {
  const info = {
    libraryName: 'ant-design-vue',
  };
  const list = {};
  return {
    visitor: {
      CallExpression(path, state) {
        const { node } = path;

        const file =
          (path && path.hub && path.hub.file) || (state && state.file);

        node.arguments = node.arguments.map((arg) => {
          const { name: argName } = arg;
          let res1 = {};
          Object.keys(list).forEach((item) => {
            console.log(item, list[item], argName, 999);

            if (item === argName) {
              let res = addDefault(file.path, list[item], { nameHint: item });
              // let res = addNamed(file.path, item, list[item]);
              console.log(res, 777);
              res1 = res;
            }
          });
          if (Object.keys(res1).length) {
            return res1;
          }
          return arg;
        });
      },

      // 匹配import {bbb} from 'aaa'
      ImportDeclaration(path, state) {
        // console.log(path.node.source?.value, 'path.node.source ');
        const { node } = path;
        // console.log(node, path.remove, 888);
        // path maybe removed by prev instances.
        if (!node) return;

        const { value } = node.source; // 这个value是aaa
        const { libraryName } = info;
        if (value === libraryName) {
          console.log('-----', value);
          node.specifiers.forEach((spec) => {
            console.log(spec.local.name, 123);
            // path.node.source.value = `ant-design-vue/lib/${spec.local.name}`;
            list[
              spec.local.name
            ] = `ant-design-vue/lib/${spec.local.name.toLocaleLowerCase()}`;
            !path.removed && path.remove();
          });
          // pluginState.pathsToRemove.push(path);
          console.log(list, '----');
        }

        console.log('=====ImportDeclaration=====');
      },
    },
  };
}

module.exports = replaceLib;
