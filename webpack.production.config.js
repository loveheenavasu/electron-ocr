const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const rules = [
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
  }
]

const plugins = [
  new webpack.NamedModulesPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
]
const externals = [
  nodeExternals({
    whitelist: [/^(?!opencv4nodejs).*/i]
  })
]

const noParse = /iconv-loader\.js/

module.exports = [
  {
    entry: {
      index: ['@babel/polyfill', './index.js']
    },
    mode: 'production',
    output: {
      filename: '[name]-bundle.js',
      path: path.resolve(__dirname, 'static'),
      publicPath: '/static/'
    },
    module: {
      rules,
      noParse
    },
    plugins,
    target: 'electron-main',
    node: {
      // https://github.com/webpack/webpack/issues/1599#issuecomment-656218316
      __dirname: false
    },
    externals
  },
  {
    devtool: 'source-map',
    entry: {
      main: ['@babel/polyfill', './app/main.js']
    },
    mode: 'production',
    output: {
      filename: '[name]-bundle.js',
      path: path.resolve(__dirname, 'static'),
      publicPath: '/static/'
    },
    module: {
      rules,
      noParse
    },
    plugins,
    target: 'electron-renderer',
    externals
  }
]
