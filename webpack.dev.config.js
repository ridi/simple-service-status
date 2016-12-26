const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    //'webpack-dev-server/client?http://localhost:8080/',
    //'webpack/hot/only-dev-server',
    'webpack-hot-middleware/client',
    './lib/client.js',
  ],

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, '/public'),
    filename: 'client.bundle.js',
    publicPath: '/public/',
  },

  devtool: 'cheap-eval-source-map',

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],

  module: {
    loaders: [{
      test: /\.jsx$/,
      loaders: ['react-hot', 'babel-loader?presets[]=react,presets[]=es2015'],
      exclude: /node_modules/,
    }],
  },

  hot: {
    dynamicPublicPath: true,
    reload: true,
  },
};
