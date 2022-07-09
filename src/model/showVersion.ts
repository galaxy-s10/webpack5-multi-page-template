const name = process.env.H5_GAME_PROJECT_NAME;
const lastBuildTime = process.env.H5_GAME_PROJECT_LASTBUNDLE_TIME;
const version = process.env.H5_GAME_PROJECT_VERSION;

export const showVersion = () => {
  console.log(
    `项目名：${name}\n版本：${version}\n最后构建时间：${lastBuildTime}`
  );
};
