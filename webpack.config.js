var path = require('path');
var webpack = require('webpack');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;

var outputFile;

const plugins = [];

const entry = [];

const srcFile = './src/poly-synth.js';


if (env === 'build') {

    plugins.push(new webpack.DefinePlugin({
             'process.env.NODE_ENV': '"production"'
    }));

    plugins.push(new UglifyJsPlugin({ minimize: true }));

    outputFile = 'browser-synth.min.js';
    entry.push(srcFile);

} else {

    plugins.push(new webpack.HotModuleReplacementPlugin());


    entry.push('webpack-dev-server/client?http://localhost:8080');
    entry.push('webpack/hot/only-dev-server');
    entry.push(srcFile);

    outputFile = 'browser-synth.js';
}

 module.exports = {

     entry: entry,
     output: {
        path: path.resolve(__dirname, 'lib'),
        filename: outputFile,
        library: 'BrowserSynth',
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
    plugins: plugins,
    devtool: 'source-map'
 };