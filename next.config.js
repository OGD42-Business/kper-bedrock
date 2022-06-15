const withPrismaPlugin = require("next-prisma-plugin-webpack5");

module.exports = withPrismaPlugin({
  webpackDevMiddleware: (config) => {
    if (process.env.IS_DOCKER) {
      // "next dev" in Docker doesn't reliably pick up file changes, so we need to enable polling
      // see https://github.com/vercel/next.js/issues/6417 and https://webpack.js.org/configuration/watch/
      config.watchOptions = {
        ...config.watchOptions,
        poll: 500,
      };
    }
    return config;
  },
});
