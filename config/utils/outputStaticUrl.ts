export const NODE_ENV = process.env.NODE_ENV;

export const outputStaticUrl = (isProduction = false) => {
  const dirName = process.env.H5_GAME_PROJECT_NAME;
  return !isProduction ? '/' : `/${dirName}/`;
};
