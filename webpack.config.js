var webpack = require('webpack');

module.exports = {
  context: __dirname + '/src',
  entry  : {
    app   : './index.js',
    vendor: [ 'angular' ]
  },
  output : {
    path    : __dirname + '/dist',
    filename: 'app.bundle.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  ],
  module : {
    preLoaders: [
      {
        test  : /\.js$/,
        loader: 'baggage?[file].html&[file].css&[file].less'
      }
    ],
    loaders   : [
      { test: /\.js$/, loader: 'ng-annotate!babel?presets[]=es2015', exclude: /node_modules/ },
      { test: /\.html$/, loader: 'ngtemplate?relativeTo=' + __dirname + '/!html' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style!css' }
    ]
  }
};