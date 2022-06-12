/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const { alias, configPaths } = require('react-app-rewire-alias');
const path = require('path');
const webpack = require('webpack');

// const aliasMap = configPaths('./tsconfig.paths.json'); // or jsconfig.paths.json
module.exports = function override(config, env) {
  // do stuff with the webpack config...
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    buffer: require.resolve('buffer/'),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  config.resolve.alias = Object.assign(config.resolve.alias, {
    '@src': path.resolve(`${__dirname}/src/`),
  });
  return config;
};
// module.exports = alias(aliasMap);
