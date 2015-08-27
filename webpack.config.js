var webpack = require('webpack');  

var autoprefixer = require('autoprefixer-core');
var csswring     = require('csswring');

module.exports = {  
  entry: [
    'webpack/hot/only-dev-server',
    "./src/js/app.js"
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['react-hot', 'babel']},
      { test: /\.js?$/, loaders: ['react-hot', 'babel-loader?stage=0'], exclude: /node_modules/ },
      { test: /\.scss$/, loader: "style!css!postcss-loader!sass" },
      { test: /\.(jpe?g|png|gif|svg|ico|cur)$/i, loader: 'file-loader?name=images/[name].[ext]'}
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devtool: '#source-map',
  postcss: function () {
    return [autoprefixer, csswring]
  }

};
