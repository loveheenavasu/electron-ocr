const path = require('path')
const webpack = require('webpack')

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const smp = new SpeedMeasurePlugin()
/**
 * @type webpack.Configuration
 */
const config = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    main: [
      '@babel/polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      './app/main.js'
    ]  
  },
  mode: 'development',
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_compontents)/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(js)$/,
        use: 'react-hot-loader/webpack',
        include: /node_modules/
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  devServer: {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
    hot: true
  },
  target: 'electron-renderer',

  watchOptions: {
    poll: 1000,
    ignored: ['node_modules/**'],
    aggregateTimeout: 600
  }
}
module.exports = smp.wrap(config)