var webpack = require('webpack');  

var autoprefixer = require('autoprefixer-core');
var csswring     = require('csswring');

module.exports = {  
  entry: [
    'webpack/hot/only-dev-server',
    "./js/app.js"
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.scss$/, loader: "style!css!postcss-loader!sass" }    

    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  postcss: function () {
    return [autoprefixer, csswring]
  }

};
