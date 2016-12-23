/**
 * Entry point for development
 */

require('node-env-file')(`${__dirname}/.env`);

const path = require('path');
const server = require('./lib/server');
const Hapi = require('hapi');
const Webpack = require('webpack');
const HapiWebpackPlugin = require('hapi-webpack-plugin');

const webpackServer = new Hapi.Server();
webpackServer.connection({ port: 3000 });

const compiler = new Webpack({
  entry: './lib/client.js',
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'client.bundle.js',
    publicPath: '/public/',
  },
  devtool: 'cheap-eval-source-map',
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoErrorsPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loaders: ['react-hot', 'babel-loader?presets[]=react,presets[]=es2015'],
      exclude: /node_modules/,
    }],
  },
});

webpackServer.register([{
  register: HapiWebpackPlugin,
  options: { compiler, assets: {}, hot: { dynamicPublicPath: true } },
}], (error) => {
  if (error) {
    return console.error(error);
  }
  return webpackServer.start((serverErr) => {
    if (serverErr) {
      throw serverErr;
    }
    console.log('Server running at:', webpackServer.info.uri);
  });
});

server.start();
