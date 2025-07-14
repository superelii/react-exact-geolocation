// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/useGetGeolocation.js',
  resolve: {
    alias: {
      'react-exact-geolocation': path.resolve(__dirname, 'node_modules/react-exact-geolocation/src')
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'useGetGeolocation.js',
    library: 'useGetGeolocation',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  }
};