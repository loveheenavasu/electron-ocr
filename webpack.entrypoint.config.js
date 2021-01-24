const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  devtool: 'source-map',
  entry: './index.js',
  mode: 'development',
  output: {
    filename: 'index-bundle.js',
    // "electron ." -> electron checks package.json -> package.json is telling electron to use the file in static dir: "main": "static/index-bundle.js",
    path: path.resolve(__dirname, 'static')
  },
  module: {
    noParse: /iconv-loader\.js/,
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_compontents)/,
        use: ['babel-loader']
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      E2E_BUILD: false
    })
  ],
  target: 'electron-main',
  node: {
    // https://github.com/webpack/webpack/issues/1599#issuecomment-656218316
    __dirname: false
  },
  externals: [
    nodeExternals({
      whitelist: [/^(?!opencv4nodejs).*/i]
    })
  ]
}
