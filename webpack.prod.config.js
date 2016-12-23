const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './lib/client.js',

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, '/public'),
    filename: 'client.bundle.js',
  },

  devtool: 'source-map',

  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],

  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015'],
      },
    }],
  },
};
