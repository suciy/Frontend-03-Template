const path = require('path');

module.exports = {
  entry: './main.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'createElement' }]],
          },
        },
      },
    ],
  },
  mode: 'development',
  devServer: {
    port: 8080,
    hot: true,
    contentBase: path.join(__dirname, '/dist'),
    watchContentBase: true,
  },
};