var path = require('path');
 var webpack = require('webpack');

 module.exports = {
     entry: [
     'webpack-dev-server/client?http://localhost:8080',
     'webpack/hot/only-dev-server',
     './src/poly-synth.js'
     ],
     output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'poly-synth.js',
        library: 'Synth',
        libraryTarget: 'var'
     },
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['es2015']
                 }
             }
         ]
     },
     stats: {
         colors: true
     },
     node: {
        fs: "empty"
     },
     devServer: {
        contentBase: '.',
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
           $: "jquery",
           jQuery: "jquery"
       })
    ],
    devtool: 'source-map'
 };