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
      { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.scss$/, loader: "style!css!postcss-loader!sass" },
      { test: /\.(jpe?g|png|gif|svg|ico|cur)$/i, loader: 'file-loader?name=images/[name].[ext]'}

    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js']
  },
  postcss: function () {
    return [autoprefixer, csswring]
  }

};
